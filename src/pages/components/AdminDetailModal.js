// src/components/AdminDetailModal.js

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
// Import ikon yang diperlukan (FaKey dihapus dari import)
import { FaUserCircle, FaLock, FaTimes } from "react-icons/fa";

export default function AdminDetailModal({ isOpen, onClose, data }) {
    if (!data) return null;

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
    };

    const details = [
        { label: 'Username', value: data.username, icon: FaUserCircle, color: 'text-blue-600' },
        { label: 'Password', value: data.password, icon: FaLock, color: 'text-red-500' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                // Overlay
                <motion.div 
                    className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose} // Menutup modal saat klik di luar
                >
                    <motion.div
                        className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl relative"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        
                        {/* Tombol Tutup (X) */}
                        <button
                            onClick={onClose}
                            className="absolute top-5 right-5 p-2 text-gray-500 hover:text-red-600 transition duration-150 rounded-full bg-gray-100 hover:bg-red-50"
                            title="Tutup Modal"
                        >
                            <FaTimes className="text-xl" />
                        </button>

                        {/* Header */}
                        <div className="flex items-center text-blue-700 mb-6 border-b border-blue-100 pb-3">
                            <FaUserCircle className="text-3xl mr-3"/>
                            <h2 className="text-2xl font-extrabold">Detail Data Admin</h2>
                        </div>
                        
                        {/* Detail Data Container */}
                        <div className="space-y-4 text-gray-700 p-4 border rounded-xl bg-blue-50/50">
                            
                            {details.map((item, index) => (
                                <div key={index} className="flex flex-col">
                                    {/* Label (di atas) */}
                                    <span className="text-xs font-semibold uppercase text-gray-500">{item.label}</span>
                                    {/* Value */}
                                    <span className="text-lg font-bold text-gray-800 break-words flex items-center gap-2 pt-1">
                                        <item.icon className={`text-md ${item.color}`} /> {item.value || '-'}
                                    </span>
                                </div>
                            ))}
                            
                        </div>

                        {/* ID Database Dihapus dari sini */}
                        

                        {/* Tombol Tutup Utama */}
                        <motion.button
                            onClick={onClose}
                            className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-2xl transition-colors shadow-lg transform hover:scale-[1.01]"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Tutup
                        </motion.button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}