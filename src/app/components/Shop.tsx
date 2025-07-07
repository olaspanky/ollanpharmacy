"use client";

import React, { useState, useRef, useEffect, useReducer } from "react";
import { ShoppingCart, Plus, Minus, X, CreditCard, MapPin, Phone, User, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import logo from "../../../public/ollogo.svg";
import { useAuth } from "../../context/AuthContext";
import { Product, Cart, CartItem } from "../../types";
import { useRouter } from "next/navigation";
import api from "@/src/lib/api";

// Paystack type declaration
interface PaystackPop {
  setup: (config: {
    key: string;
    email: string;
    amount: number;
    currency: string;
    ref: string;
    metadata?: {
      custom_fields: Array<{
        display_name: string;
        variable_name: string;
        value: string;
      }>;
    };
    callback: (response: any) => void;
    onClose: () => void;
  }) => { openIframe: () => void };
}

declare global {
  interface Window {
    PaystackPop: PaystackPop;
  }
}

// Cart reducer
type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "SET_CART"; payload: CartItem[] }
  | { type: "CLEAR_CART" };

const cartReducer = (state: CartItem[], action: CartAction): CartItem[] => {
  switch (action.type) {
    case "ADD_ITEM":
      const existingItem = state.find((item) => item.productId._id === action.payload.productId._id);
      if (existingItem) {
        return state.map((item) =>
          item.productId._id === action.payload.productId._id
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      }
      return [...state, action.payload];
    case "REMOVE_ITEM":
      return state.filter((item) => item.productId._id !== action.payload);
    case "UPDATE_QUANTITY":
      if (action.payload.quantity <= 0) {
        return state.filter((item) => item.productId._id !== action.payload.id);
      }
      return state.map((item) =>
        item.productId._id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
    case "SET_CART":
      return action.payload;
    case "CLEAR_CART":
      return [];
    default:
      return state;
  }
};

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  prescription?: File | null;
}

const PharmacyApp: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>("All Category");
  const [cart, cartDispatch] = useReducer(cartReducer, []);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isQuantityModalOpen, setIsQuantityModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    prescription: null,
  });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [orderComplete, setOrderComplete] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(["All Category"]);

  // Fetch products and categories
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await api.get("/api/products");
        setProducts(data);
        const uniqueCategories = [
          "All Category",
          ...new Set(data.map((product: Product) => product.category).filter(Boolean)),
        ] as string[];
        setCategories(uniqueCategories);
      } catch (error: any) {
        console.error("Error fetching products:", error.message || "Unknown error");
      }
    };

    const fetchCart = async () => {
      if (user) {
        try {
          const { data } = await api.get("/api/cart");
          cartDispatch({ type: "SET_CART", payload: data.items || [] });
        } catch (error: any) {
          console.error("Error fetching cart:", error.message || "Unknown error");
        }
      }
    };

    fetchProducts();
    fetchCart();
  }, [user]);

  // Filter products based on category and search
  const filteredProducts =
    selectedCategory === "All Category"
      ? products
      : products.filter((product) => product.category === selectedCategory);

  const searchedProducts = searchQuery
    ? filteredProducts.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredProducts;

  // Define sections
  const popularProducts = searchedProducts.filter((product) =>
    [1, 4, 7, 8, 15].includes(Number(product._id))
  ); // Adjust IDs as needed
  const otcProducts = searchedProducts.filter((product) =>
    ["Pain reliever", "Vitamins and Supplements", "Baby care", "Anti Malaria"].includes(
      product.category || ""
    )
  );
  const allProducts = searchedProducts;

  // Calculate cart totals
  const cartTotal = cart.reduce((total, item) => total + item.productId.price * item.quantity, 0);
  const deliveryFee = cartTotal > 0 ? 1000 : 0;
  const grandTotal = cartTotal + deliveryFee;

  // Handle add to cart
  const openQuantityModal = (product: Product) => {
    if (!user) {
      alert("Please sign in to add items to cart");
      router.push("/signin");
      return;
    }
    setSelectedProduct(product);
    setQuantity(1);
    setIsQuantityModalOpen(true);
  };

  const handleAddToCart = async () => {
    if (selectedProduct && quantity > 0) {
      try {
        const { data } = await api.post("/api/cart/add", {
          productId: selectedProduct._id,
          quantity,
        });
        cartDispatch({
          type: "ADD_ITEM",
          payload: { productId: selectedProduct, quantity },
        });
        setIsQuantityModalOpen(false);
        setSelectedProduct(null);
        setQuantity(1);
      } catch (error: any) {
        alert("Error: " + (error.message || "Failed to add to cart"));
      }
    }
  };

  // Paystack integration
  const initializePayment = async () => {
    if (!user) {
      alert("Please sign in to proceed with checkout");
      router.push("/signin");
      return;
    }

    setIsProcessing(true);

    // Upload prescription if provided
    let prescriptionUrl = "";
    if (customerInfo.prescription) {
      const formData = new FormData();
      formData.append("prescription", customerInfo.prescription);
      try {
        const res = await fetch("https://ollanbackend.vercel.app/api/orders/upload-prescription", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to upload prescription");
        }
        prescriptionUrl = data.prescriptionUrl;
      } catch (error: any) {
        setIsProcessing(false);
        alert("Error uploading prescription: " + (error.message || "Unknown error"));
        return;
      }
    }

    // Create order in backend
    try {
      const { data } = await api.post("/api/orders/create", {
        customerInfo,
        prescriptionUrl,
      });
      const orderId = data.order._id;

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_your_public_key_here",
        email: customerInfo.email,
        amount: grandTotal * 100, // Paystack expects amount in kobo
        currency: "NGN",
        ref: `OLLAN_${orderId}_${Math.floor(Math.random() * 1000000000 + 1)}`,
        metadata: {
          custom_fields: [
            {
              display_name: "Customer Name",
              variable_name: "customer_name",
              value: customerInfo.name,
            },
            {
              display_name: "Phone Number",
              variable_name: "phone_number",
              value: customerInfo.phone,
            },
            {
              display_name: "Delivery Address",
              variable_name: "delivery_address",
              value: `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state}`,
            },
            {
              display_name: "Prescription Uploaded",
              variable_name: "prescription_uploaded",
              value: prescriptionUrl ? "Yes" : "No",
            },
          ],
        },
        callback: async (response: any) => {
          try {
            const { data } = await api.post("/api/orders/verify-payment", {
              reference: response.reference,
              orderId,
            });
            setIsProcessing(false);
            setOrderComplete(true);
            cartDispatch({ type: "CLEAR_CART" });
            setIsCheckoutOpen(false);
            setCustomerInfo({
              name: "",
              email: "",
              phone: "",
              address: "",
              city: "",
              state: "",
              prescription: null,
            });
          } catch (error: any) {
            alert("Error verifying payment: " + (error.message || "Unknown error"));
            setIsProcessing(false);
          }
        },
        onClose: () => {
          setIsProcessing(false);
        },
      });

      handler.openIframe();
    } catch (error: any) {
      setIsProcessing(false);
      alert("Error creating order: " + (error.message || "Unknown error"));
    }
  };

  // Load Paystack script
  useEffect(() => {
    const paystackScript = document.createElement("script");
    paystackScript.src = "https://js.paystack.co/v1/inline.js";
    paystackScript.async = true;
    document.head.appendChild(paystackScript);

    return () => {
      document.head.removeChild(paystackScript);
    };
  }, []);

  // Quantity modal
  const QuantityModal = () => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
          setIsQuantityModalOpen(false);
          setSelectedProduct(null);
          setQuantity(1);
        }
      };

      if (isQuantityModalOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        document.body.style.overflow = "hidden";
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.body.style.overflow = "unset";
      };
    }, [isQuantityModalOpen]);

    if (!isQuantityModalOpen || !selectedProduct) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div ref={modalRef} className="bg-white rounded-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Select Quantity</h2>
            <button
              onClick={() => {
                setIsQuantityModalOpen(false);
                setSelectedProduct(null);
                setQuantity(1);
              }}
              className="p-2 hover:bg-gray-100 rounded-full active:scale-95 transition-transform"
              aria-label="Close quantity modal"
            >
              <X size={20} className="text-red-500" />
            </button>
          </div>
          <div className="flex items-center space-x-4 mb-4">
            <img
              src={`${selectedProduct.image}`}
              alt={selectedProduct.name}
              className="w-16 h-16 object-contain bg-gray-50 rounded"
            />
            <div>
              <h3 className="font-medium text-gray-900">{selectedProduct.name}</h3>
              <p className="text-red-500 font-bold">₦{selectedProduct.price.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              className="p-2 bg-white-500 border border-red-500 text-red-500 rounded-full hover:bg-red-600 hover:text-white active:scale-95 transition-transform"
              aria-label="Decrease quantity"
            >
              <Minus size={16} />
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 text-center border rounded-lg p-2 text-black"
              min="1"
              aria-label="Quantity"
            />
            <button
              onClick={() => setQuantity((prev) => prev + 1)}
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 active:scale-95 transition-transform"
              aria-label="Increase quantity"
            >
              <Plus size={16} />
            </button>
          </div>
          <button
            onClick={handleAddToCart}
            className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 active:scale-95 transition-all mt-4"
            aria-label={`Add ${selectedProduct.name} to cart`}
          >
            Add to Cart
          </button>
        </div>
      </div>
    );
  };

  // Cart modal
  const CartModal = () => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
          setIsCartOpen(false);
        }
      };

      if (isCartOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        document.body.style.overflow = "hidden";
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.body.style.overflow = "unset";
      };
    }, [isCartOpen]);

    if (!isCartOpen) return null;

    const removeFromCart = async (productId: string) => {
      try {
        const { data } = await api.delete(`/api/cart/remove/${productId}`);
        cartDispatch({ type: "REMOVE_ITEM", payload: productId });
      } catch (error: any) {
        alert("Error: " + (error.message || "Failed to remove item"));
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex">
        <div className="ml-auto">
          <div ref={modalRef} className="bg-white h-full w-full max-w-md overflow-y-auto shadow-xl">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Shopping Cart ({cart.length})</h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full active:scale-95 transition-transform"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.productId._id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <img
                          src={`https://ollanbackend.vercel.app/${item.productId.image}`}
                          alt={item.productId.name}
                          className="w-16 h-16 object-contain bg-gray-50 rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{item.productId.name}</h3>
                          <p className="text-red-500 font-bold">₦{item.productId.price.toLocaleString()}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <button
                              onClick={() =>
                                cartDispatch({
                                  type: "UPDATE_QUANTITY",
                                  payload: { id: item.productId._id, quantity: item.quantity - 1 },
                                })
                              }
                              className="p-1 bg-gray-100 rounded-full hover:bg-gray-200 active:scale-95 transition-transform"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-8 text-center text-black">{item.quantity}</span>
                            <button
                              onClick={() =>
                                cartDispatch({
                                  type: "UPDATE_QUANTITY",
                                  payload: { id: item.productId._id, quantity: item.quantity + 1 },
                                })
                              }
                              className="p-1 bg-gray-100 rounded-full hover:bg-gray-200 active:scale-95 transition-transform"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.productId._id)}
                          className="p-1 hover:bg-red-100 text-red-500 rounded active:scale-95 transition-transform"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-black">
                      <span>Subtotal:</span>
                      <span>₦{cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-black">
                      <span>Delivery Fee:</span>
                      <span>₦{deliveryFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2 text-black">
                      <span>Total:</span>
                      <span>₦{grandTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 active:scale-95 transition-all mt-6"
                  >
                    Proceed to Checkout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Checkout modal
  const CheckoutModal = () => {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
          setIsCheckoutOpen(false);
        }
      };

      if (isCheckoutOpen) {
        document.addEventListener("mousedown", handleClickOutside);
        document.body.style.overflow = "hidden";
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.body.style.overflow = "unset";
      };
    }, [isCheckoutOpen]);

    if (!isCheckoutOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (
        customerInfo.name &&
        customerInfo.email &&
        customerInfo.phone &&
        customerInfo.address &&
        customerInfo.city &&
        customerInfo.state
      ) {
        initializePayment();
      } else {
        alert("Please fill in all required fields");
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

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div ref={modalRef} className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Checkout</h2>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full active:scale-95 transition-transform"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-black">
                  <User size={16} className="inline mr-2" />
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-black">Email *</label>
                <input
                  type="email"
                  required
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-black">
                  <Phone size={16} className="inline mr-2" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                  placeholder="Enter your phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-black">
                  <MapPin size={16} className="inline mr-2" />
                  Delivery Address *
                </label>
                <textarea
                  required
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                  rows={3}
                  placeholder="Enter your complete delivery address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-black">City *</label>
                  <input
                    type="text"
                    required
                    value={customerInfo.city}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, city: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-black">State *</label>
                  <input
                    type="text"
                    required
                    value={customerInfo.state}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, state: e.target.value })}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
                    placeholder="State"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-black">
                  Upload Prescription (Optional)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  onChange={handlePrescriptionUpload}
                  className="w-full p-3 border rounded-lg text-black"
                />
                {customerInfo.prescription && (
                  <p className="text-sm text-gray-600 mt-2">
                    Uploaded: {customerInfo.prescription.name}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between text-lg font-bold mb-4 text-black">
                <span>Total:</span>
                <span>₦{grandTotal.toLocaleString()}</span>
              </div>
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={20} className="mr-2" />
                    Pay with Paystack
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Order complete modal
  const OrderCompleteModal = () => {
    if (!orderComplete) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Order Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your order has been placed successfully. You will receive a confirmation email shortly, and your items will
            be delivered within 24-48 hours.
          </p>
          <button
            onClick={() => setOrderComplete(false)}
            className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 active:scale-95 transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center">
                <Link href="/">
                  <div className="p-2 rounded-lg mr-3">
                    <Image src={logo} alt="Ollan Logo" width={80} height={80} className="lg:w-20 w-12" />
                  </div>
                </Link>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-3 bg-red-500 text-white rounded-full hover:bg-red-600 active:scale-95 transition-all"
            >
              <ShoppingCart size={24} />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                  {cart.reduce((total, item) => total + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="lg:text-3xl text-xl font-bold text-gray-900 mb-8 text-center md:text-left">
          Shop trusted medications, wellness products, and groceries
        </h2>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto md:mx-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medications..."
              className="w-full p-1 lg:p-3 pl-10 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-black"
            />
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 md:flex-wrap md:justify-start md:overflow-visible">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full text-[12px] lg:text-sm font-medium transition-all duration-200 active:scale-95 whitespace-nowrap flex-shrink-0 ${
                  selectedCategory === category
                    ? "bg-red-500 text-white shadow-md"
                    : "bg-white text-black hover:bg-gray-100 shadow-sm"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Popular Medications */}
        {popularProducts.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Popular Medications</h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 lg:gap-6">
              {popularProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl p-2 lg:p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
                >
                  <div className="w-full h-48 rounded-lg mb-4 flex items-center justify-center bg-gray-50 relative">
                    <img
                      src={`https://ollanbackend.vercel.app${product.image}`}
                      alt={product.name}
                      className="h-40 object-contain max-w-full"
                      loading="lazy"
                    />
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h4
                      className="text-[14px] lg:text-lg font-semibold mb-2 text-gray-900 line-clamp-2"
                      title={product.name}
                    >
                      {product.name}
                    </h4>
                    <p className="text-[14px] lg:text-lg text-red-500 font-bold mb-4">
                      ₦{product.price.toLocaleString()}
                    </p>
                    {product.stock > 0 && <span className="text-green-600 text-sm">✓ In Stock</span>}
                  </div>
                  <button
                    onClick={() => openQuantityModal(product)}
                    disabled={product.stock === 0}
                    className={`w-full p-1 lg:py-2 text-[14px] lg:text-lg rounded-lg font-semibold transition-all duration-300 active:scale-95 mt-auto ${
                      product.stock > 0
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OTC Medications */}
        {otcProducts.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Over-the-Counter (OTC)</h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 lg:gap-6">
              {otcProducts.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl p-2 lg:p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
                >
                  <div className="w-full h-48 rounded-lg mb-4 flex items-center justify-center bg-gray-50 relative">
                    <img
                      src={`${product.image}`}
                      alt={product.name}
                      className="h-40 object-contain max-w-full"
                      loading="lazy"
                    />
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <span className="text-white font-semibold">Out of Stock</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h4
                      className="text-[14px] lg:text-lg font-semibold mb-2 text-gray-900 line-clamp-2"
                      title={product.name}
                    >
                      {product.name}
                    </h4>
                    <p className="text-[14px] lg:text-lg text-red-500 font-bold mb-4">
                      ₦{product.price.toLocaleString()}
                    </p>
                    {product.stock > 0 && <span className="text-green-600 text-sm">✓ In Stock</span>}
                  </div>
                  <button
                    onClick={() => openQuantityModal(product)}
                    disabled={product.stock === 0}
                    className={`w-full p-1 lg:py-2 text-[14px] lg:text-lg rounded-lg font-semibold transition-all duration-300 active:scale-95 mt-auto ${
                      product.stock > 0
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Medications */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">All Medications</h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 lg:gap-6">
            {allProducts.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl p-2 lg:p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
              >
                <div className="w-full h-48 rounded-lg mb-4 flex items-center justify-center bg-gray-50 relative">
                  <img
                    src={`${product.image}`}
                    alt={product.name}
                    className="h-40 object-contain max-w-full"
                    loading="lazy"
                  />
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <span className="text-white font-semibold">Out of Stock</span>
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <h4
                    className="text-[14px] lg:text-lg font-semibold mb-2 text-gray-900 line-clamp-2"
                    title={product.name}
                  >
                    {product.name}
                  </h4>
                  <p className="text-[14px] lg:text-lg text-red-500 font-bold mb-4">
                    ₦{product.price.toLocaleString()}
                  </p>
                  {product.stock > 0 && <span className="text-green-600 text-sm">✓ In Stock</span>}
                </div>
                <button
                  onClick={() => openQuantityModal(product)}
                  disabled={product.stock === 0}
                  className={`w-full p-1 lg:py-2 text-[14px] lg:text-lg rounded-lg font-semibold transition-all duration-300 active:scale-95 mt-auto ${
                    product.stock > 0
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modals */}
      <QuantityModal />
      <CartModal />
      <CheckoutModal />
      <OrderCompleteModal />
    </div>
  );
};

export default PharmacyApp;