import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { DollarSign, ShoppingBag, Package, TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
        </div>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalProducts: 0,
        activeUsers: 0,
        totalStock: 0,
        availableStock: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();

        // Real-time subscriptions
        const ordersSubscription = supabase
            .channel('orders-channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
                fetchStats();
            })
            .subscribe();

        const productsSubscription = supabase
            .channel('products-channel')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
                fetchStats();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(ordersSubscription);
            supabase.removeChannel(productsSubscription);
        };
    }, []);

    const fetchStats = async () => {
        try {
            // 1. Stats Metrics
            const { data: ordersData } = await supabase.from('orders').select('total_amount');
            const totalSales = ordersData?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;

            const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
            const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
            const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

            // Stock Metrics
            const { data: productsData } = await supabase.from('products').select('stock, name, id');
            const totalStock = productsData?.reduce((sum, product) => sum + (product.stock || 0), 0) || 0;
            const availableStock = productsData?.filter(p => p.stock > 0).length || 0;

            setStats({
                totalSales,
                totalOrders: ordersCount || 0,
                totalProducts: productsCount || 0,
                activeUsers: usersCount || 0,
                totalStock,
                availableStock
            });

            // 2. Recent Orders
            const { data: recentOrdersData } = await supabase
                .from('orders')
                .select('id, total_amount, status, created_at, user_id')
                .order('created_at', { ascending: false })
                .limit(5);
            setRecentOrders(recentOrdersData || []);

            // 3. Low Stock Alerts (Stock < 10)
            const lowStock = productsData?.filter(p => p.stock < 10) || [];
            setLowStockProducts(lowStock);

        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coconut-green"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                <p className="text-gray-500">Welcome back, Admin. Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Total Sales"
                    value={`₹${stats.totalSales.toLocaleString()}`}
                    icon={DollarSign}
                    color="bg-green-500"
                />
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={ShoppingBag}
                    color="bg-blue-500"
                />
                <StatCard
                    title="Total Products"
                    value={stats.totalProducts}
                    icon={Package}
                    color="bg-orange-500"
                />
                <StatCard
                    title="Total Stock Units"
                    value={stats.totalStock}
                    icon={Package}
                    color="bg-teal-500"
                />
                <StatCard
                    title="In-Stock Products"
                    value={stats.availableStock}
                    icon={TrendingUp}
                    color="bg-indigo-500"
                />
                <StatCard
                    title="Active Users"
                    value={stats.activeUsers}
                    icon={TrendingUp}
                    color="bg-purple-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Orders */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
                    </div>
                    <div className="space-y-4">
                        {recentOrders.length === 0 ? (
                            <p className="text-gray-400 text-center py-4">No recent orders</p>
                        ) : (
                            recentOrders.map(order => (
                                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-gray-800">Order #{order.id.slice(0, 8)}</p>
                                        <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-coconut-green">₹{order.total_amount}</p>
                                        <span className={`text-xs px-2 py-1 rounded-full capitalize ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                                                    'bg-gray-100 text-gray-800'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Low Stock Alerts */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-bold text-gray-800">Low Stock Alerts</h2>
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                            {lowStockProducts.length} items
                        </span>
                    </div>
                    <div className="space-y-4">
                        {lowStockProducts.length === 0 ? (
                            <p className="text-green-600 text-center py-4 font-medium">All stock levels are healthy!</p>
                        ) : (
                            lowStockProducts.map(product => (
                                <div key={product.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white rounded-md">
                                            <Package size={20} className="text-red-500" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{product.name}</p>
                                            <p className="text-sm text-red-600 font-medium">Only {product.stock} left</p>
                                        </div>
                                    </div>
                                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                        Restock
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
