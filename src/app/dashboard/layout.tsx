'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const navItems = [
    {
        href: '/dashboard',
        label: 'Overview',
        icon: '📊'
    },
    {
        href: '/dashboard/attended-cases',
        label: 'Attended Cases',
        icon: '👥'
    },
    {
        href: '/dashboard/prescriptions',
        label: 'Pending Prescriptions',
        icon: '💊'
    },
    {
        href: '/dashboard/completed',
        label: 'Completed Cases',
        icon: '✅'
    },
    {
        href: '/dashboard/patients',
        label: 'Patients',
        icon: '🏥'
    },
    {
        href: '/dashboard/earnings',
        label: 'Earnings',
        icon: '💰'
    }
];

export default function DashboardLayout({
    children
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        if (loading) return;
        
        setLoading(true);
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
            
            // Redirect to home page after logout
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error('Error logging out:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[calc(100vh-4rem)]">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200">
                <div className="h-full px-3 py-4 flex flex-col">
                    <div className="mb-6 px-3">
                        <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
                        <p className="text-sm text-gray-500">Manage your medical practice</p>
                    </div>
                    <nav className="space-y-1 flex-1">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 group transition-colors"
                            >
                                <span className="text-xl mr-3">{item.icon}</span>
                                <span className="text-sm font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                    <div className="mt-auto border-t border-gray-200 pt-4">
                        <button
                            onClick={handleLogout}
                            disabled={loading}
                            className="w-full flex items-center px-3 py-2 text-red-600 rounded-lg hover:bg-red-50 group transition-colors"
                        >
                            <span className="text-xl mr-3">🚪</span>
                            <span className="text-sm font-medium">
                                {loading ? 'Signing out...' : 'Sign Out'}
                            </span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-gray-50">
                <div className="py-6 px-8">
                    {children}
                </div>
            </main>
        </div>
    );
} 