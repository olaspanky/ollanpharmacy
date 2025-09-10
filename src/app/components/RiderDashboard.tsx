'use client';

import { useState, useEffect } from 'react';
import { fetchRiderOrders, updateDeliveryStatus } from '../../lib/api2';
import { Order } from '../../types/order';
import OrderCard from './OrderCard2';
import OrderModal from './OrderModal';
import { Bell, Search, Filter, LogOut, Package, Truck, Check, Clock, Loader2, RefreshCw, X } from 'lucide-react';
import { AxiosError } from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import Navbar from './Navbar2';

// Define the expected error response structure
interface ApiErrorResponse {
  message?: string;
}

export default function RiderDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const router = useRouter();
  const { user, logout } = useAuth();

  const loadOrders = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      console.log('Fetching rider orders at:', new Date().toISOString());
      const data = await fetchRiderOrders();
      console.log('Orders received:', data);
      setOrders(data);
      setError(null);
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      console.error('Error in loadOrders:', {
        message: axiosError.message,
        response: axiosError.response?.data,
        status: axiosError.response?.status,
      });
      setError(axiosError.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const refreshInterval = setInterval(() => loadOrders(true), 120000);
    return () => clearInterval(refreshInterval);
  }, []);

  const handleAction = async (
    orderId: string,
    action: 'accept' | 'reject' | 'en_route' | 'delivered' | 'assign-rider' | 'verify-payment',
    riderId?: string,
    paymentDetails?: string
  ) => {
    try {
      console.log(`Handling action ${action} for order ${orderId}${riderId ? ` with rider ${riderId}` : ''}${paymentDetails ? ` with payment details` : ''}`);
      setError(null);

      const actionKey = `${orderId}-${action}${riderId ? `-${riderId}` : ''}${paymentDetails ? '-verify' : ''}`;
      setActionLoading((prev) => ({ ...prev, [actionKey]: true }));

      if (action === 'en_route' || action === 'delivered') {
        const updatedOrder = await updateDeliveryStatus(orderId, action);
        setOrders(
          orders.map((order) =>
            order._id === orderId ? { ...order, deliveryStatus: action } : order
          )
        );
      } else if (action === 'accept' || action === 'reject') {
        setError('Action not supported for riders');
      } else if (action === 'assign-rider') {
        setError('Riders cannot assign other riders');
      } else if (action === 'verify-payment') {
        setError('Payment verification is not supported for riders');
      }
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      console.error(`Error handling action ${action} for order ${orderId}:`, {
        message: axiosError.message,
        response: axiosError.response?.data,
        status: axiosError.response?.status,
      });
      setError(axiosError.response?.data?.message || `Failed to process action ${action}`);
    } finally {
      const actionKey = `${orderId}-${action}${riderId ? `-${riderId}` : ''}${paymentDetails ? '-verify' : ''}`;
      setActionLoading((prev) => {
        const newState = { ...prev };
        delete newState[actionKey];
        return newState;
      });
    }
  };

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

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === 'all' ||
      order.deliveryStatus === filterStatus ||
      (!order.deliveryStatus && filterStatus === 'assigned');
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: orders.length,
    assigned: orders.filter((o) => !o.deliveryStatus || o.deliveryStatus === 'assigned').length,
    enRoute: orders.filter((o) => o.deliveryStatus === 'en_route').length,
    delivered: orders.filter((o) => o.deliveryStatus === 'delivered').length,
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
      {/* Header */}
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Assigned</p>
                <p className="text-3xl font-bold text-slate-800 flex items-center">
                  {refreshing ? <Loader2 className="w-8 h-8 animate-spin" /> : stats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Assigned</p>
                <p className="text-3xl font-bold text-amber-600 flex items-center">
                  {refreshing ? <Loader2 className="w-8 h-8 animate-spin" /> : stats.assigned}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">En Route</p>
                <p className="text-3xl font-bold text-blue-600 flex items-center">
                  {refreshing ? <Loader2 className="w-8 h-8 animate-spin" /> : stats.enRoute}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Truck className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Delivered</p>
                <p className="text-3xl font-bold text-emerald-600 flex items-center">
                  {refreshing ? <Loader2 className="w-8 h-8 animate-spin" /> : stats.delivered}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                <Check className="w-6 h-6 text-white" />
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
                <option value="assigned">Assigned</option>
                <option value="en_route">En Route</option>
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

        {/* Error Message */}
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

        {/* Orders Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredOrders.map((order) => (
            <div
              key={order._id}
              className="transform hover:scale-105 transition-all duration-300"
            >
              <OrderCard
                order={order}
                onView={() => setSelectedOrder(order)}
                onAction={handleAction}
                isRider={true}
                actionLoading={actionLoading}
              />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && !loading && !refreshing && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-600 mb-2">
              No orders found
            </h3>
            <p className="text-slate-500">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'No orders assigned to you yet'}
            </p>
          </div>
        )}

        {/* Loading State for Orders */}
        {refreshing && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-slate-600">Refreshing orders...</p>
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
              isRider={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}