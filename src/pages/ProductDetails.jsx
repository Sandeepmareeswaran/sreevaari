import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, ShoppingCart, Truck, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

import CheckoutModal from '../components/CheckoutModal';

export default function ProductDetails() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*, category:categories(name)')
                .eq('id', id)
                .single();

            if (error) throw error;
            setProduct(data);
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const { addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleAddToCart = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        await addToCart(product, quantity);
        alert("Added to cart!");
    };

    const handleBuyNow = () => {
        setIsCheckoutOpen(true);
    };

    if (loading && !product) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coconut-green mx-auto"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center text-gray-500">
                <p className="text-xl mb-4">Product not found</p>
                <Link to="/" className="text-coconut-green hover:underline">
                    ← Return to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative">
            <Link
                to="/products"
                className="inline-flex items-center text-gray-600 hover:text-coconut-green mb-6 md:mb-8 transition-colors"
            >
                <ArrowLeft size={20} className="mr-2" /> Back to Products
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
                {/* Product Image */}
                <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-center min-h-[400px] md:min-h-[500px] lg:h-[600px] overflow-hidden">
                    <img
                        src={product.image_url || '/images/cat_fresh.png'}
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply drop-shadow-2xl hover:scale-110 transition-transform duration-500"
                        onError={(e) => (e.target.src = '/images/cat_fresh.png')}
                    />
                </div>

                {/* Product Info */}
                <div className="flex flex-col">
                    <span className="text-coconut-green font-medium tracking-wide text-sm uppercase mb-3">
                        {product.category?.name || 'Coconut Products'}
                    </span>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        {product.name}
                    </h1>

                    <p className="text-gray-600 text-base md:text-lg mb-6 leading-relaxed">
                        {product.description || 'No detailed description available for this product.'}
                    </p>

                    <div className="flex items-end gap-4 mb-8">
                        <span className="text-4xl md:text-5xl font-bold text-gray-900">
                            ₹{Number(product.price).toFixed(2)}
                        </span>
                        {product.stock > 0 ? (
                            <span className="text-green-700 bg-green-50 px-4 py-1 rounded-full text-sm font-semibold">
                                In Stock ({product.stock} available)
                            </span>
                        ) : (
                            <span className="text-red-700 bg-red-50 px-4 py-1 rounded-full text-sm font-semibold">
                                Out of Stock
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-10 pb-8 border-b border-gray-200">
                        {/* Quantity Selector */}
                        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
                            <button
                                type="button"
                                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                                disabled={quantity <= 1}
                                className="px-5 py-3 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                −
                            </button>
                            <span className="px-6 py-3 font-semibold text-lg w-16 text-center border-x border-gray-300">
                                {quantity}
                            </span>
                            <button
                                type="button"
                                onClick={() => setQuantity((prev) => Math.min(product.stock, prev + 1))}
                                disabled={quantity >= product.stock}
                                className="px-5 py-3 text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                +
                            </button>
                        </div>

                        <div className="flex gap-4 flex-1">
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock <= 0 || loading}
                                className="flex-1 py-4 px-4 rounded-xl font-bold text-lg border-2 border-coconut-green text-coconut-green hover:bg-green-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <ShoppingBag size={22} />
                                Add to Cart
                            </button>

                            <button
                                onClick={handleBuyNow}
                                disabled={product.stock <= 0 || loading}
                                className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-md
                ${product.stock > 0
                                        ? 'bg-coconut-green text-white hover:bg-coconut-dark hover:shadow-lg'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                <ShoppingCart size={22} />
                                {product.stock > 0 ? 'Buy Now' : 'Out of Stock'}
                            </button>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-green-50 rounded-xl text-coconut-green">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Quality Guaranteed</h4>
                                <p className="text-sm text-gray-600">Sourced directly from trusted farmers</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-green-50 rounded-xl text-coconut-green">
                                <Truck size={24} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Fast Local Delivery</h4>
                                <p className="text-sm text-gray-600">Within 24 hours in most areas</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Checkout Modal */}
            <CheckoutModal
                isOpen={isCheckoutOpen}
                onClose={() => setIsCheckoutOpen(false)}
                items={[{
                    product: product,
                    quantity: quantity,
                    price: product.price
                }]}
                totalAmount={product.price * quantity}
                onSuccess={() => setQuantity(1)}
                user={user}
            />
        </div>
    );
}