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
      <div className="min-h-screen bg-[#f7f7f7]">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#58CC02] mx-auto mb-4"></div>
            <div className="text-xl text-gray-700 font-bold">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f7f7]">
      <Navbar />
      <Toaster position="top-center" />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-[#58CC02] rounded-2xl border-2 border-b-4 border-[#46a302] p-8 mb-8 text-white">
          <div className="flex items-center space-x-6">
            <div className="bg-white rounded-full p-4">
              <svg className="w-16 h-16 text-[#58CC02]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-black mb-2">{userProfile?.displayName || 'Student'}</h1>
              <p className="text-[#d7ffb8] text-lg font-bold">{currentUser?.email}</p>
              <p className="text-[#d7ffb8] text-sm mt-2 font-bold">
                Member since {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Stats Card */}
          <div className="bg-white rounded-2xl border-2 border-b-4 border-[#e5e5e5] p-8">
            <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#1cb0f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Learning Statistics
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-[#ddf4ff] border-2 border-[#1cb0f6] rounded-2xl text-center">
                <div className="text-4xl font-black text-[#1cb0f6] mb-1">{userProfile?.stats?.totalDecks || 0}</div>
                <div className="text-sm text-[#0d8ecf] font-extrabold">Total Decks</div>
              </div>
              <div className="p-6 bg-[#ffe0f0] border-2 border-[#ff4b4b] rounded-2xl text-center">
                <div className="text-4xl font-black text-[#ff4b4b] mb-1">{userProfile?.stats?.totalCards || 0}</div>
                <div className="text-sm text-[#ea2b2b] font-extrabold">Total Cards</div>
              </div>
              <div className="p-6 bg-[#f0e0ff] border-2 border-[#ce82ff] rounded-2xl text-center">
                <div className="text-4xl font-black text-[#ce82ff] mb-1">{userProfile?.stats?.totalStudySessions || 0}</div>
                <div className="text-sm text-[#a855f7] font-extrabold">Study Sessions</div>
              </div>
              <div className="p-6 bg-[#d7ffb8] border-2 border-[#58CC02] rounded-2xl text-center">
                <div className="text-4xl font-black text-[#58CC02] mb-1">{userProfile?.stats?.currentStreak || 0}</div>
                <div className="text-sm text-[#46a302] font-extrabold">Day Streak 🔥</div>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-2xl border-2 border-b-4 border-[#e5e5e5] p-8">
            <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#ff9600]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link 
                to="/decks" 
                className="block w-full text-center btn-duo btn-duo-green text-base py-4"
              >
                VIEW MY DECKS
              </Link>
              <Link 
                to="/" 
                className="block w-full text-center btn-duo btn-duo-ghost text-base py-4"
              >
                BACK TO HOME
              </Link>
            </div>

            {/* Account Info */}
            <div className="mt-8 pt-8 border-t-2 border-[#e5e5e5]">
              <h3 className="text-lg font-black text-gray-800 mb-4">Account Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-[#f7f7f7] rounded-2xl border-2 border-[#e5e5e5]">
                  <span className="text-gray-600 font-bold text-sm">Display Name</span>
                  <span className="text-gray-800 font-extrabold">{userProfile?.displayName || 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-[#f7f7f7] rounded-2xl border-2 border-[#e5e5e5]">
                  <span className="text-gray-600 font-bold text-sm">Email</span>
                  <span className="text-gray-800 font-extrabold text-sm">{currentUser?.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
