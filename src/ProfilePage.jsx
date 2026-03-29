import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './config/firebase';
import toast, { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!currentUser) return;

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserProfile(userSnap.data());
        } else {
          // Profile doesn't exist yet — create it
          const { setDoc } = await import('firebase/firestore');
          const newProfile = {
            email: currentUser.email,
            displayName: currentUser.displayName || currentUser.email.split('@')[0],
            createdAt: new Date().toISOString(),
            stats: {
              totalDecks: 0,
              totalCards: 0,
              totalStudySessions: 0,
              currentStreak: 0
            }
          };
          await setDoc(userRef, newProfile);
          setUserProfile(newProfile);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <div className="text-xl text-gray-700 font-semibold">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Toaster position="top-center" />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center space-x-6">
            <div className="bg-white rounded-full p-4">
              <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{userProfile?.displayName || 'Student'}</h1>
              <p className="text-blue-100 text-lg">{currentUser?.email}</p>
              <p className="text-blue-200 text-sm mt-2">
                Member since {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Stats Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Learning Statistics
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl text-center">
                <div className="text-4xl font-bold text-blue-600 mb-1">{userProfile?.stats?.totalDecks || 0}</div>
                <div className="text-sm text-blue-700 font-medium">Total Decks</div>
              </div>
              <div className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl text-center">
                <div className="text-4xl font-bold text-pink-600 mb-1">{userProfile?.stats?.totalCards || 0}</div>
                <div className="text-sm text-pink-700 font-medium">Total Cards</div>
              </div>
              <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl text-center">
                <div className="text-4xl font-bold text-purple-600 mb-1">{userProfile?.stats?.totalStudySessions || 0}</div>
                <div className="text-sm text-purple-700 font-medium">Study Sessions</div>
              </div>
              <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl text-center">
                <div className="text-4xl font-bold text-green-600 mb-1">{userProfile?.stats?.currentStreak || 0}</div>
                <div className="text-sm text-green-700 font-medium">Day Streak 🔥</div>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link 
                to="/decks" 
                className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                View My Decks
              </Link>
              <Link 
                to="/" 
                className="block w-full text-center bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 rounded-xl transition-all duration-200 border-2 border-gray-200 hover:border-gray-300"
              >
                Back to Home
              </Link>
            </div>

            {/* Account Info */}
            <div className="mt-8 pt-8 border-t-2 border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Account Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium text-sm">Display Name</span>
                  <span className="text-gray-800 font-semibold">{userProfile?.displayName || 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 font-medium text-sm">Email</span>
                  <span className="text-gray-800 font-semibold text-sm">{currentUser?.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
