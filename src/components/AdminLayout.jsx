import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut } from 'lucide-react';

const AdminLayout = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? 'bg-coconut-green text-white' : 'text-gray-600 hover:bg-green-50 hover:text-coconut-green';
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-md flex flex-col z-10">
                <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-8 h-8 bg-coconut-green rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
                        S
                    </div>
                    <span className="font-bold text-xl text-gray-800 tracking-tight">Admin Panel</span>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Menu</p>

                    <Link to="/admin" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${isActive('/admin')}`}>
                        <LayoutDashboard size={20} />
                        Dashboard
                    </Link>

                    <Link to="/admin/products" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${isActive('/admin/products')}`}>
                        <Package size={20} />
                        Products
                    </Link>

                    <Link to="/admin/orders" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${isActive('/admin/orders')}`}>
                        <ShoppingCart size={20} />
                        Orders
                    </Link>

                    <Link to="/admin/customers" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${isActive('/admin/customers')}`}>
                        <Users size={20} />
                        Customers
                    </Link>

                    <div className="pt-6 mt-6 border-t border-gray-100">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 px-2">Settings</p>
                        <Link to="/admin/settings" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium ${isActive('/admin/settings')}`}>
                            <Settings size={20} />
                            Settings
                        </Link>
                    </div>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium">
                        <LogOut size={20} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
