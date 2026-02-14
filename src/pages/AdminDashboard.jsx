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
        activeUsers: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);

            // 1. Total Sales (Sum of total_amount in orders)
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('total_amount');

            const totalSales = ordersData?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;

            // 2. Total Orders Count
            const { count: ordersCount, error: ordersCountError } = await supabase
                .from('orders')
                .select('*', { count: 'exact', head: true });

            // 3. Total Products Count
            const { count: productsCount, error: productsCountError } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true });

            // 4. Active Users Count (Profiles)
            const { count: usersCount, error: usersCountError } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            if (ordersError || ordersCountError || productsCountError || usersCountError) {
                console.error('Error fetching stats:', ordersError || ordersCountError || productsCountError || usersCountError);
            }

            setStats({
                totalSales: totalSales,
                totalOrders: ordersCount || 0,
                totalProducts: productsCount || 0,
                activeUsers: usersCount || 0
            });

        } catch (error) {
            console.error('Unexpected error fetching stats:', error);
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
                <p className="text-gray-500">Welcome back, Admin. Here's what's happening properly today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
                    title="Active Users"
                    value={stats.activeUsers}
                    icon={TrendingUp}
                    color="bg-purple-500"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Orders Placeholder */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Orders</h2>
                    <div className="text-center py-10 text-gray-400">
                        {/* Future: Map through recent orders */}
                        Order list will appear here...
                    </div>
                </div>

                {/* Low Stock Alert Placeholder */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Low Stock Alerts</h2>
                    <div className="text-center py-10 text-gray-400">
                        {/* Future: Filter products with low stock */}
                        Stock alerts will appear here...
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
