import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<div className="text-center py-20">Product Listing Coming Soon</div>} />
          <Route path="/cart" element={<div className="text-center py-20">Cart Page Coming Soon</div>} />
          <Route path="/login" element={<div className="text-center py-20">Login Page Coming Soon</div>} />
          <Route path="/about" element={<div className="text-center py-20">About Page Coming Soon</div>} />
          <Route path="/contact" element={<div className="text-center py-20">Contact Page Coming Soon</div>} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
