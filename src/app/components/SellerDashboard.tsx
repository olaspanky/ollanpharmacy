'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchAdminOrders, updateOrderStatus, fetchRiders, assignRider, verifyPayment } from '../../lib/api2';
import { Order, Rider } from '../../types/order';
import OrderCard from './OrderCard';
import OrderModal from './OrderModal';
import { Bell, Search, Filter, LogOut, Package, TrendingUp, Users, Clock, Loader2, RefreshCw, X } from 'lucide-react';
import { AxiosError } from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from './Navbar2';

interface ApiErrorResponse {
  message?: string;
}

export default function SellerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [ridersLoading, setRidersLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [sseConnected, setSseConnected] = useState<boolean>(false);
  const [hasNewOrder, setHasNewOrder] = useState<boolean>(false);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [newOrders, setNewOrders] = useState<Order[]>([]);
  const router = useRouter();
  const { user, logout } = useAuth();
  
  // Refs for audio and previous orders count
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const previousOrdersCount = useRef<number>(0);
  const notificationAudioPlayed = useRef<boolean>(false);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio('/notification-sound.mp3'); // Add a notification sound file to your public folder
    // Fallback to a base64 encoded simple beep sound if custom file doesn't exist
    if (typeof window !== 'undefined' && !audioRef.current.src) {
      audioRef.current.src = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA/+M4wAAAAAAAAAAAAEluZm8AAAAPAAAAAwAAAbkAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV////////////////////////////////////////////////////////////////////////////AAAAAExhdmM1OC4xMwAAAAAAAAAAAAAAACQDgAAAAAAAAbkAtxBjlgAAAAAAAAAAAAAAAAAAAAA=';
    }
  }, []);

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => {
        console.log('Audio play failed:', err);
        // Fallback to using the browser's Audio API if the ref method fails
        const audio = new Audio('/notification-sound.mp3');
        audio.play().catch(e => console.log('Fallback audio also failed:', e));
      });
    }
  };

  const loadOrders = useCallback(async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      console.log('Fetching seller orders at:', new Date().toISOString());
      const data = await fetchAdminOrders();
      console.log('Orders received:', data);
      const sortedOrders = data.sort((a: Order, b: Order) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Check if we have new orders compared to previous state
      if (orders.length > 0 && sortedOrders.length > orders.length) {
        const newOrderIds = sortedOrders.map(o => o._id);
        const currentOrderIds = orders.map(o => o._id);
        const actualNewOrders = sortedOrders.filter(o => !currentOrderIds.includes(o._id));
        
        if (actualNewOrders.length > 0) {
          setNewOrders(prev => [...actualNewOrders, ...prev]);
          setNotificationCount(prev => prev + actualNewOrders.length);
          setHasNewOrder(true);
          
          // Only play sound if we're not in the initial load
          if (previousOrdersCount.current > 0) {
            playNotificationSound();
          }
        }
      }
      
      previousOrdersCount.current = sortedOrders.length;
      setOrders(sortedOrders);
      setError(null);
    } catch (err) {
      console.error('Error in loadOrders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [orders.length]);

  const loadRiders = useCallback(async () => {
    try {
      setRidersLoading(true);
      console.log('Fetching riders...');
      const data = await fetchRiders();
      console.log('Riders received:', data);
      setRiders(data);
    } catch (err) {
      console.error('Error in loadRiders:', err);
      setError('Failed to load riders');
    } finally {
      setRidersLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load
    loadOrders();
    loadRiders();

    let sse: EventSource | null = null;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;

    const setupSSE = () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found for SSE');
          return;
        }

        // Create SSE connection with token as query parameter
        sse = new EventSource(`https://ollanbackend.vercel.app/api/orders/stream?token=${encodeURIComponent(token)}`);

        sse.onopen = () => {
          console.log('SSE connection established');
          setSseConnected(true);
          setError(null);
          reconnectAttempts = 0;
        };

        sse.onmessage = (event) => {
          try {
            // Handle heartbeat messages
            if (event.data.trim() === ': heartbeat') {
              console.log('SSE heartbeat received');
              return;
            }
            
            const updatedOrder = JSON.parse(event.data);
            console.log('SSE order update received:', updatedOrder);
            
            setOrders((prev) => {
              // Check if this is a new order (not in current list)
              const isNewOrder = !prev.some(o => o._id === updatedOrder._id);
              
              if (isNewOrder) {
                // Play notification sound for new orders
                playNotificationSound();
                setHasNewOrder(true);
                setNotificationCount(prevCount => prevCount + 1);
                setNewOrders(prevOrders => [updatedOrder, ...prevOrders]);
              }
              
              // Remove the old version of this order if it exists
              const filteredOrders = prev.filter((o) => o._id !== updatedOrder._id);
              // Add the updated order at the beginning
              const updatedOrders = [updatedOrder, ...filteredOrders];
              // Sort by creation date (newest first)
              return updatedOrders.sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );
            });
          } catch (err) {
            console.error('SSE message parse error:', err);
          }
        };

        sse.onerror = (error) => {
          console.error('SSE connection error:', error);
          setSseConnected(false);
          
          if (reconnectAttempts < maxReconnectAttempts) {
            reconnectAttempts++;
            console.log(`Attempting to reconnect SSE (${reconnectAttempts}/${maxReconnectAttempts})...`);
            setTimeout(() => {
              if (sse) {
                sse.close();
              }
              setupSSE();
            }, 2000 * reconnectAttempts); // Exponential backoff
          } else {
            setError('Failed to connect to real-time updates. Please refresh the page.');
          }
        };
      } catch (err) {
        console.error('SSE setup error:', err);
        setError('Failed to set up real-time updates');
      }
    };

    setupSSE();

    return () => {
      if (sse) {
        sse.close();
      }
    };
  }, [loadOrders, loadRiders]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/pages/signin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleRefresh = () => {
    loadOrders(true);
  };

  const handleAction = async (
    orderId: string,
    action: 'accept' | 'reject' | 'en_route' | 'delivered' | 'assign-rider' | 'verify-payment',
    riderId?: string,
    paymentDetails?: string
  ) => {
    try {
      console.log(`Handling action ${action} for order ${orderId}${riderId ? ` with rider ${riderId}` : ''}${paymentDetails ? ` with payment details` : ''}`);
      setError(null);

      const actionKey = `${orderId}-${action}${riderId ? `-${riderId}` : ''}${paymentDetails ? `-verify` : ''}`;
      setActionLoading((prev) => ({ ...prev, [actionKey]: true }));

      if (action === 'assign-rider' && riderId) {
        await assignRider(orderId, riderId);
      } else if (action === 'accept' || action === 'reject') {
        await updateOrderStatus(orderId, action);
      } else if (action === 'verify-payment' && paymentDetails) {
        await verifyPayment(orderId, paymentDetails);
      } else {
        setError(`Action ${action} is not supported for sellers`);
      }

      // Refresh orders after action to ensure we have the latest state
      await loadOrders(true);
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      console.error(`Error handling action ${action} for order ${orderId}:`, {
        message: axiosError.message,
        response: axiosError.response?.data,
        status: axiosError.response?.status,
      });
      setError(axiosError.response?.data?.message || `Failed to ${action === 'assign-rider' ? 'assign rider to' : action === 'verify-payment' ? 'verify payment for' : action} order`);
    } finally {
      const actionKey = `${orderId}-${action}${riderId ? `-${riderId}` : ''}${paymentDetails ? `-verify` : ''}`;
      setActionLoading((prev) => {
        const newState = { ...prev };
        delete newState[actionKey];
        return newState;
      });
    }
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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const ordersByDate: { [key: string]: Order[] } = {};
  filteredOrders.forEach((order) => {
    const date = new Date(order.createdAt).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (!ordersByDate[date]) {
      ordersByDate[date] = [];
    }
    ordersByDate[date].push(order);
  });

  const stats = {
    total: orders.length,
    accepted: orders.filter((o) => o.status === 'accepted').length,
    rejected: orders.filter((o) => o.status === 'rejected').length,
    processing: orders.filter((o) => o.status === 'processing').length,
    pending: orders.filter((o) => o.status === 'pending').length,
  };

  if (loading && !refreshing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />
      
      {/* SSE Connection Status Indicator */}
      <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
        sseConnected 
          ? 'bg-green-100 text-green-800 border border-green-300' 
          : 'bg-yellow-100 text-yellow-800 border border-yellow-300'
      }`}>
        {sseConnected ? '🟢 Live updates connected' : '🟡 Connecting to updates...'}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Notification Bell */}
        <div className="flex justify-end mb-4">
          <div className="relative">
            <button
              onClick={handleNotificationClick}
              className={`relative p-3 rounded-full transition-all duration-300 ${
                hasNewOrder 
                  ? 'bg-blue-100 animate-pulse ring-2 ring-blue-400' 
                  : 'bg-white hover:bg-slate-100'
              }`}
            >
              <Bell className={`w-6 h-6 ${hasNewOrder ? 'text-blue-600' : 'text-slate-600'}`} />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
            
            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border border-slate-200">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-semibold text-slate-700">Notifications</h3>
                  {newOrders.length > 0 && (
                    <button 
                      onClick={handleNotificationClear}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {newOrders.length > 0 ? (
                    newOrders.map((order) => (
                      <div 
                        key={order._id} 
                        className="p-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 cursor-pointer"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowNotifications(false);
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="bg-blue-100 p-2 rounded-full">
                            <Package className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-slate-800">New Order Received</p>
                            <p className="text-sm text-slate-600">Order #{order._id.slice(-6)}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              {new Date(order.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-slate-500">
                      <Bell className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                      <p>No new notifications</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-slate-800 flex items-center">
                  {refreshing ? <Loader2 className="w-8 h-8 animate-spin" /> : stats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          {/* Other stat cards unchanged */}
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search orders by ID or customer name..."
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                className="pl-10 pr-8 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[160px]"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="assigned">Assigned</option>
                <option value="in-transit">In Transit</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-center justify-between">
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

        {ridersLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 flex items-center space-x-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <p className="text-blue-700">Loading riders...</p>
          </div>
        )}

        {Object.entries(ordersByDate).map(([date, ordersForDate]) => (
          <div key={date} className="mb-12">
            <h2 className="text-xl font-semibold text-slate-700 mb-4">{date}</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {ordersForDate.map((order) => (
                <div key={order._id} className="transform hover:scale-105 transition-all duration-300">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                    <OrderCard
                      order={order}
                      onView={() => setSelectedOrder(order)}
                      onAction={handleAction}
                      isRider={false}
                      actionLoading={actionLoading}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && !loading && !refreshing && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No orders found</h3>
            <p className="text-slate-500">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Orders will appear here once customers start placing them'}
            </p>
          </div>
        )}

        {refreshing && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-slate-600">Refreshing orders...</p>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="transform transition-all duration-300 scale-100">
            <OrderModal
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
              riders={riders}
              onAssignRider={handleAction}
              isRider={false}
            />
          </div>
        </div>
      )}
    </div>
  );
}