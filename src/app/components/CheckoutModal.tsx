"use client";

import React, { useRef, useEffect, useState } from "react";
import { X, User, Phone, Home, Upload, UploadCloud, CreditCard } from "lucide-react";

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  prescription?: File | null;
  deliveryOption: "express" | "timeframe" | "pickup" | "" | "nil";
  pickupLocation: string;
  deliveryAddress: string;
  timeSlot: "12 PM" | "4 PM" | "9 PM" | "6 AM" | "" | "nil";
  isUIAddress: boolean;
}

interface CheckoutModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  customerInfo: CustomerInfo;
  setCustomerInfo: (info: CustomerInfo) => void;
  cartTotal: number;
  deliveryFee: number;
  grandTotal: number;
  estimatedDelivery: string;
  isProcessing: boolean;
  isPaystackLoaded: boolean;
  initializePayment: (customerInfo: CustomerInfo) => void; // Updated to accept customerInfo
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  setIsOpen,
  customerInfo,
  setCustomerInfo,
  cartTotal,
  deliveryFee,
  grandTotal,
  estimatedDelivery,
  isProcessing,
  isPaystackLoaded,
  initializePayment,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [addressError, setAddressError] = useState<string>("");

  // Predefined delivery areas
  const deliveryAreas = ["UCH", "Bodija", "Orogun", "Basorun", "University of Ibadan"];

  // Pickup locations for timeframe and pickup options
  const uiPickupLocations = [
    "School Gate",
    "Tedder",
    "Zik",
    "Tech TLT",
    "Social Sciences",
    "Law",
    "Education LLLT",
    "Awo Junction",
    "Amina Way",
    "Abadina",
    "Benue Road",
    "SUB",
    "Saint Annes",
  ];
  const uchPickupLocations = ["ABH", "First Gate", "Second Gate", "UCH School"];
  const storeLocation = "Store (1 Fadare Close, Iwo Road)";

  // Function to determine the next delivery slot based on current time
  const getNextDeliverySlot = (): "12 PM" | "4 PM" | "9 PM" | "6 AM" => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTimeInMinutes = hours * 60 + minutes;

    // Define time slots in minutes since midnight
    const slots = [
      { time: "12 PM", minutes: 12 * 60 }, // 12:00 PM
      { time: "4 PM", minutes: 16 * 60 }, // 4:00 PM
      { time: "9 PM", minutes: 21 * 60 }, // 9:00 PM
      { time: "6 AM", minutes: 6 * 60 }, // 6:00 AM (next day)
    ];

    // Apply 30-minute buffer
    for (const slot of slots) {
      if (currentTimeInMinutes < slot.minutes - 30) {
        return slot.time as "12 PM" | "4 PM" | "9 PM" | "6 AM";
      }
    }

    // If after 8:30 PM (21:00 - 30 min), roll over to 6 AM next day
    return "6 AM";
  };

  // Automatically set time slot for timeframe delivery
  useEffect(() => {
    if (customerInfo.deliveryOption === "timeframe" && !customerInfo.timeSlot) {
      const nextSlot = getNextDeliverySlot();
      setCustomerInfo({ ...customerInfo, timeSlot: nextSlot });
    }
  }, [customerInfo.deliveryOption, customerInfo.timeSlot, setCustomerInfo]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node) &&
        !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, setIsOpen]);

  const handleDeliveryAreaChange = (area: string) => {
    const isUIAddress = area === "University of Ibadan" || area === "UCH";
    setCustomerInfo({
      ...customerInfo,
      deliveryAddress: area || "nil",
      isUIAddress,
      deliveryOption: isUIAddress ? customerInfo.deliveryOption : "express",
      pickupLocation: "nil",
      timeSlot: isUIAddress ? customerInfo.timeSlot : "nil",
    });
    setAddressError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Sanitize all fields to ensure no empty values
    const sanitizedCustomerInfo: CustomerInfo = {
      name: customerInfo.name || "nil",
      email: customerInfo.email || "nil",
      phone: customerInfo.phone || "nil",
      prescription: customerInfo.prescription || null,
      deliveryOption: customerInfo.deliveryOption || "nil",
      pickupLocation: customerInfo.pickupLocation || "nil",
      deliveryAddress: customerInfo.deliveryAddress || "nil",
      timeSlot: customerInfo.timeSlot || "nil",
      isUIAddress: customerInfo.isUIAddress,
    };

    // Validate required fields
    if (
      sanitizedCustomerInfo.name !== "nil" &&
      sanitizedCustomerInfo.email !== "nil" &&
      sanitizedCustomerInfo.phone !== "nil" &&
      sanitizedCustomerInfo.deliveryOption !== "nil" &&
      (sanitizedCustomerInfo.deliveryOption === "pickup"
        ? sanitizedCustomerInfo.pickupLocation !== "nil"
        : sanitizedCustomerInfo.deliveryAddress !== "nil") &&
      (sanitizedCustomerInfo.deliveryOption === "timeframe" ? sanitizedCustomerInfo.timeSlot !== "nil" : true)
    ) {
      // Log sanitized data for debugging
      console.log("Submitting Customer Info:", {
        ...sanitizedCustomerInfo,
        isUIAddress: sanitizedCustomerInfo.isUIAddress ? "true" : "false",
      });

      // Update state for consistency
      setCustomerInfo(sanitizedCustomerInfo);

      // Pass sanitized data directly to initializePayment
      initializePayment(sanitizedCustomerInfo);
    } else {
      alert("Please fill in all required fields, including delivery option, area or pickup location, and time slot (if applicable).");
    }
  };

  const handlePrescriptionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        alert("Please upload a JPEG, PNG, or PDF file.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB.");
        return;
      }
      setCustomerInfo({ ...customerInfo, prescription: file });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl transform transition-all"
      >
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Complete Your Order</h2>
              <p className="text-sm text-gray-600 mt-1">Fill in your details to proceed with payment</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-full active:scale-95 transition-transform"
              aria-label="Close checkout modal"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-5">
              <div className="bg-gray-50 p-4 rounded-xl">
                <label className="block text-sm font-medium mb-2 text-gray-700 flex items-center">
                  <User size={18} className="mr-2 text-red-500" />
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerInfo.name}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 bg-gray-100 cursor-not-allowed"
                  aria-label="Full name"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <label className="block text-sm font-medium mb-2 text-gray-700 flex items-center">
                  <User size={18} className="mr-2 text-red-500" />
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={customerInfo.email}
                  readOnly
                  className="w-full p-3 border border-gray-300 rounded-lg text-gray-800 bg-gray-100 cursor-not-allowed"
                  aria-label="Email address"
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <label className="block text-sm font-medium mb-2 text-gray-700 flex items-center">
                  <Phone size={18} className="mr-2 text-red-500" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value || "nil" })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-800 bg-white"
                  placeholder="Enter your phone number"
                  aria-label="Phone number"
                />
              </div>
            </div>

            <div className="space-y-5">
              <div className="bg-gray-50 p-4 rounded-xl">
                <label className="block text-sm font-medium mb-2 text-gray-700 flex items-center">
                  <Home size={18} className="mr-2 text-red-500" />
                  Delivery Area *
                </label>
                <select
                  required={customerInfo.deliveryOption !== "pickup"}
                  value={customerInfo.deliveryAddress}
                  onChange={(e) => handleDeliveryAreaChange(e.target.value)}
                  disabled={customerInfo.deliveryOption === "pickup"}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-800 bg-white appearance-none"
                  aria-label="Delivery area"
                >
                  <option value="" disabled>
                    Select a delivery area
                  </option>
                  {deliveryAreas.map((area) => (
                    <option key={area} value={area}>
                      {area}
                    </option>
                  ))}
                </select>
                {customerInfo.deliveryOption === "express" && customerInfo.deliveryAddress && customerInfo.deliveryAddress !== "nil" && (
                  <p className="text-sm text-gray-600 mt-2">
                    Our rider will contact you to confirm your exact location in {customerInfo.deliveryAddress}.
                  </p>
                )}
                {addressError && <p className="text-sm text-red-600 mt-2">{addressError}</p>}
              </div>

              <div className="bg-gray-50 p-4 rounded-xl">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Delivery Option * (Fee: {customerInfo.deliveryOption === "express" ? "₦1,500" : customerInfo.deliveryOption === "timeframe" ? (cartTotal >= 5000 ? "Free" : "₦500") : customerInfo.deliveryOption === "pickup" ? "Free" : "Select an option"})
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:border-red-300 cursor-pointer">
                    <input
                      type="radio"
                      id="express"
                      name="deliveryOption"
                      value="express"
                      checked={customerInfo.deliveryOption === "express"}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          deliveryOption: e.target.value as "express",
                          pickupLocation: "nil",
                          timeSlot: "nil",
                          deliveryAddress: customerInfo.deliveryAddress || "nil",
                        })
                      }
                      className="h-4 w-4 text-red-600 focus:ring-red-500"
                      aria-label="Express delivery"
                    />
                    <div className="ml-3">
                      <span className="block text-sm font-medium text-gray-800">Express Delivery</span>
                      <span className="block text-xs text-gray-500">Within 1 hour (₦1,500)</span>
                    </div>
                  </label>
                  {customerInfo.isUIAddress && (
                    <>
                      <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:border-red-300 cursor-pointer">
                        <input
                          type="radio"
                          id="timeframe"
                          name="deliveryOption"
                          value="timeframe"
                          checked={customerInfo.deliveryOption === "timeframe"}
                          onChange={(e) =>
                            setCustomerInfo({
                              ...customerInfo,
                              deliveryOption: e.target.value as "timeframe",
                              pickupLocation: "nil",
                              deliveryAddress: customerInfo.deliveryAddress || "nil",
                              timeSlot: getNextDeliverySlot(),
                            })
                          }
                          className="h-4 w-4 text-red-600 focus:ring-red-500"
                          aria-label="Timeframe delivery"
                        />
                        <div className="ml-3">
                          <span className="block text-sm font-medium text-gray-800">Timeframe Delivery</span>
                          <span className="block text-xs text-gray-500">{cartTotal >= 5000 ? "Free (12 PM, 4 PM, 9 PM, 6 AM)" : "₦500 (12 PM, 4 PM, 9 PM, 6 AM)"}</span>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:border-red-300 cursor-pointer">
                        <input
                          type="radio"
                          id="pickup"
                          name="deliveryOption"
                          value="pickup"
                          checked={customerInfo.deliveryOption === "pickup"}
                          onChange={(e) =>
                            setCustomerInfo({
                              ...customerInfo,
                              deliveryOption: e.target.value as "pickup",
                              timeSlot: "nil",
                              deliveryAddress: "nil",
                              pickupLocation: "nil",
                            })
                          }
                          className="h-4 w-4 text-red-600 focus:ring-red-500"
                          aria-label="Pickup"
                        />
                        <div className="ml-3">
                          <span className="block text-sm font-medium text-gray-800">Pickup</span>
                          <span className="block text-xs text-gray-500">Free (At store or UI/UCH location)</span>
                        </div>
                      </label>
                    </>
                  )}
                </div>
                {estimatedDelivery && customerInfo.deliveryOption !== "pickup" && customerInfo.deliveryOption !== "nil" && (
                  <p className="text-sm text-gray-600 mt-3 bg-red-50 p-2 rounded-md">
                    <span className="font-medium">Estimated Delivery:</span> {estimatedDelivery}
                  </p>
                )}
              </div>

              {customerInfo.isUIAddress && customerInfo.deliveryOption === "timeframe" && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block text-sm font-medium mb-2 text-gray-700 flex items-center">
                    <Home size={18} className="mr-2 text-red-500" />
                    Delivery Time Slot *
                  </label>
                  <select
                    required
                    value={customerInfo.timeSlot}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        timeSlot: e.target.value as "12 PM" | "4 PM" | "9 PM" | "6 AM" | "nil",
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-800 bg-white appearance-none"
                    aria-label="Delivery time slot"
                  >
                    <option value="" disabled>
                      Select a time slot
                    </option>
                    {["12 PM", "4 PM", "9 PM", "6 AM"].map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(customerInfo.isUIAddress || customerInfo.deliveryOption === "pickup") && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block text-sm font-medium mb-2 text-gray-700 flex items-center">
                    <Home size={18} className="mr-2 text-red-500" />
                    {customerInfo.deliveryOption === "pickup" ? "Pickup Location *" : "Dropoff Location *"}
                  </label>
                  <select
                    required
                    value={customerInfo.pickupLocation}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, pickupLocation: e.target.value || "nil" })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-800 bg-white appearance-none"
                    aria-label={customerInfo.deliveryOption === "pickup" ? "Pickup location" : "Dropoff location"}
                  >
                    <option value="" disabled>
                      Select a {customerInfo.deliveryOption === "pickup" ? "pickup" : "dropoff"} location
                    </option>
                    {customerInfo.deliveryOption === "pickup" && <option value={storeLocation}>{storeLocation}</option>}
                    {customerInfo.deliveryAddress === "University of Ibadan" &&
                      uiPickupLocations.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    {customerInfo.deliveryAddress === "UCH" &&
                      uchPickupLocations.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-black">
                <span>Subtotal:</span>
                <span>₦{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-black">
                <span>Delivery Fee:</span>
                <span>
                  {customerInfo.deliveryOption && customerInfo.deliveryOption !== "nil"
                    ? customerInfo.deliveryOption === "express"
                      ? "₦1,500"
                      : customerInfo.deliveryOption === "pickup"
                      ? "Free"
                      : cartTotal >= 5000
                      ? "Free"
                      : "₦500"
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between text-2xl font-bold text-red-600">
                <span>Total:</span>
                <span>₦{grandTotal.toLocaleString()}</span>
              </div>
            </div>
            <button
              type="submit"
              disabled={isProcessing || !isPaystackLoaded || !!addressError}
              className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-4 rounded-xl font-bold hover:from-red-700 hover:to-red-600 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-red-200"
              aria-label="Proceed to payment"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing Payment...
                </>
              ) : (
                <>
                  <CreditCard size={20} className="mr-2" />
                  Pay ₦{grandTotal.toLocaleString()} with Paystack
                </>
              )}
            </button>
            <p className="text-xs text-center text-gray-500 mt-3">
              Your personal data will be used to process your order and for other purposes described in our privacy policy.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;