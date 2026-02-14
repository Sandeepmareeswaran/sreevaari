import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/products" element={<Layout><div className="text-center py-20">Product Listing Coming Soon</div></Layout>} />
        <Route path="/cart" element={<Layout><div className="text-center py-20">Cart Page Coming Soon</div></Layout>} />
        <Route path="/login" element={<Layout><div className="text-center py-20">Login Page Coming Soon</div></Layout>} />
        <Route path="/about" element={<Layout><div className="text-center py-20">About Page Coming Soon</div></Layout>} />
        <Route path="/contact" element={<Layout><div className="text-center py-20">Contact Page Coming Soon</div></Layout>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
