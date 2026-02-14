import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { User, Mail, Calendar } from 'lucide-react';

export default function AdminCustomers() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) console.error('Error fetching customers:', error);
        else setCustomers(data || []);
        setLoading(false);
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
                <p className="text-gray-500">View registered users</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customers.map((customer) => (
                    <div key={customer.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-coconut-green font-bold text-xl flex-shrink-0">
                            {customer.full_name ? customer.full_name.charAt(0).toUpperCase() : <User size={24} />}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">{customer.full_name || 'Unnamed User'}</h3>
                            <div className="flex items-center text-gray-500 text-xs mt-1 gap-1">
                                <Mail size={12} /> {customer.id.slice(0, 8)}... (ID)
                            </div>
                            <div className="flex items-center text-gray-400 text-xs mt-1 gap-1">
                                <Calendar size={12} /> Joined: {new Date(customer.created_at).toLocaleDateString()}
                            </div>
                            <span className={`inline-block mt-3 text-[10px] font-bold px-2 py-0.5 rounded border ${customer.role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-100' : 'bg-gray-50 text-gray-600 border-gray-100'
                                } uppercase tracking-wider`}>
                                {customer.role || 'Customer'}
                            </span>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="col-span-full py-20 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coconut-green mx-auto"></div>
                    </div>
                )}
            </div>
        </div>
    );
}
