// "use client";

// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { useAuth } from "../../context/AuthContext";
// import { useRouter } from "next/navigation";
// import api from "@/src/lib/api";
// import {
//   ShoppingCart,
//   MapPin,
//   CreditCard,
//   Calendar,
//   FileText,
//   ChevronDown,
//   ChevronUp,
//   Package,
//   Clock,
//   CheckCircle,
//   Truck,
//   Bell,
//   X,
// } from "lucide-react";

// interface OrderItem {
//   productId: { _id: string; name: string; price: number; image: string };
//   quantity: number;
//   price: number;
// }

// interface Order {
//   _id: string;
//   items: OrderItem[];
//   customerInfo: {
//     name: string;
//     email: string;
//     phone: string;
//     address: string;
//     city: string;
//     state: string;
//     deliveryOption: string;
//     pickupLocation: string;
//     estimatedDelivery: string;
//   };
//   deliveryFee: number;
//   prescriptionUrl?: string;
//   totalAmount: number;
//   paymentReference: string;
//   status: string;
//   deliveryStatus: string;
//   rider?: {
//     _id: string;
//     name: string;
//   };
//   createdAt: string;
// }

// const UserOrders: React.FC = () => {
//   const { user } = useAuth();
//   const router = useRouter();
//   const [orders, setOrders] = useState<Order[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
//   const [sseConnected, setSseConnected] = useState<boolean>(false);
//   const [hasNewOrder, setHasNewOrder] = useState<boolean>(false);
//   const [notificationCount, setNotificationCount] = useState<number>(0);
//   const [showNotifications, setShowNotifications] = useState<boolean>(false);
//   const [newOrders, setNewOrders] = useState<Order[]>([]);
//   const audioRef = useRef<HTMLAudioElement | null>(null);
//   const sseRef = useRef<EventSource | null>(null);
//   const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//   const reconnectAttempts = useRef<number>(0);
//   const maxReconnectAttempts = 5;
//   const previousOrdersCount = useRef<number>(0);

//   // Initialize audio for notifications
//   useEffect(() => {
//     audioRef.current = new Audio("/notification-sound.mp3");
//     if (typeof window !== "undefined" && !audioRef.current.src) {
//       audioRef.current.src =
//         "data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAElCircuitZm8AAAAPAAAAAwAAAbkAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV////////////////////////////////////////////////////////////////////////////AAAAAExhdmM1OC4xMwAAAAAAAAAAAAAAACQDgAAAAAAAAbkAtxBjlgAAAAAAAAAAAAAAAAAAAAA=";
//     }
//   }, []);

//   const playNotificationSound = () => {
//     if (audioRef.current) {
//       audioRef.current.currentTime = 0;
//       audioRef.current.play().catch((err) => {
//         console.log("Audio play failed:", err);
//         const audio = new Audio("/notification-sound.mp3");
//         audio.play().catch((e) => console.log("Fallback audio also failed:", e));
//       });
//     }
//   };

//   const fetchOrders = useCallback(async () => {
//     try {
//       setLoading(true);
//       const { data } = await api.get("/api/orders/my-orders");
//       const sortedOrders = data.sort((a: Order, b: Order) =>
//         new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//       );

//       if (orders.length > 0 && sortedOrders.length > orders.length) {
//         const newOrderIds: string[] = sortedOrders.map((o: Order) => o._id);
//         const currentOrderIds = orders.map((o) => o._id);
//         const actualNewOrders = sortedOrders.filter((o: Order) => !currentOrderIds.includes(o._id));

//         if (actualNewOrders.length > 0) {
//           setNewOrders((prev) => [...actualNewOrders, ...prev]);
//           setNotificationCount((prev) => prev + actualNewOrders.length);
//           setHasNewOrder(true);
//           if (previousOrdersCount.current > 0) {
//             playNotificationSound();
//           }
//         }
//       }

//       previousOrdersCount.current = sortedOrders.length;
//       setOrders(sortedOrders);
//       setError(null);
//     } catch (err: any) {
//       setError(err.message || "Failed to fetch orders");
//     } finally {
//       setLoading(false);
//     }
//   }, [orders.length]);

