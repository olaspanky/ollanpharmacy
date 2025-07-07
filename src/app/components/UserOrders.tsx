"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/src/lib/api";
import { ShoppingCart, MapPin, CreditCard, Calendar, FileText } from "lucide-react";

interface OrderItem {
  productId: { _id: string; name: string; price: number; image: string };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  items: OrderItem[];
  customerInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    deliveryOption: string;
    pickupLocation: string;
    estimatedDelivery: string;
  };
  deliveryFee: number;
  prescriptionUrl?: string;
  totalAmount: number;
  paymentReference: string;
  status: string;
  createdAt: string;
}

const UserOrders: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push("/pages/signin");
      return;
    }

    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/api/orders/my-orders");
        setOrders(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Failed to fetch orders");
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, router]);

  console.log("orders:", orders);       

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Orders</h1>
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-500 text-lg">You have no orders yet.</p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 bg-red-500 text-white py-2 px-6 rounded-lg font-semibold hover:bg-red-600 active:scale-95 transition-all"
            >
              Shop Now
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-md p-6 border border-gray-200"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Order #{order._id.slice(-6)}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === "processing"
                        ? "bg-yellow-100 text-yellow-800"
                        : order.status === "delivered"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Items</h3>
                    {order.items.map((item) => (
                      <div key={item.productId._id} className="flex items-center space-x-4 mb-3">
                        <img
                          src={`https://ollanbackend.vercel.app/${item.productId.image}`}
                          alt={item.productId.name}
                          className="w-16 h-16 object-contain bg-gray-50 rounded"
                        />
                        <div>
                          <p className="text-gray-900 font-medium">{item.productId.name}</p>
                          <p className="text-gray-600">
                            ₦{item.price.toLocaleString()} x {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="mt-4">
                      <p className="text-gray-900 font-medium">
                        Subtotal: ₦{order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}
                      </p>
                      <p className="text-gray-900 font-medium">
                        Delivery Fee: ₦{order.deliveryFee.toLocaleString()}
                      </p>
                      <p className="text-red-500 font-bold text-lg">
                        Total: ₦{order.totalAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Delivery Details</h3>
                    <p className="text-gray-600 flex items-center">
                      <MapPin size={18} className="mr-2 text-red-500" />
                      {order.customerInfo.address}, {order.customerInfo.city}, {order.customerInfo.state}
                    </p>
                    <p className="text-gray-600 flex items-center">
                      <Calendar size={18} className="mr-2 text-red-500" />
                      Estimated Delivery: {order.customerInfo.estimatedDelivery}
                    </p>
                    <p className="text-gray-600 flex items-center">
                      <CreditCard size={18} className="mr-2 text-red-500" />
                      Payment Ref: {order.paymentReference}
                    </p>
                    {order.prescriptionUrl && (
                      <p className="text-gray-600 flex items-center">
                        <FileText size={18} className="mr-2 text-red-500" />
                        <a
                          href={`https://ollanbackend.vercel.app${order.prescriptionUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-500 hover:underline"
                        >
                          View Prescription
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrders;