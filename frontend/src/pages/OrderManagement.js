import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { orderAPI } from '../services/api';
import { toast } from 'react-toastify';

export default function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadOrders();
  }, [filter]);

  const loadOrders = async () => {
    try {
      const params = filter !== 'all' ? { status_filter: filter } : {};
      const response = await orderAPI.getAll(params);
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.update(orderId, { status: newStatus });
      toast.success('Order status updated');
      loadOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      preparing: 'bg-blue-100 text-blue-800',
      ready: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <Layout title="Order Management"><div>Loading...</div></Layout>;
  }

  return (
    <Layout title="Order Management">
      <div className="mb-6 flex space-x-4">
        {['all', 'pending', 'preparing', 'ready', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`btn ${filter === status ? 'btn-primary' : 'bg-gray-200'}`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {orders.map((order) => (
          <div key={order.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">Order #{order.id}</h3>
                <p className="text-gray-600 text-sm">
                  {new Date(order.timestamp).toLocaleString()}
                </p>
                {order.table_id && (
                  <p className="text-gray-600 text-sm">Table: {order.table_id}</p>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold mb-2">Items:</h4>
              <ul className="space-y-1">
                {order.items.map((item, index) => (
                  <li key={index} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t pt-4 mb-4">
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span className="text-primary">${order.total_price.toFixed(2)}</span>
              </div>
              <div className="text-sm text-gray-600 mt-2">
                Payment: {order.payment_status} {order.payment_method && `(${order.payment_method})`}
              </div>
            </div>

            {order.status !== 'completed' && order.status !== 'cancelled' && (
              <div className="flex space-x-2">
                {order.status === 'pending' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                    className="btn btn-primary flex-1"
                  >
                    Start Preparing
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'ready')}
                    className="btn btn-success flex-1"
                  >
                    Mark Ready
                  </button>
                )}
                {order.status === 'ready' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'completed')}
                    className="btn btn-success flex-1"
                  >
                    Complete
                  </button>
                )}
                <button
                  onClick={() => updateOrderStatus(order.id, 'cancelled')}
                  className="btn btn-danger flex-1"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}

        {orders.length === 0 && (
          <div className="card text-center text-gray-500">
            No orders found
          </div>
        )}
      </div>
    </Layout>
  );
}