//  const connectSSE = useCallback(() => {
//   // Clean up any existing connection
//   if (sseRef.current) {
//     sseRef.current.close();
//     sseRef.current = null;
//     console.log("Previous SSE connection closed");
//   }

//   if (reconnectTimeoutRef.current) {
//     clearTimeout(reconnectTimeoutRef.current);
//     reconnectTimeoutRef.current = null;
//   }

//   const token = localStorage.getItem("token");
//   if (!token) {
//     console.error("No token found for SSE");
//     setError("Authentication required for real-time updates");
//     return;
//   }

//   try {
//     // Use production URL; fallback to local for development
//     const sseUrl = process.env.NODE_ENV === "production"
//       ? `https://ollanbackend.vercel.app/api/orders/stream?token=${encodeURIComponent(token)}`
//       : `https://ollanbackend.vercel.app/api/orders/stream?token=${encodeURIComponent(token)}`;
//     console.log("Attempting to connect to SSE at:", sseUrl);

//     sseRef.current = new EventSource(sseUrl, {
//       withCredentials: true,
//     });

//     sseRef.current.onopen = () => {
//       console.log("SSE connection established");
//       setSseConnected(true);
//       setError(null);
//       reconnectAttempts.current = 0; // Reset reconnect attempts on success
//     };

//     sseRef.current.onmessage = (event) => {
//       try {
//         if (event.data.trim() === ": heartbeat") {
//           console.log("SSE heartbeat received");
//           return;
//         }

//         const message = JSON.parse(event.data);
//         console.log("SSE message received:", message);

//         if (message.type === "connected") {
//           console.log("SSE connected event:", message.message, "Connection ID:", message.connectionId);
//           return;
//         }

//         if (message.type === "order_update") {
//           const updatedOrder = message.data;
//           setOrders((prev) => {
//             const isNewOrder = !prev.some((o) => o._id === updatedOrder._id);

//             if (isNewOrder) {
//               playNotificationSound();
//               setHasNewOrder(true);
//               setNotificationCount((prevCount) => prevCount + 1);
//               setNewOrders((prevOrders) => [updatedOrder, ...prevOrders]);
//             }

//             const filteredOrders = prev.filter((o) => o._id !== updatedOrder._id);
//             const updatedOrders = [updatedOrder, ...filteredOrders];
//             return updatedOrders.sort(
//               (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
//             );
//           });
//         }
//       } catch (err) {
//         console.error("SSE message parse error:", err);
//         setError("Failed to process real-time update");
//       }
//     };

//     sseRef.current.onerror = (error) => {
//       console.error("SSE connection error:", error);
//       setSseConnected(false);

//       if (reconnectAttempts.current < maxReconnectAttempts) {
//         reconnectAttempts.current++;
//         const delay = 2000 * reconnectAttempts.current;
//         console.log(`Attempting to reconnect SSE (${reconnectAttempts.current}/${maxReconnectAttempts}) in ${delay}ms...`);
//         reconnectTimeoutRef.current = setTimeout(() => {
//           if (sseRef.current) {
//             sseRef.current.close();
//           }
//           connectSSE();
//         }, delay);
//       } else {
//         setError("Failed to connect to real-time updates. Please refresh the page or check your connection.");
//       }
//     };
//   } catch (err) {
//     console.error("SSE setup error:", err);
//     setError("Failed to set up real-time updates");
//   }
// }, []);

//  useEffect(() => {
//   let isMounted = true;

//   if (user === null || user === undefined) {
//     setLoading(true);
//     return;
//   }

//   if (!user) {
//     if (isMounted) {
//       router.push("/pages/signin");
//     }
//     return;
//   }

//   fetchOrders();
//   connectSSE();

