"use client";
import Footer from '@/components/common/Footer';
import Header from '@/components/common/Header';
import { Phone, MapPin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion';
import "react-datepicker/dist/react-datepicker.css";
import Button from "@/components/ui/button/Button";
import { useState, useCallback } from "react";
import { useCurrentUser } from "@/utils/currentUser";


import { Toaster } from 'react-hot-toast';

export default function FrontendLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const { user, loadingUser } = useCurrentUser();
  const logout = useCallback(() => {
    // Clear cookie
    document.cookie = "token=; path=/; max-age=0";
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.clear();
    // Clear sessionStorage as well
    sessionStorage.removeItem("token");
    sessionStorage.clear();
    // Reload page to reset state
    window.location.href = "/";
}, []);
  // Render normal frontend layout with Header/Footer for all routes
  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <div className="w-full max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-2xl shadow-2xl p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">
                Amanda Everything Pets
              </h1>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4 text-gray-600 text-sm">
                <div className="flex items-center gap-2">
                  <Phone size={16} />
                  <span>(773) 307-7938</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>1128 N Maple Ave, La Grange Park, IL 60526.</span>
                </div>
              </div>
            </div>
            {loadingUser ? (
                  <span className="text-sm text-gray-600">Loading...</span>
                ) : user ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[#475467]">Welcome {user.name}</span>
                    <Button
                      onClick={logout}
                      variant="secondary"
                      className="bg-transparent shadow-none !p-0 gradient-text logout-btn"
                      type="button"
                      loading={loading}
                    >
                      Logout
                    </Button>
                  </div>
                ) : null}
          </div>

        </motion.div>
        <main>{children}
          <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: "12px",
                background: "#111",
                color: "#fff",
              },
            }}
          />
        </main>
      </div>
    </div>
  );
}
