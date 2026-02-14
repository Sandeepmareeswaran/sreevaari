import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { ArrowRight, Star } from 'lucide-react';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            const { data, error } = await supabase
                .from('products')
                .select(`
          *,
          category:categories(name)
        `)
                .eq('is_featured', true)
                .limit(6);

            if (error) {
                console.error('Error fetching products:', error);
            } else {
                setProducts(data || []);
            }
            setLoading(false);
        }

        fetchProducts();
    }, []);

    return (
        <div className="space-y-20 pb-20">
            {/* Hero Section */}
            <section className="relative bg-gray-50 rounded-3xl overflow-hidden shadow-sm mx-4 md:mx-0 mt-6">
                <div className="flex flex-col md:flex-row items-center">
                    <div className="w-full md:w-1/2 p-10 md:p-20 z-10">
                        <span className="inline-block py-1 px-3 rounded-full bg-green-100 text-coconut-green text-xs font-bold tracking-widest uppercase mb-6">
                            100% Organic & Natural
                        </span>
                        <h1 className="text-5xl md:text-6xl font-bold text-coconut-green mb-6 leading-tight">
                            Sree Vaari <br />
                            <span className="text-gray-800">Traders</span>
                        </h1>
                        <p className="text-gray-500 text-lg mb-8 leading-relaxed max-w-md">
                            Bringing the pure essence of nature to your home. Premium quality coconuts, virgin oils, and eco-friendly coir products.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <Link
                                to="/products"
                                className="bg-coconut-green text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-coconut-dark hover:shadow-xl transition-all transform hover:-translate-y-1 flex items-center gap-2"
                            >
                                Shop Now <ArrowRight size={18} />
                            </Link>
                            <Link
                                to="/about"
                                className="bg-white text-gray-700 border border-gray-200 px-8 py-3 rounded-full font-bold hover:bg-gray-50 transition-colors"
                            >
                                Our Story
                            </Link>
                        </div>
                    </div>

                    <div className="w-full md:w-1/2 h-96 md:h-[600px] relative">
                        {/* Abstract Coconut Shape Background */}
                        <div className="absolute inset-0 bg-green-50 rounded-l-[50px] md:rounded-l-[100px]"></div>
                        <img
                            src="https://images.unsplash.com/photo-1596116399002-3694f4205b96?q=80&w=1000&auto=format&fit=crop"
                            alt="Fresh Coconuts"
                            className="absolute inset-0 w-full h-full object-cover mix-blend-multiply opacity-90"
                        />
                    </div>
                </div>
            </section>

            {/* Categories Preview */}
            <section className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-coconut-green mb-4">Curated Categories</h2>
                    <p className="text-gray-500 max-w-2xl mx-auto">Explore our wide range of coconut-based products, processed with care to retain their natural goodness.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { name: 'Fresh Coconuts', image: 'https://images.unsplash.com/photo-1624823183492-127976e568d4?auto=format&fit=crop&q=80&w=800', link: '/products?category=raw-coconuts' },
                        { name: 'Virgin Oils', image: 'https://images.unsplash.com/photo-1620803534873-100be64d0483?auto=format&fit=crop&q=80&w=800', link: '/products?category=coconut-oil' },
                        { name: 'Coir & Crafts', image: 'https://images.unsplash.com/photo-1615486511484-92e172cc416d?auto=format&fit=crop&q=80&w=800', link: '/products?category=coir-products' }
                    ].map((cat, idx) => (
                        <Link key={idx} to={cat.link} className="group relative rounded-2xl overflow-hidden h-80 shadow-md">
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10"></div>
                            <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute bottom-0 left-0 p-8 z-20">
                                <h3 className="text-white text-2xl font-bold mb-2">{cat.name}</h3>
                                <span className="text-white/80 text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                    Explore <ArrowRight size={14} />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Featured Products */}
            <section className="container mx-auto px-4 bg-white">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl font-bold text-coconut-green mb-2">Best Sellers</h2>
                        <p className="text-gray-500">Customer favorites selected just for you.</p>
                    </div>
                    <Link to="/products" className="hidden md:flex items-center gap-2 text-coconut-green font-bold hover:text-coconut-dark transition-colors">
                        View All <ArrowRight size={18} />
                    </Link>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coconut-green mx-auto"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {products.map((product) => (
                            <div key={product.id} className="bg-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-xl transition-all duration-300 group overflow-hidden flex flex-col h-full">
                                <div className="relative aspect-square overflow-hidden bg-gray-50">
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                                    />
                                    {product.stock <= 0 && (
                                        <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                                            Sold Out
                                        </div>
                                    )}
                                    <button className="absolute bottom-4 right-4 bg-white/90 backdrop-blur text-coconut-green p-3 rounded-full shadow-sm hover:bg-coconut-green hover:text-white transition-all transform translate-y-12 group-hover:translate-y-0 opacity-0 group-hover:opacity-100">
                                        <ShoppingCart size={18} />
                                    </button>
                                </div>

                                <div className="p-5 flex flex-col flex-grow">
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                                        {product.category?.name}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-coconut-green transition-colors line-clamp-2">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center mb-3">
                                        <div className="flex text-yellow-400 overflow-hidden text-xs">
                                            {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                                        </div>
                                        <span className="text-gray-400 text-xs ml-2">(4.9)</span>
                                    </div>
                                    <div className="mt-auto flex items-center justify-between">
                                        <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-12 text-center md:hidden">
                    <Link to="/products" className="inline-block bg-white border border-gray-200 text-gray-800 font-bold px-8 py-3 rounded-full hover:bg-gray-50 transition-colors">
                        View All Products
                    </Link>
                </div>
            </section>

            {/* Trust Badges */}
            <section className="bg-green-50 py-16">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="p-6">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-coconut-green mx-auto mb-4 shadow-sm">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">100% Quality Guarantee</h3>
                            <p className="text-gray-500 text-sm">Sourced directly from certified organic farms.</p>
                        </div>
                        <div className="p-6">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-coconut-green mx-auto mb-4 shadow-sm">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Fast Delivery</h3>
                            <p className="text-gray-500 text-sm">Fresh products delivered to your doorstep within 24hrs.</p>
                        </div>
                        <div className="p-6">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-coconut-green mx-auto mb-4 shadow-sm">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800 mb-2">Secure Payment</h3>
                            <p className="text-gray-500 text-sm">Multiple secure payment options including UPI & Cards.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
