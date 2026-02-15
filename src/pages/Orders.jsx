import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, Truck, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

export default function Orders() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null)

    useEffect(() => {
        if (user?.id) {
            fetchOrders();
        }
    }, [user?.id]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    items:order_items (
                        *,
                        product:products (name, image_url)
                    )
                `)
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleOrder = (orderId) => {
        if (expandedOrder === orderId) {
            setExpandedOrder(null);
        } else {
            setExpandedOrder(orderId);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock size={16} />;
            case 'processing': return <Package size={16} />;
            case 'shipped': return <Truck size={16} />;
            case 'delivered': return <CheckCircle size={16} />;
            case 'cancelled': return <XCircle size={16} />;
            default: return <Clock size={16} />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coconut-green"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Please log in to view your orders</h2>
                <Link to="/login" className="inline-block bg-coconut-green text-white px-6 py-3 rounded-lg font-bold hover:bg-coconut-dark transition-colors">
                    Login Now
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

            {orders.length === 0 ? (
                <div className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
                    <Package size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">No orders yet</h3>
                    <p className="text-gray-500 mb-6">Looks like you haven't bought anything from us yet.</p>
                    <Link to="/products" className="inline-block bg-coconut-green text-white px-6 py-3 rounded-lg font-bold hover:bg-coconut-dark transition-colors">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => {
                        const items = order.items || []; // Ensure items is an array
                        const shipping = order.shipping_address ? (typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address) : {};

                        return (
                            <div key={order.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                {/* Order Header */}
                                <div
                                    className="p-6 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50"
                                    onClick={() => toggleOrder(order.id)}
                                >
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="font-bold text-gray-900">Order #{order.id.slice(0, 8)}</h3>
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)} {order.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            Placed on {new Date(order.created_at).toLocaleDateString()} at {new Date(order.created_at).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Total Amount</p>
                                            <p className="text-xl font-bold text-coconut-green">₹{order.total_amount}</p>
                                        </div>
                                        {expandedOrder === order.id ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                                    </div>
                                </div>

                                {/* Order Details (Collapsible) */}
                                {expandedOrder === order.id && (
                                    <div className="border-t border-gray-200 p-6 animate-in slide-in-from-top-2 duration-200">

                                        {/* Items List */}
                                        <div className="space-y-4 mb-6">
                                            <h4 className="font-semibold text-gray-800 border-b border-gray-100 pb-2">Items Ordered</h4>
                                            {items.map((item) => (
                                                <div key={item.id} className="flex items-center gap-4 py-2">
                                                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                                                        <img
                                                            src={item.product?.image_url || '/images/cat_fresh.png'}
                                                            alt={item.product?.name}
                                                            className="w-full h-full object-cover mix-blend-multiply"
                                                            onError={(e) => e.target.src = '/images/cat_fresh.png'}
                                                        />
                                                    </div>
                                                    <div className="flex-grow">
                                                        <h5 className="font-medium text-gray-900">{item.product?.name || 'Unknown Product'}</h5>
                                                        <p className="text-sm text-gray-500">Qty: {item.quantity} x ₹{item.price_at_purchase}</p>
                                                    </div>
                                                    <div className="text-right font-medium text-gray-900">
                                                        ₹{(item.quantity * item.price_at_purchase).toFixed(2)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Shipping Address */}
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <h4 className="font-semibold text-gray-800 mb-2">Shipping Details</h4>
                                            {shipping && (
                                                <div className="text-sm text-gray-600 space-y-1">
                                                    <p className="font-medium text-gray-900">{shipping.name}</p>
                                                    <p>{shipping.address}</p>
                                                    <p>{shipping.pincode}</p>
                                                    <p>Phone: {shipping.phone}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
