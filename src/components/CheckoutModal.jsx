import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function CheckoutModal({ isOpen, onClose, items, totalAmount, onSuccess, user }) {
    const [loading, setLoading] = useState(false);
    const [orderDetails, setOrderDetails] = useState({
        name: user?.user_metadata?.full_name || '',
        phone: user?.user_metadata?.phone || '',
        address: '',
        pincode: ''
    });

    if (!isOpen) return null;

    const handleOrderInput = (e) => {
        const { name, value } = e.target;
        setOrderDetails((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmitOrder = async (e) => {
        e.preventDefault();

        if (!orderDetails.name || !orderDetails.phone || !orderDetails.address || !orderDetails.pincode) {
            alert('Please fill in all required fields');
            return;
        }

        if (!/^[6-9]\d{9}$/.test(orderDetails.phone)) {
            alert('Please enter a valid 10-digit Indian mobile number');
            return;
        }

        try {
            setLoading(true);

            // 1. Create Order
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert([
                    {
                        user_id: user?.id || null, // Link to user if logged in
                        total_amount: totalAmount,
                        status: 'pending',
                        shipping_address: JSON.stringify({
                            name: orderDetails.name,
                            phone: orderDetails.phone,
                            address: orderDetails.address,
                            pincode: orderDetails.pincode
                        })
                    }
                ])
                .select()
                .single();

            if (orderError) throw orderError;

            // 2. Create Order Items
            const orderItems = items.map(item => ({
                order_id: orderData.id,
                product_id: item.product_id || item.product.id, // Handle both cart items and direct product objects
                quantity: item.quantity,
                price_at_purchase: item.price || item.product.price // Handle both structures
            }));

            const { error: itemError } = await supabase.from('order_items').insert(orderItems);

            if (itemError) throw itemError;

            alert('Order placed successfully! We will contact you soon.');
            onSuccess(); // Callback to clear cart or close modal
            onClose();

        } catch (err) {
            console.error('Order placement failed:', err);
            alert('Failed to place order: ' + (err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 md:p-8 bg-coconut-green text-white">
                    <h2 className="text-2xl font-bold">Complete Your Order</h2>
                    <p className="text-white/90 mt-1">
                        {items.length} item{items.length > 1 ? 's' : ''} • Total: ₹{totalAmount.toFixed(2)}
                    </p>
                </div>

                <form onSubmit={handleSubmitOrder} className="p-6 md:p-8 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                        <input
                            type="text"
                            name="name"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coconut-green/40 focus:border-coconut-green"
                            placeholder="Enter your full name"
                            value={orderDetails.name}
                            onChange={handleOrderInput}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
                        <input
                            type="tel"
                            name="phone"
                            required
                            pattern="[6-9][0-9]{9}"
                            maxLength={10}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coconut-green/40 focus:border-coconut-green"
                            placeholder="9876543210"
                            value={orderDetails.phone}
                            onChange={handleOrderInput}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Address *</label>
                        <textarea
                            name="address"
                            required
                            rows={3}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coconut-green/40 focus:border-coconut-green resize-y"
                            placeholder="House no, Street name, Area, Landmark..."
                            value={orderDetails.address}
                            onChange={handleOrderInput}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Pincode *</label>
                        <input
                            type="text"
                            name="pincode"
                            required
                            pattern="\d{6}"
                            maxLength={6}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coconut-green/40 focus:border-coconut-green"
                            placeholder="638052"
                            value={orderDetails.pincode}
                            onChange={handleOrderInput}
                        />
                    </div>

                    <div className="pt-6 border-t border-gray-200">
                        <div className="flex justify-between text-lg mb-5">
                            <span className="text-gray-700">Total Amount:</span>
                            <span className="font-bold text-gray-900">
                                ₹{totalAmount.toFixed(2)}
                            </span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-3.5 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex-1 py-3.5 font-bold rounded-xl text-white transition-all
                  ${loading ? 'bg-gray-400 cursor-wait' : 'bg-coconut-green hover:bg-coconut-dark shadow-lg'}
                `}
                            >
                                {loading ? 'Placing Order...' : 'Confirm & Place Order'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
