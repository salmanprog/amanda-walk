"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion'
import LoginForm from "@/components/LoginForm/Index";
export default function HomePage() {
  // Set page title
  useEffect(() => {
    document.title = "Amanda Site | Coming Soon";
  }, []);

  return (
    <>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-effect rounded-2xl shadow-2xl p-6 mb-6">
            <LoginForm />
          </motion.div>
      
    </>
  );
}
