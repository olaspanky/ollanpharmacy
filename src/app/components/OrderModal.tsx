'use client';

import { useState } from 'react';
import { Order, Rider } from '../../types/order';
import { UserPlus } from 'lucide-react';

interface OrderModalProps {
  order: Order;
  onClose: () => void;
  riders?: Rider[];
  onAssignRider?: (orderId: string, action: 'assign-rider', riderId: string) => Promise<void>;
  isRider: boolean;
}

export default function OrderModal({ order, onClose, riders = [], onAssignRider, isRider }: OrderModalProps) {
  const [selectedRiderId, setSelectedRiderId] = useState<string>('');

  const handleAssignRider = async () => {
    if (selectedRiderId && onAssignRider) {
      try {
        await onAssignRider(order._id, 'assign-rider', selectedRiderId);
        setSelectedRiderId('');
      } catch (err) {
        console.error('Error assigning rider:', err);
      }
    }
  };

  return (
    <div className="fixed w-7xl text-black inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4">Order Details</h2>
        <p><strong>Order ID:</strong> {order._id}</p>
        <p><strong>Customer:</strong> {order.customerInfo.name}</p>
        <p><strong>Email:</strong> {order.customerInfo.email}</p>
        <p><strong>Phone:</strong> {order.customerInfo.phone}</p>
        <p><strong>Location:</strong> {order.customerInfo.pickupLocation}</p>
        <p><strong>Delivery Option:</strong> {order.customerInfo.deliveryOption}</p>
        <p><strong>Estimated Delivery:</strong> {order.customerInfo.estimatedDelivery}</p>
        <p><strong>Status:</strong> {order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
        {order.riderName && <p><strong>Assigned Rider:</strong> {order.riderName}</p>}
        <p><strong>Items:</strong></p>
        <ul className="list-disc pl-5">
          {order.items.map((item) => (
            <li key={item.productId._id}>
              {item.productId.name} - {item.quantity} x ₦{item.price}
            </li>
          ))}
        </ul>
        {order.prescriptionUrl && (
          <p>
            <strong>Prescription:</strong>
            <a href={order.prescriptionUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              View
            </a>
          </p>
        )}
        {/* <p><strong>Delivery Fee:</strong> ₦{order.deliveryFee.toLocaleString()}</p> */}
        <p><strong>Total:</strong> ₦{order.totalAmount.toLocaleString()}</p>

        {!isRider  && !order.riderId && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Assign Rider</h3>
            {riders.length === 0 ? (
              <p className="text-red-600">No riders available</p>
            ) : (
              <div className="flex items-center gap-4">
                <select
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedRiderId}
                  onChange={(e) => setSelectedRiderId(e.target.value)}
                >
                  <option value="">Select a rider</option>
                  {riders.map((rider) => (
                    <option key={rider._id} value={rider._id}>
                      {rider.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssignRider}
                  disabled={!selectedRiderId}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Assign Rider</span>
                </button>
              </div>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  );
}