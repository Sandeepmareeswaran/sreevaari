import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
    const { user, isAdmin, loading } = useAuth();
    
    // In a real app, loading state in AuthContext should be thoroughly checked
    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coconut-green"></div>
            </div>
        );
    }
    
    if (!user || !isAdmin) {
        return <Navigate to="/" replace />;
    }
    
    return children;
}
