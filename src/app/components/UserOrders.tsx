"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/src/lib/api";
import { 
  ShoppingCart, 
  MapPin, 
  CreditCard, 
  Calendar, 
  FileText,
  ChevronDown,
  ChevronUp,
  Package,
  Clock,
  CheckCircle,
  Truck
} from "lucide-react";

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
  status: string; // e.g., 'pending', 'processing', 'accepted', 'rejected', 'cancelled'
  deliveryStatus: string; // e.g., 'pending', 'en_route', 'delivered'
  rider?: {
    _id: string;
    name: string;
  };
  createdAt: string;
}
const UserOrders: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  
useEffect(() => {
  let isMounted = true;

  // Early return if user is still loading (initial state is null/undefined)
  if (user === null || user === undefined) {
    setLoading(true); // Optional: Show loading state while auth resolves
    return;
  }

  // If no user is authenticated, redirect to sign-in
  if (!user) {
    if (isMounted) {
      router.push("/pages/signin");
    }
    return;
  }

  // If user exists, fetch orders
  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/api/orders/my-orders");
      // Sort orders by createdAt in descending order (newest first)
      const sortedOrders = data.sort((a: Order, b: Order) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      if (isMounted) {
        setOrders(sortedOrders);
        setLoading(false);
      }
    } catch (err: any) {
      if (isMounted) {
        setError(err.message || "Failed to fetch orders");
        setLoading(false);
      }
    }
  };

  fetchOrders();
  const refreshInterval = setInterval(fetchOrders, 60000); // Poll every 60 seconds

  return () => {
    isMounted = false; // Prevent state updates after unmount
    clearInterval(refreshInterval); // Cleanup interval
  };
}, [user, router]); // Keep user in deps since it’s from useAuth


  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const getStatusColor = (status: string, deliveryStatus: string) => {
  if (deliveryStatus === 'delivered') {
    return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200';
  } else if (deliveryStatus === 'en_route') {
    return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200';
  }
  switch (status.toLowerCase()) {
    case 'processing':
      return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200';
    case 'accepted':
      return 'bg-gradient-to-r from-teal-100 to-green-100 text-teal-800 border-teal-200';
    case 'rejected':
    case 'cancelled':
      return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200';
    default:
      return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: string, deliveryStatus: string) => {
  if (deliveryStatus === 'delivered') {
    return <CheckCircle size={14} className="mr-1" />;
  } else if (deliveryStatus === 'en_route') {
    return <Truck size={14} className="mr-1" />;
  }
  switch (status.toLowerCase()) {
    case 'processing':
      return <Clock size={14} className="mr-1" />;
    case 'accepted':
      return <Package size={14} className="mr-1" />;
    case 'rejected':
    case 'cancelled':
      return <Package size={14} className="mr-1" />;
    default:
      return <Package size={14} className="mr-1" />;
  }
};

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  console.log("orders:", orders);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-red-600 active:scale-95 transition-all shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Your Orders</h1>
          <p className="text-gray-600">Track and manage your purchases</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 max-w-md mx-auto">
              <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-8 mb-6">
                <ShoppingCart className="mx-auto mb-4 text-red-400" size={56} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-6">Start exploring our products and place your first order!</p>
              <button
                onClick={() => router.push("/")}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-8 rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 active:scale-95 transition-all shadow-lg"
              >
                Shop Now
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Order Header */}
                <div 
                  className="p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleOrderExpansion(order._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                          Order #{order._id.slice(-6)}
                        </h2>
                        <span
  className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(
    order.status,
    order.deliveryStatus
  )}`}
>
  {getStatusIcon(order.status, order.deliveryStatus)}
  {order.deliveryStatus === 'delivered'
    ? 'Delivered'
    : order.deliveryStatus === 'en_route'
    ? 'En Route'
    : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
</span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 gap-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Package size={14} />
                          <span>{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg sm:text-xl font-bold text-red-600">
                          ₦{order.totalAmount.toLocaleString()}
                        </p>
                      </div>
                      {expandedOrders.has(order._id) ? (
                        <ChevronUp size={20} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={20} className="text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Details */}
                {expandedOrders.has(order._id) && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-gray-100 bg-gray-50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                      {/* Items Section */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Package size={20} className="text-red-500" />
                          Items Ordered
                        </h3>
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div key={item.productId._id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                              <div className="flex items-center gap-4">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                                  <img
                                    src={`https://ollanbackend.vercel.app/${item.productId.image}`}
                                    alt={item.productId.name}
                                    className="w-full h-full object-contain"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                                    {item.productId.name}
                                  </h4>
                                  <div className="flex items-center justify-between mt-1">
                                    <p className="text-gray-600 text-sm">
                                      ₦{item.price.toLocaleString()} × {item.quantity}
                                    </p>
                                    <p className="font-semibold text-red-600 text-sm">
                                      ₦{(item.price * item.quantity).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        {/* Price Breakdown */}
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Subtotal</span>
                              <span>₦{order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Delivery Fee</span>
                              <span>₦{order.deliveryFee.toLocaleString()}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-2">
                              <div className="flex justify-between font-bold text-lg text-gray-900">
                                <span>Total</span>
                                <span className="text-red-600">₦{order.totalAmount.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Delivery & Payment Info */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Truck size={20} className="text-red-500" />
                          Delivery & Payment
                        </h3>
                        
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-4">
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <MapPin size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-gray-900 text-sm">Delivery Address</p>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                  {order.customerInfo.pickupLocation}<br />
                                  {order.customerInfo.city}, {order.customerInfo.state}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                              <Calendar size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-gray-900 text-sm">Estimated Delivery</p>
                                <p className="text-gray-600 text-sm">
                                  {order.customerInfo.estimatedDelivery}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start gap-3">
                              <CreditCard size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="font-medium text-gray-900 text-sm">Payment Reference</p>
                                <p className="text-gray-600 text-sm font-mono">
                                  {order.paymentReference}
                                </p>
                              </div>
                            </div>
                            
                            {order.prescriptionUrl && (
                              <div className="flex items-start gap-3">
                                <FileText size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="font-medium text-gray-900 text-sm">Prescription</p>
                                  <a
                                    href={`https://ollanbackend.vercel.app${order.prescriptionUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-red-500 hover:text-red-600 text-sm font-medium inline-flex items-center gap-1 hover:underline"
                                  >
                                    View Document
                                  </a>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrders;