import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import CheckoutModal from '../components/CheckoutModal';

export default function Cart() {
    const { cart, loading, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    if (loading && cart.length === 0) {
        return (
            <div className="min-h-[60vh] flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coconut-green"></div>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col justify-center items-center text-center px-4">
                <div className="bg-green-50 p-6 rounded-full text-coconut-green mb-6">
                    <ShoppingBag size={48} />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h1>
                <p className="text-gray-500 mb-8 max-w-xs mx-auto">Looks like you haven't added any fresh coconut products yet.</p>
                <Link
                    to="/products"
                    className="bg-coconut-green text-white px-8 py-3 rounded-full font-bold hover:bg-coconut-dark transition-colors inline-flex items-center gap-2"
                >
                    Start Shopping <ArrowRight size={18} />
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart ({cart.length} items)</h1>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                {/* Cart Items List */}
                <div className="flex-1 space-y-6">
                    {cart.map((item) => (
                        <div key={item.id} className="bg-white p-4 sm:p-6 rounded-xl border border-gray-100 flex gap-4 sm:gap-6 items-center shadow-sm">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-lg flex-shrink-0 p-2">
                                <img
                                    src={item.product?.image_url || '/images/cat_fresh.png'}
                                    alt={item.product?.name}
                                    className="w-full h-full object-contain mix-blend-multiply"
                                    onError={(e) => e.target.src = '/images/cat_fresh.png'}
                                />
                            </div>

                            <div className="flex-1">
                                <Link to={`/product/${item.product?.id}`} className="font-bold text-gray-800 hover:text-coconut-green transition-colors text-lg mb-1 block">
                                    {item.product?.name}
                                </Link>
                                <div className="text-sm text-gray-500 mb-2">
                                    ₹{item.product?.price} per unit
                                </div>

                                <div className="flex items-center gap-4">
                                    {/* Quantity Controls */}
                                    <div className="flex items-center border border-gray-200 rounded-lg h-9">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="px-3 h-full hover:bg-gray-50 text-gray-600 disabled:opacity-50"
                                            disabled={item.quantity <= 1}
                                        >
                                            <Minus size={14} />
                                        </button>
                                        <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="px-3 h-full hover:bg-gray-50 text-gray-600 disabled:opacity-50"
                                            disabled={item.quantity >= item.product?.stock}
                                        >
                                            <Plus size={14} />
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors ml-auto sm:ml-0"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="text-right font-bold text-lg text-gray-900 self-start sm:self-center">
                                ₹{(item.product?.price * item.quantity).toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="w-full lg:w-96 flex-shrink-0">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-24">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>

                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span className="text-green-600 font-medium">Free</span>
                            </div>
                            <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg text-gray-900">
                                <span>Total</span>
                                <span>₹{cartTotal.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsCheckoutOpen(true)}
                            className="w-full py-3 bg-coconut-green text-white font-bold rounded-xl hover:bg-coconut-dark shadow-lg shadow-coconut-green/20 transition-all flex items-center justify-center gap-2"
                        >
                            Proceed to Checkout
                        </button>

                        <div className="mt-6 text-xs text-gray-400 text-center">
                            Secure Checkout • 100% Organic Guarantee
                        </div>
                    </div>
                </div>
            </div>
            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                items={cart}
                totalAmount={cartTotal}
                onSuccess={clearCart}
                user={user}
            />
        </div>
    );
}
