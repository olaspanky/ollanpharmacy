"use client";

import { Order } from "../../types/order";
import { Package, MapPin, Clock, User, CheckCircle2, Timer, AlertCircle, Truck } from "lucide-react";

interface OrderCardProps {
  order: Order;
  onView: () => void;
  onAction: (orderId: string, action: "accept" | "reject" | "en_route" | "delivered" | "assign-rider", riderId?: string) => Promise<void>;
  isRider: boolean;
}

export default function OrderCard({ order, onView, onAction, isRider }: OrderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "accepted":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "assigned":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in-transit":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "delivered":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Timer className="w-4 h-4" />;
      case "accepted":
        return <User className="w-4 h-4" />;
      case "assigned":
        return <User className="w-4 h-4" />;
      case "in-transit":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle2 className="w-4 h-4" />;
      case "cancelled":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Package className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Order #{order._id.slice(-6)}</h3>
        </div>
        <div
          className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}
        >
          {getStatusIcon(order.status)}
          <span className="text-sm font-medium">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-blue-600" />
          <p className="text-sm text-gray-600">{order.customerInfo.name}</p>
        </div>
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-green-600" />
          <p className="text-sm text-gray-600">{order.customerInfo.pickupLocation}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-orange-600" />
          <p className="text-sm text-gray-600">{order.customerInfo.estimatedDelivery || "N/A"}</p>
        </div>
        <div className="flex items-center space-x-2">
          <User className="w-4 h-4 text-orange-600" />
          <p className="text-sm text-gray-600">Rider: {order.rider ? order.rider.name : "Not Assigned"}</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm font-medium text-gray-900">₦{order.totalAmount.toLocaleString()}</p>
        <div className="space-x-2">
          <button
            onClick={onView}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            View Details
          </button>
          {!isRider && order.status === "pending" && (
            <>
              <button
                onClick={() => onAction(order._id, "accept")}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Accept
              </button>
              <button
                onClick={() => onAction(order._id, "reject")}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Reject
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}