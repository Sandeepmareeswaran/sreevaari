import { useState } from 'react';
import { Save, User, Bell, Shield, Store, Mail } from 'lucide-react';

export default function AdminSettings() {
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'General', icon: Store },
        { id: 'account', label: 'Account', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                <p className="text-gray-500">Manage your store and account preferences</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-4 text-sm font-medium transition-colors ${activeTab === tab.id
                                        ? 'bg-green-50 text-coconut-green border-l-4 border-coconut-green'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                        {activeTab === 'general' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800 mb-1">Store Information</h2>
                                    <p className="text-gray-500 text-sm">Update your store details and branding.</p>
                                </div>

                                <div className="grid gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                                        <input type="text" defaultValue="Sree Vaari Traders" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-coconut-green/50 focus:border-coconut-green outline-none" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Store Description</label>
                                        <textarea rows="3" defaultValue="Bringing the pure essence of nature to your home." className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-coconut-green/50 focus:border-coconut-green outline-none"></textarea>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                                            <input type="email" defaultValue="contact@sreevaari.com" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-coconut-green/50 focus:border-coconut-green outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                            <input type="tel" defaultValue="+91 98765 43210" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-coconut-green/50 focus:border-coconut-green outline-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex justify-end">
                                    <button className="bg-coconut-green text-white px-6 py-2 rounded-lg font-medium hover:bg-coconut-dark transition-colors flex items-center gap-2">
                                        <Save size={18} /> Save Changes
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'account' && (
                            <div className="space-y-6">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-800 mb-1">Profile settings</h2>
                                    <p className="text-gray-500 text-sm">Manage your admin profile.</p>
                                </div>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-coconut-green text-2xl font-bold">
                                        A
                                    </div>
                                    <button className="text-sm font-medium text-coconut-green hover:text-coconut-dark border border-green-200 rounded-lg px-4 py-2 bg-green-50">
                                        Change Picture
                                    </button>
                                </div>

                                <div className="grid gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                        <div className="relative">
                                            <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input type="text" defaultValue="Admin User" className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-coconut-green/50 focus:border-coconut-green outline-none" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                        <div className="relative">
                                            <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input type="email" defaultValue="admin@sreevaari.com" disabled className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex justify-end">
                                    <button className="bg-coconut-green text-white px-6 py-2 rounded-lg font-medium hover:bg-coconut-dark transition-colors flex items-center gap-2">
                                        <Save size={18} /> Save Changes
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="text-center py-20 text-gray-400">
                                <Bell size={48} className="mx-auto mb-4 opacity-20" />
                                <p>Notification settings coming soon</p>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="text-center py-20 text-gray-400">
                                <Shield size={48} className="mx-auto mb-4 opacity-20" />
                                <p>Security settings coming soon</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
