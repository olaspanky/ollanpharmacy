'use client';

import { useState, useEffect } from 'react';
import { fetchAdminOrders, updateOrderStatus, fetchRiders, assignRider } from '../../lib/api2';
import { Order, Rider } from '../../types/order';
import OrderCard from './OrderCard';
import OrderModal from './OrderModal';
import { Bell, Search, Filter, LogOut, Package, TrendingUp, Users, Clock } from 'lucide-react';
import { AxiosError } from 'axios';
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from './Navbar2';
// Define the expected error response structure
interface ApiErrorResponse {
  message?: string;
}

export default function SellerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
    const router = useRouter();
    const { user, logout } = useAuth();

  const loadOrders = async () => {
    try {
      console.log('Fetching seller orders...');
      const data = await fetchAdminOrders();
      console.log('Orders received:', data);
      const sortedOrders = data.sort((a: Order, b: Order) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sortedOrders);
    } catch (err) {
      console.error('Error in loadOrders:', err);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const loadRiders = async () => {
    try {
      console.log('Fetching riders...');
      const data = await fetchRiders();
      console.log('Riders received:', data);
      setRiders(data);
    } catch (err) {
      console.error('Error in loadRiders:', err);
      setError('Failed to load riders');
    }
  };

  useEffect(() => {
    loadOrders();
    loadRiders();
    const refreshInterval = setInterval(loadOrders, 120000);
    return () => clearInterval(refreshInterval);
  }, []);

    const handleLogout = async () => {
    try {
      await logout();

      router.push("/pages/signin");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

 const handleAction = async (
  orderId: string,
  action: 'accept' | 'reject' | 'en_route' | 'delivered' | 'assign-rider',
  riderId?: string
) => {
  try {
    console.log(`Handling action ${action} for order ${orderId}${riderId ? ` with rider ${riderId}` : ''}`);
    setError(null); // Clear previous errors

    if (action === 'assign-rider' && riderId) {
      const updatedOrder = await assignRider(orderId, riderId);
      await loadOrders();
    } else if (action === 'accept' || action === 'reject') {
      const updatedOrder = await updateOrderStatus(orderId, action);
      await loadOrders();
    } else {
      setError(`Action ${action} is not supported for sellers`);
    }
  } catch (err) {
    const axiosError = err as AxiosError<ApiErrorResponse>;
    console.error(`Error handling action ${action} for order ${orderId}:`, {
      message: axiosError.message,
      response: axiosError.response?.data,
      status: axiosError.response?.status,
    });
    setError(axiosError.response?.data?.message || `Failed to ${action === 'assign-rider' ? 'assign rider to' : action} order`);
  }
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
  };

  if (loading) {
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
      {/* Header */}
     <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Accepted</p>
                <p className="text-3xl font-bold text-emerald-600">{stats.accepted}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
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
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="processing">Processing</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-center space-x-3">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Orders Grid - Grouped by Date */}
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
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Empty State */}
        {filteredOrders.length === 0 && !loading && (
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
      </div>

      {/* Order Modal */}
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