//   return () => {
//     isMounted = false;
//     if (sseRef.current) {
//       sseRef.current.close();
//       sseRef.current = null;
//       console.log("SSE connection closed");
//     }
//     if (reconnectTimeoutRef.current) {
//       clearTimeout(reconnectTimeoutRef.current);
//       reconnectTimeoutRef.current = null;
//     }
//   };
// }, [user, router, fetchOrders, connectSSE]);
//   const handleNotificationClick = () => {
//     setShowNotifications(!showNotifications);
//     if (hasNewOrder) {
//       setHasNewOrder(false);
//       setNotificationCount(0);
//     }
//   };

//   const handleNotificationClear = () => {
//     setNewOrders([]);
//     setNotificationCount(0);
//     setHasNewOrder(false);
//   };

//   const toggleOrderExpansion = (orderId: string) => {
//     setExpandedOrders((prev) => {
//       const newSet = new Set(prev);
//       if (newSet.has(orderId)) {
//         newSet.delete(orderId);
//       } else {
//         newSet.add(orderId);
//       }
//       return newSet;
//     });
//   };

//   const getStatusColor = (status: string, deliveryStatus: string) => {
//     if (deliveryStatus === "delivered") {
//       return "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200";
//     } else if (deliveryStatus === "en_route") {
//       return "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200";
//     }
//     switch (status.toLowerCase()) {
//       case "processing":
//         return "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200";
//       case "accepted":
//         return "bg-gradient-to-r from-teal-100 to-green-100 text-teal-800 border-teal-200";
//       case "rejected":
//       case "cancelled":
//         return "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200";
//       default:
//         return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200";
//     }
//   };

//   const getStatusIcon = (status: string, deliveryStatus: string) => {
//     if (deliveryStatus === "delivered") {
//       return <CheckCircle size={14} className="mr-1" />;
//     } else if (deliveryStatus === "en_route") {
//       return <Truck size={14} className="mr-1" />;
//     }
//     switch (status.toLowerCase()) {
//       case "processing":
//         return <Clock size={14} className="mr-1" />;
//       case "accepted":
//         return <Package size={14} className="mr-1" />;
//       case "rejected":
//       case "cancelled":
//         return <Package size={14} className="mr-1" />;
//       default:
//         return <Package size={14} className="mr-1" />;
//     }
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "short",
//       day: "numeric",
//     });
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
//           <p className="text-gray-600 font-medium">Loading your orders...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
//         <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
//           <div className="text-red-500 text-6xl mb-4">⚠️</div>
//           <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
//           <p className="text-gray-600 mb-6">{error}</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="bg-red-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-red-600 active:scale-95 transition-all shadow-lg"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//       <div
//         className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
//           sseConnected
//             ? "bg-green-100 text-green-800 border border-green-200"
//             : "bg-yellow-100 text-yellow-800 border border-yellow-200"
//         }`}
//       >
//         {sseConnected ? "🟢 Live updates connected" : "🟡 Connecting to updates..."}
//       </div>

//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
//         <div className="mb-8 flex items-center justify-between">
//           <div>
//             <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Your Orders</h1>
//             <p className="text-gray-600">Track and manage your purchases</p>
//           </div>
//           <div className="relative">
//             <button
//               onClick={handleNotificationClick}
//               className={`relative p-3 rounded-full transition-all duration-300 ${
//                 hasNewOrder
//                   ? "bg-blue-100 animate-pulse ring-2 ring-blue-400"
//                   : "bg-white hover:bg-slate-100"
//               }`}
//             >
//               <Bell className={`w-6 h-6 ${hasNewOrder ? "text-blue-600" : "text-slate-600"}`} />
//               {notificationCount > 0 && (
//                 <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
//                   {notificationCount}
//                 </span>
//               )}
//             </button>

