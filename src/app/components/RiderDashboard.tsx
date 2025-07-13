"use client";

import { useState, useEffect } from "react";
import { fetchRiderOrders, updateDeliveryStatus } from "../../lib/api2";
import { Order } from "../../types/order";
import OrderCard from "./OrderCard";
import OrderModal from "./OrderModal";
import {
  Bell,
  Search,
  Filter,
  LogOut,
  Package,
  Truck,
  Check,
  Clock,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from './Navbar2';


export default function RiderDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const router = useRouter();
  const { user, logout } = useAuth();

  useEffect(() => {
    const loadOrders = async () => {
      try {
        console.log("Fetching rider orders...");
        const data = await fetchRiderOrders();
        console.log("Orders received:", data);
        setOrders(data);
      } catch (err) {
        console.error("Error in loadOrders:", err);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);

  const handleAction = async (
    orderId: string,
    action: "accept" | "reject" | "en_route" | "delivered" | "assign-rider",
    riderId?: string
  ) => {
    try {
      console.log(`Handling action ${action} for order ${orderId}`);
      if (action === "en_route" || action === "delivered") {
        const updatedOrder = await updateDeliveryStatus(orderId, action);
        setOrders(
          orders.map((order) =>
            order._id === orderId ? { ...order, deliveryStatus: action } : order
          )
        );
      } else if (action === "accept" || action === "reject") {
        // Handle accept/reject logic (e.g., call a different API or update state)
        console.log(`Action ${action} for order ${orderId}`);
        // Example: Update state or call another function
      } else if (action === "assign-rider") {
        // Handle assign-rider logic
        if (riderId) {
          console.log(`Assigning rider ${riderId} to order ${orderId}`);
          // Example: Call assignRider API or update state
        } else {
          throw new Error("Rider ID required for assign-rider action");
        }
      }
    } catch (err) {
      console.error(
        `Error handling action ${action} for order ${orderId}:`,
        err
      );
      setError(`Failed to process action ${action}`);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerInfo?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      order.deliveryStatus === filterStatus ||
      (!order.deliveryStatus && filterStatus === "assigned");
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: orders.length,
    assigned: orders.filter(
      (o) => !o.deliveryStatus || o.deliveryStatus === "assigned"
    ).length,
    enRoute: orders.filter((o) => o.deliveryStatus === "en_route").length,
    delivered: orders.filter((o) => o.deliveryStatus === "delivered").length,
  };

  const handleLogout = async () => {
    try {
      await logout();

      router.push("/pages/signin");
    } catch (error) {
      console.error("Logout error:", error);
    }
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">
                  Total Assigned
                </p>
                <p className="text-3xl font-bold text-slate-800">
                  {stats.total}
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
                <p className="text-3xl font-bold text-amber-600">
                  {stats.assigned}
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
                <p className="text-3xl font-bold text-blue-600">
                  {stats.enRoute}
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
                <p className="text-3xl font-bold text-emerald-600">
                  {stats.delivered}
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
              />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && !loading && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-600 mb-2">
              No orders found
            </h3>
            <p className="text-slate-500">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria"
                : "No orders assigned to you yet"}
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
              isRider={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
