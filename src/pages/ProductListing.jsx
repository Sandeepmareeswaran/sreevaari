import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { ShoppingCart, Filter, Search } from 'lucide-react';

export default function ProductListing() {
    const [searchParams] = useSearchParams();
    const categorySlug = searchParams.get('category');

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState(categorySlug || 'all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, [categorySlug]); // Re-fetch when URL param changes

    const fetchCategories = async () => {
        const { data } = await supabase.from('categories').select('id, name, slug');
        setCategories(data || []);
    };

    const fetchProducts = async () => {
        setLoading(true);
        let query = supabase.from('products').select('*, category:categories(name, slug)');

        if (categorySlug) {
            // If we have a slug, we need to filter by the category relation
            // However, supabase filtering on related tables is tricky with simple syntax
            // We'll fetch all and filter in client for simplicity or use a specific query if needed.
            // Better approach: Join with category and filter.
            // Since our data size is small, fetching all and filtering is acceptable for now, 
            // but let's try to filter by category_id if we can resolve slug to ID.
            // For now, let's just fetch all and filter client side if the query is complex
        }

        const { data, error } = await supabase.from('products').select('*, category:categories(name, slug)');

        if (error) {
            console.error('Error:', error);
        } else {
            let filtered = data || [];
            if (categorySlug) {
                // Map legacy slugs to IDs or Names if needed, or loosely match
                // Assuming categories have slugs like 'raw-coconuts', 'coconut-oil', 'coir-products'
                // If db categories don't have slugs, we might need to match by name or ID.
                // Let's filter by checking if the category name contains the search param keywords
                // or exact match if we had slugs in DB. 
                // EDIT: relying on partial match for now as DB might not have 'slug' column yet.
                const term = categorySlug.replace('-', ' ').toLowerCase();
                filtered = filtered.filter(p => p.category?.name.toLowerCase().includes(term) || p.category?.slug === categorySlug);
            }
            setProducts(filtered);
        }
        setLoading(false);
    };

    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 capitalize">
                        {categorySlug ? categorySlug.replace('-', ' ') : 'All Products'}
                    </h1>
                    <p className="text-gray-500">{filteredProducts.length} items found</p>
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-coconut-green/50"
                    />
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Filters */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Filter size={18} /> Categories
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/products"
                                    className={`block px-3 py-2 rounded-lg transition-colors ${!categorySlug ? 'bg-green-50 text-coconut-green font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    All Products
                                </Link>
                            </li>
                            {categories.map(cat => (
                                <li key={cat.id}>
                                    <Link
                                        to={`/products?category=${cat.slug || cat.name.toLowerCase().replace(/ /g, '-')}`}
                                        className={`block px-3 py-2 rounded-lg transition-colors ${categorySlug === (cat.slug || cat.name.toLowerCase().replace(/ /g, '-')) ? 'bg-green-50 text-coconut-green font-bold' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        {cat.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="flex-1">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coconut-green"></div>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-gray-500 text-lg">No products found in this category.</p>
                            <Link to="/products" className="text-coconut-green font-bold hover:underline mt-2 inline-block">View all products</Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map(product => (
                                <div key={product.id} className="bg-white rounded-xl border border-gray-100 hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col">
                                    <div className="relative aspect-square overflow-hidden bg-gray-50">
                                        <Link to={`/product/${product.id}`} className="block w-full h-full">
                                            <img
                                                src={product.image_url || '/images/cat_fresh.png'}
                                                alt={product.name}
                                                className="w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => e.target.src = '/images/cat_fresh.png'}
                                            />
                                        </Link>
                                        {product.stock <= 0 && (
                                            <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                                                Sold Out
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 flex flex-col flex-grow">
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                            {product.category?.name}
                                        </div>
                                        <Link to={`/product/${product.id}`} className="text-lg font-bold text-gray-800 mb-2 hover:text-coconut-green transition-colors line-clamp-1">
                                            {product.name}
                                        </Link>
                                        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{product.description}</p>

                                        <div className="mt-auto flex items-center justify-between">
                                            <span className="text-xl font-bold text-gray-900">₹{product.price}</span>
                                            <Link
                                                to={`/product/${product.id}`}
                                                className="p-2 bg-gray-100 text-gray-600 rounded-full hover:bg-coconut-green hover:text-white transition-colors"
                                            >
                                                <ShoppingCart size={18} />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