//             {showNotifications && (
//               <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border border-slate-200">
//                 <div className="p-4 border-b border-slate-100 flex justify-between items-center">
//                   <h3 className="font-semibold text-slate-700">Notifications</h3>
//                   {newOrders.length > 0 && (
//                     <button
//                       onClick={handleNotificationClear}
//                       className="text-xs text-blue-600 hover:text-blue-800"
//                     >
//                       Clear all
//                     </button>
//                   )}
//                 </div>
//                 <div className="max-h-96 overflow-y-auto">
//                   {newOrders.length > 0 ? (
//                     newOrders.map((order) => (
//                       <div
//                         key={order._id}
//                         className="p-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 cursor-pointer"
//                         onClick={() => {
//                           toggleOrderExpansion(order._id);
//                           setShowNotifications(false);
//                         }}
//                       >
//                         <div className="flex items-start space-x-3">
//                           <div className="bg-blue-100 p-2 rounded-full">
//                             <Package className="w-4 h-4 text-blue-600" />
//                           </div>
//                           <div className="flex-1">
//                             <p className="font-medium text-slate-800">
//                               {order.status === "pending" ? "New Order Placed" : "Order Updated"}
//                             </p>
//                             <p className="text-sm text-slate-600">Order #{order._id.slice(-6)}</p>
//                             <p className="text-xs text-slate-500 mt-1">
//                               {new Date(order.createdAt).toLocaleTimeString()}
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     <div className="p-6 text-center text-slate-500">
//                       <Bell className="w-12 h-12 mx-auto text-slate-300 mb-2" />
//                       <p>No new notifications</p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {orders.length === 0 ? (
//           <div className="text-center py-16">
//             <div className="bg-white rounded-3xl shadow-xl p-8 sm:p-12 max-w-md mx-auto">
//               <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-8 mb-6">
//                 <ShoppingCart className="mx-auto mb-4 text-red-400" size={56} />
//               </div>
//               <h3 className="text-xl font-bold text-gray-900 mb-2">No orders yet</h3>
//               <p className="text-gray-500 mb-6">Start exploring our products and place your first order!</p>
//               <button
//                 onClick={() => router.push("/")}
//                 className="bg-gradient-to-r from-red-500 to-pink-500 text-white py-3 px-8 rounded-xl font-semibold hover:from-red-600 hover:to-pink-600 active:scale-95 transition-all shadow-lg"
//               >
//                 Shop Now
//               </button>
//             </div>
//           </div>
//         ) : (
//           <div className="space-y-4 sm:space-y-6">
//             {orders.map((order) => (
//               <div
//                 key={order._id}
//                 className="bg-white rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
//               >
//                 <div
//                   className="p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
//                   onClick={() => toggleOrderExpansion(order._id)}
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center gap-3 mb-2">
// <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
//   Order #{order?._id ? order._id.slice(-6) : 'N/A'}
// </h2>
//                         <span
//                           className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(
//                             order.status,
//                             order.deliveryStatus
//                           )}`}
//                         >
//                           {getStatusIcon(order.status, order.deliveryStatus)}
//                           {order.deliveryStatus === "delivered"
//                             ? "Delivered"
//                             : order.deliveryStatus === "en_route"
//                             ? "En Route"
//                             : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
//                         </span>
//                       </div>
//                       <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6 gap-1 text-sm text-gray-600">
//                         <div className="flex items-center gap-1">
//                           <Calendar size={14} />
//                           <span>{formatDate(order.createdAt)}</span>
//                         </div>
//                         <div className="flex items-center gap-1">
//                           <Package size={14} />
//                           <span>
//                             {order.items.length} item{order.items.length > 1 ? "s" : ""}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-3">
//                       <div className="text-right">
//                         <p className="text-lg sm:text-xl font-bold text-red-600">
//                           ₦{order.totalAmount.toLocaleString()}
//                         </p>
//                       </div>
//                       {expandedOrders.has(order._id) ? (
//                         <ChevronUp size={20} className="text-gray-400" />
//                       ) : (
//                         <ChevronDown size={20} className="text-gray-400" />
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {expandedOrders.has(order._id) && (
//                   <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-gray-100 bg-gray-50">
//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
//                       <div className="space-y-4">
//                         <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//                           <Package size={20} className="text-red-500" />
//                           Items Ordered
//                         </h3>
//                         <div className="space-y-3">
//                           {order.items.map((item) => (
//                             <div
//                               key={item.productId._id}
//                               className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
//                             >
//                               <div className="flex items-center gap-4">
//                                 <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
//                                   <img
//                                     src={`https://ollanbackend.vercel.app/${item.productId.image}`}
//                                     alt={item.productId.name}
//                                     className="w-full h-full object-contain"
//                                   />
//                                 </div>
//                                 <div className="flex-1 min-w-0">
//                                   <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
//                                     {item.productId.name}
//                                   </h4>
//                                   <div className="flex items-center justify-between mt-1">
//                                     <p className="text-gray-600 text-sm">
//                                       ₦{item.price.toLocaleString()} × {item.quantity}
//                                     </p>
//                                     <p className="font-semibold text-red-600 text-sm">
//                                       ₦{(item.price * item.quantity).toLocaleString()}
//                                     </p>
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>
//                           ))}
//                         </div>

//                         <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
//                           <div className="space-y-2">
//                             <div className="flex justify-between text-sm text-gray-600">
//                               <span>Subtotal</span>
//                               <span>
//                                 ₦{order.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString()}
//                               </span>
//                             </div>
//                             <div className="flex justify-between text-sm text-gray-600">
//                               <span>Delivery Fee</span>
//                               <span>₦{order.deliveryFee.toLocaleString()}</span>
//                             </div>
//                             <div className="border-t border-gray-200 pt-2">
//                               <div className="flex justify-between font-bold text-lg text-gray-900">
//                                 <span>Total</span>
//                                 <span className="text-red-600">₦{order.totalAmount.toLocaleString()}</span>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="space-y-4">
//                         <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
//                           <Truck size={20} className="text-red-500" />
//                           Delivery & Payment
//                         </h3>

//                         <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 space-y-4">
//                           <div className="space-y-3">
//                             <div className="flex items-start gap-3">
//                               <MapPin size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
//                               <div>
//                                 <p className="font-medium text-gray-900 text-sm">Delivery Address</p>
//                                 <p className="text-gray-600 text-sm leading-relaxed">
//                                   {order.customerInfo.pickupLocation}
//                                   <br />
//                                   {order.customerInfo.city}, {order.customerInfo.state}
//                                 </p>
//                               </div>
//                             </div>

//                             <div className="flex items-start gap-3">
//                               <Calendar size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
//                               <div>
//                                 <p className="font-medium text-gray-900 text-sm">Estimated Delivery</p>
//                                 <p className="text-gray-600 text-sm">{order.customerInfo.estimatedDelivery}</p>
//                               </div>
//                             </div>

//                             <div className="flex items-start gap-3">
//                               <CreditCard size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
//                               <div>
//                                 <p className="font-medium text-gray-900 text-sm">Payment Reference</p>
//                                 <p className="text-gray-600 text-sm font-mono">{order.paymentReference}</p>
//                               </div>
//                             </div>

//                             {order.prescriptionUrl && (
//                               <div className="flex items-start gap-3">
//                                 <FileText size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
//                                 <div>
//                                   <p className="font-medium text-gray-900 text-sm">Prescription</p>
//                                   <a
//                                     href={`https://ollanbackend.vercel.app${order.prescriptionUrl}`}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="text-red-500 hover:text-red-600 text-sm font-medium inline-flex items-center gap-1 hover:underline"
//                                   >
//                                     View Document
//                                   </a>
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default UserOrders;


"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Truck,
  Bell,
  X,
  Eye,
  EyeOff,
  RefreshCw,
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
  status: string;
  deliveryStatus: string;
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
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [sseConnected, setSseConnected] = useState<boolean>(false);
  const [hasNewOrder, setHasNewOrder] = useState<boolean>(false);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [newOrders, setNewOrders] = useState<Order[]>([]);
  
  // Enhanced controls like SellerDashboard
  const [silentMode, setSilentMode] = useState<boolean>(false);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(30);
  const [showLiveIndicator, setShowLiveIndicator] = useState<boolean>(true);
  const [minimizeNotifications, setMinimizeNotifications] = useState<boolean>(false);
  
  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sseRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoRefreshRef = useRef<NodeJS.Timeout | null>(null);
  const previousOrdersCount = useRef<number>(0);
  const lastUpdateRef = useRef<Date>(new Date());

  // Initialize audio for notifications
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioRef.current = new Audio('/notification-sound.mp3');
    }
  }, []);

  const playNotificationSound = () => {
    if (audioRef.current && !silentMode) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = silentMode ? 0.1 : 0.5;
      audioRef.current.play().catch((err) => {
        console.log("Audio play failed:", err);
      });
    }
  };

  // Enhanced fetchOrders with background update support
  const fetchOrders = useCallback(async (showRefreshing = false, isBackgroundUpdate = false) => {
    try {
      if (showRefreshing && !isBackgroundUpdate) {
        setRefreshing(true);
      } else if (!isBackgroundUpdate) {
        setLoading(true);
      }

      const { data } = await api.get("/api/orders/my-orders");
      const sortedOrders = data.sort((a: Order, b: Order) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Only show notifications if not in background update mode
      if (orders.length > 0 && sortedOrders.length > orders.length && !isBackgroundUpdate) {
        const newOrderIds: string[] = sortedOrders.map((o: Order) => o._id);
        const currentOrderIds = orders.map((o) => o._id);
        const actualNewOrders = sortedOrders.filter((o: Order) => !currentOrderIds.includes(o._id));

        if (actualNewOrders.length > 0) {
          setNewOrders((prev) => [...actualNewOrders, ...prev]);
          
          if (!minimizeNotifications) {
            setNotificationCount((prev) => prev + actualNewOrders.length);
            setHasNewOrder(true);
          }
          
          if (previousOrdersCount.current > 0 && !silentMode) {
            playNotificationSound();
          }
        }
      }

      previousOrdersCount.current = sortedOrders.length;
      setOrders(sortedOrders);
      setError(null);
      lastUpdateRef.current = new Date();
    } catch (err: any) {
      if (!isBackgroundUpdate) {
        setError(err.message || "Failed to fetch orders");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orders.length, silentMode, minimizeNotifications]);

  // Enhanced SSE setup with improved reconnection and error handling
  const setupSSE = useCallback(() => {
    // Clean up any existing connection
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found for SSE");
        if (!silentMode) {
          setError("Authentication required for real-time updates");
        }
        return;
      }

      // Create new SSE connection
      sseRef.current = new EventSource(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://ollanbackend.vercel.app'}/api/orders/stream?token=${encodeURIComponent(token)}`
      );

      sseRef.current.onopen = () => {
        console.log("SSE connection established");
        setSseConnected(true);
        setError(null);
      };

      sseRef.current.onmessage = (event) => {
        try {
          if (event.data.trim() === ": heartbeat") return;

          const message = JSON.parse(event.data);

          if (message.type === "connected") {
            console.log("SSE connected successfully");
            return;
          }

          if (message.type === "order_update") {
            const updatedOrder: Order = message.data;

            // Safety: Ensure all required fields exist before updating state
            if (!updatedOrder._id || !updatedOrder.createdAt) {
              console.warn("Received invalid order payload:", updatedOrder);
              // Fallback: quiet background refresh to get clean data
              fetchOrders(false, true);
              return;
            }

            setOrders((prev) => {
              const exists = prev.some((o) => o._id === updatedOrder._id);

              let updatedOrders;
              if (exists) {
                // Existing order update - completely silent
                updatedOrders = prev.map((o) =>
                  o._id === updatedOrder._id ? { ...o, ...updatedOrder } : o
                );
              } else {
                // New order - handle based on silent mode
                if (!silentMode) {
                  playNotificationSound();
                }
                
                if (!minimizeNotifications) {
                  setHasNewOrder(true);
                  setNotificationCount((prevCount) => prevCount + 1);
                  setNewOrders((prevOrders) => [updatedOrder, ...prevOrders]);
                }
                
                updatedOrders = [updatedOrder, ...prev];
              }

              return updatedOrders.sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              );
            });
            
            lastUpdateRef.current = new Date();
          }
        } catch (err) {
          console.error("SSE message parse error:", err);
        }
      };

      sseRef.current.onerror = (error) => {
        console.error("SSE connection error:", error);
        setSseConnected(false);
        
        // Attempt to reconnect after a delay (quieter reconnection)
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("Attempting to reconnect SSE...");
          setupSSE();
        }, 3000);
      };
    } catch (err) {
      console.error("SSE setup error:", err);
      if (!silentMode) {
        setError("Failed to set up real-time updates");
      }
    }
  }, [silentMode, minimizeNotifications, fetchOrders]);

  // Auto-refresh functionality for background updates
  useEffect(() => {
    if (autoRefreshInterval > 0) {
      autoRefreshRef.current = setInterval(() => {
        // Background refresh - completely silent
        fetchOrders(false, true);
      }, autoRefreshInterval * 1000);
    }

    return () => {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
      }
    };
  }, [autoRefreshInterval, fetchOrders]);

  useEffect(() => {
    let isMounted = true;

    if (user === null || user === undefined) {
      setLoading(true);
      return;
    }

    if (!user) {
      if (isMounted) {
        router.push("/pages/signin");
      }
      return;
    }

    fetchOrders();
    setupSSE();

    return () => {
      isMounted = false;
      if (sseRef.current) {
        sseRef.current.close();
        sseRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
      }
    };
  }, [user, router, fetchOrders, setupSSE]);

  const handleRefresh = () => {
    fetchOrders(true);
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (hasNewOrder) {
      setHasNewOrder(false);
      setNotificationCount(0);
    }
  };

  const handleNotificationClear = () => {
    setNewOrders([]);
    setNotificationCount(0);
    setHasNewOrder(false);
  };

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prev) => {
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
    if (deliveryStatus === "delivered") {
      return "bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200";
    } else if (deliveryStatus === "en_route") {
      return "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-200";
    }
    switch (status.toLowerCase()) {
      case "processing":
        return "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200";
      case "accepted":
        return "bg-gradient-to-r from-teal-100 to-green-100 text-teal-800 border-teal-200";
      case "rejected":
      case "cancelled":
        return "bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200";
      default:
        return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string, deliveryStatus: string) => {
    if (deliveryStatus === "delivered") {
      return <CheckCircle size={14} className="mr-1" />;
    } else if (deliveryStatus === "en_route") {
      return <Truck size={14} className="mr-1" />;
    }
    switch (status.toLowerCase()) {
      case "processing":
        return <Clock size={14} className="mr-1" />;
      case "accepted":
        return <Package size={14} className="mr-1" />;
      case "rejected":
      case "cancelled":
        return <Package size={14} className="mr-1" />;
      default:
        return <Package size={14} className="mr-1" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error && !orders.length) {
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
      {/* Enhanced Live Status Indicator */}
      {showLiveIndicator && (
        <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
          sseConnected 
            ? 'px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs' 
            : 'px-3 py-2 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg text-xs animate-pulse'
        }`}>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${sseConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span>{sseConnected ? 'Live' : 'Connecting...'}</span>
            <span className="text-xs opacity-60">
              {Math.floor((new Date().getTime() - lastUpdateRef.current.getTime()) / 1000)}s ago
            </span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Enhanced Header with Controls */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Your Orders</h1>
            <p className="text-gray-600">Track and manage your purchases</p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Silent Mode Controls */}
            <div className="flex items-center space-x-2 bg-white/80 rounded-lg p-2 border border-gray-200">
              <button
                onClick={() => setSilentMode(!silentMode)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all text-sm ${
                  silentMode 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                title={silentMode ? 'Silent mode on - minimal interruptions' : 'Click to enable silent mode'}
              >
                {silentMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span>{silentMode ? 'Silent' : 'Normal'}</span>
              </button>
              
              <select
                value={autoRefreshInterval}
                onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                className="text-xs border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
                title="Auto-refresh interval"
              >
                <option value={0}>No auto-refresh</option>
                <option value={15}>15s refresh</option>
                <option value={30}>30s refresh</option>
                <option value={60}>1min refresh</option>
                <option value={120}>2min refresh</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={handleNotificationClick}
                className={`relative p-3 rounded-full transition-all duration-300 ${
                  hasNewOrder
                    ? 'bg-blue-100 ring-2 ring-blue-400' + (silentMode ? '' : ' animate-pulse')
                    : 'bg-white hover:bg-gray-100'
                }`}
              >
                <Bell className={`w-6 h-6 ${hasNewOrder ? 'text-blue-600' : 'text-gray-600'}`} />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </button>

              {/* Enhanced Notification Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border border-gray-200">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-700">Notifications</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setMinimizeNotifications(!minimizeNotifications)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                        title={minimizeNotifications ? 'Show all notifications' : 'Minimize notifications'}
                      >
                        {minimizeNotifications ? 'Show all' : 'Minimize'}
                      </button>
                      {newOrders.length > 0 && (
                        <button
                          onClick={handleNotificationClear}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {newOrders.length > 0 ? (
                      newOrders.slice(0, 20).map((order) => (
                        <div
                          key={order._id}
                          className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            toggleOrderExpansion(order._id);
                            setShowNotifications(false);
                          }}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <Package className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">
                                {order.status === "pending" ? "New Order Placed" : "Order Updated"}
                              </p>
                              <p className="text-sm text-gray-600">Order #{order._id.slice(-6)}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(order.createdAt).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-gray-500">
                        <Bell className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                        <p>No new notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Display (non-blocking) */}
        {error && orders.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

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
                <div
                  className="p-4 sm:p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleOrderExpansion(order._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                          Order #{order?._id ? order._id.slice(-6) : 'N/A'}
                        </h2>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(
                            order.status,
                            order.deliveryStatus
                          )}`}
                        >
                          {getStatusIcon(order.status, order.deliveryStatus)}
                          {order.deliveryStatus === "delivered"
                            ? "Delivered"
                            : order.deliveryStatus === "en_route"
                            ? "En Route"
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
                          <span>
                            {order.items.length} item{order.items.length > 1 ? "s" : ""}
                          </span>
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

                {expandedOrders.has(order._id) && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-gray-100 bg-gray-50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <Package size={20} className="text-red-500" />
                          Items Ordered
                        </h3>
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div
                              key={item.productId._id}
                              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                            >
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
                            <div className="flex justify-between font-semibold text-gray-900">
                              <span>Total</span>
                              <span>₦{order.totalAmount.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin size={20} className="text-red-500" />
                      Delivery Information
                    </h3>
                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="space-y-2 text-sm text-gray-600">
                        <p><span className="font-semibold">Name:</span> {order.customerInfo.name}</p>
                        <p><span className="font-semibold">Email:</span> {order.customerInfo.email}</p>
                        <p><span className="font-semibold">Phone:</span> {order.customerInfo.phone}</p>
                        <p><span className="font-semibold">Address:</span> {order.customerInfo.address}, {order.customerInfo.city}, {order.customerInfo.state}</p>
                        <p><span className="font-semibold">Delivery Option:</span> {order.customerInfo.deliveryOption}</p>
                        {order.customerInfo.pickupLocation && (
                          <p><span className="font-semibold">Pickup Location:</span> {order.customerInfo.pickupLocation}</p>
                        )}
                        <p><span className="font-semibold">Estimated Delivery:</span> {formatDate(order.customerInfo.estimatedDelivery)}</p>
                      </div>
                    </div>

                    {order.prescriptionUrl && (
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <FileText size={18} className="text-red-500" />
                          Prescription
                        </h4>
                        <a
                          href={`https://ollanbackend.vercel.app/${order.prescriptionUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View Prescription
                        </a>
                      </div>
                    )}

                    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <CreditCard size={18} className="text-red-500" />
                        Payment Details
                      </h4>
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Reference:</span> {order.paymentReference}
                      </p>
                    </div>

                    {order.rider && (
                      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Truck size={18} className="text-red-500" />
                          Rider Information
                        </h4>
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Name:</span> {order.rider.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
</div>  );
};export default UserOrders;

