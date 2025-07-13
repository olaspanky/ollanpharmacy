'use client';

import { Order } from '../../types/order';
import { Package, Eye, Check, X, MapPin, DollarSign, Truck, Users } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  onView: () => void;
  onAction: (orderId: string, action: 'accept' | 'reject' | 'en_route' | 'delivered') => Promise<void>;
  isRider: boolean;
}

export default function OrderCard({ order, onView, onAction, isRider }: OrderCardProps) {
  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'accepted':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'rejected':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'assigned':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'en_route':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const currentStatus = isRider ? (order.deliveryStatus || 'assigned') : order.status;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">Order #{order._id.slice(-6)}</h3>
            <p className="text-slate-500 text-sm">Click to view details</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(currentStatus)}`}>
          {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
        </span>
      </div>

      {/* Order Details */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center space-x-3">
          <Users className="w-4 h-4 text-slate-400" />
          <div>
            <p className="text-sm text-slate-500">Customer</p>
            <p className="font-semibold text-slate-800">{order.customerInfo.name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <MapPin className="w-4 h-4 text-slate-400" />
          <div>
            <p className="text-sm text-slate-500">Pickup Location</p>
            <p className="font-semibold text-slate-800">{order.customerInfo.pickupLocation}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <DollarSign className="w-4 h-4 text-slate-400" />
          <div>
            <p className="text-sm text-slate-500">Total Amount</p>
            <p className="font-bold text-slate-800 text-lg">₦{order.totalAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onView}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex-1 justify-center"
        >
          <Eye className="w-4 h-4" />
          <span>View Details</span>
        </button>
        {isRider && order.deliveryStatus !== 'delivered' && (
          <>
            <button
              onClick={() => onAction(order._id, 'en_route')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={order.deliveryStatus === 'en_route'}
            >
              <Truck className="w-4 h-4" />
              <span>En Route</span>
            </button>
            <button
              onClick={() => onAction(order._id, 'delivered')}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Delivered</span>
            </button>
          </>
        )}
        {!isRider && order.status === 'pending' && (
          <>
            <button
              onClick={() => onAction(order._id, 'accept')}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Accept</span>
            </button>
            <button
              onClick={() => onAction(order._id, 'reject')}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Reject</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}