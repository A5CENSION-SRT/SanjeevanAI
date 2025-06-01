'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [doctorName, setDoctorName] = useState('');
  const [loading, setLoading] = useState(false);

  // Check login status whenever component mounts or path changes
  useEffect(() => {
    checkLoginStatus();
    
    // Create a function to listen for storage events (for logout across tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_state_changed') {
        checkLoginStatus();
      }
    };
    
    // Add event listener for storage events
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Function to check if user is logged in
  const checkLoginStatus = async () => {
    try {
      const response = await fetch('/api/auth/check', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsLoggedIn(true);
        setDoctorName(data.doctor?.name || 'Doctor');
        console.log('Auth check successful:', data.doctor?.name);
      } else {
        setIsLoggedIn(false);
        setDoctorName('');
        console.log('Auth check failed, not logged in');
      }
    } catch (error) {
      setIsLoggedIn(false);
      setDoctorName('');
      console.error('Error checking login status:', error);
    }
  };

  const handleLogout = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        // Broadcast logout event to other tabs
        localStorage.setItem('auth_state_changed', Date.now().toString());
        
        // Update local state and redirect
        setIsLoggedIn(false);
        setDoctorName('');
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-indigo-600 text-xl font-bold">Sanjeevini</span>
              <span className="text-gray-600 text-xl">AI</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <span className="text-gray-600">Welcome, {doctorName}</span>
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  disabled={loading}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-70"
                >
                  {loading ? 'Signing out...' : 'Sign Out'}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 