// src/pages/components/BalitaDetailModal.js

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaTimes, 
    FaBaby, 
    FaIdCard, 
    FaMapMarkerAlt, 
    FaCalendarAlt, 
    FaVenusMars, 
    FaUserAlt, 
    FaInfoCircle 
} from 'react-icons/fa';
/**
 * Komponen Modal untuk menampilkan detail lengkap dari satu data Balita.
 * Desain menggunakan layout grid modern, dan hanya menampilkan data yang disetujui.
 */
export default function BalitaDetailModal({ isOpen, onClose, data }) {
    if (!data) return null;

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
    };

    // Data BALITA yang akan ditampilkan (Tinggi Lahir dan Berat Lahir sudah tidak ada di sini)
    const balitaDetails = [
        { label: 'Nama Balita', value: data.nama, icon: FaBaby, color: 'text-blue-700', isHighlighted: true },
        { label: 'Jenis Kelamin', value: data.jenisKelamin, icon: FaVenusMars, color: 'text-purple-600' },
        { label: 'Tempat Lahir', value: data.tempatLahir, icon: FaMapMarkerAlt, color: 'text-gray-600' },
        { label: 'Tanggal Lahir', value: data.tanggalLahir, icon: FaCalendarAlt, color: 'text-gray-600' },
    ];
    
    // Data ORANG TUA
    const parentDetails = [
        { label: 'NIK Ibu', value: data.nikIbu, icon: FaIdCard, color: 'text-red-600' },
        { label: 'Nama Ibu', value: data.namaIbu, icon: FaUserAlt, color: 'text-red-600' },
        { label: 'Nama Ayah', value: data.namaAyah, icon: FaUserAlt, color: 'text-red-600' },
        { label: 'Alamat', value: data.alamat, icon: FaMapMarkerAlt, color: 'text-gray-700', fullWidth: true },
    ];

    /**
     * Fungsi pembantu untuk merender bagian data dengan tampilan card 3-kolom yang rapi.
     */
    // ✅ PERBAIKAN: Menghapus penanda tipe ': any' dari parameter icon.
    const renderDetailSection = (items, title, icon, bgColor) => ( 
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-lg">
            
            {/* Sub-Header Pengelompokan */}
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200 flex items-center gap-2">
                {React.createElement(icon, { className: `${bgColor} text-xl` })} {title}
            </h3>
            
            {/* Detail Grid: Menggunakan 3 kolom di layar besar untuk kerapian */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item, index) => (
                    <motion.div 
                        key={index} 
                        // Desain card item yang rapi: border, shadow, dan background
                        className={`
                            flex items-start p-3 rounded-xl border border-gray-100 shadow-sm h-full 
                            ${item.isHighlighted ? 'bg-blue-100/50 border-blue-200 shadow-md' : 'bg-gray-50/70'}
                            ${item.fullWidth ? 'lg:col-span-3 sm:col-span-2 col-span-1' : ''}
                        `}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <div className={`flex-shrink-0 mr-3 mt-1 ${item.color}`}>
                            {React.createElement(item.icon, { className: "text-xl" })}
                        </div>
                        <div className="flex flex-col flex-grow">
                            {/* Label di atas nilai untuk keterbacaan yang jelas */}
                            <span className="text-xs font-semibold uppercase text-gray-500">{item.label}</span>
                            <span className="text-sm font-bold text-gray-800 break-words">{item.value || '-'}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose} 
                >
                    <motion.div
                        className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl relative"
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()} 
                    >
                        
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-5 right-5 p-2 text-gray-500 hover:text-red-600 transition duration-150 rounded-full bg-gray-100 hover:bg-red-50"
                            title="Tutup"
                        >
                            <FaTimes className="text-xl" />
                        </button>

                        {/* Header Utama yang lebih besar */}
                        <h2 className="text-3xl font-extrabold text-blue-800 mb-8 border-b pb-3 flex items-center gap-2">
                            <FaBaby className="text-4xl text-blue-500"/> Detail Data Balita
                        </h2>

                        {/* Konten Utama (Dibuat scrollable) */}
                        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                            
                            {/* === Bagian Data Balita (Hanya 4 item) === */}
                            {renderDetailSection(
                                balitaDetails,
                                'Informasi Identitas',
                                FaInfoCircle,
                                'text-blue-500'
                            )}

                            {/* === Bagian Data Orang Tua (4 item) === */}
                            {renderDetailSection(
                                parentDetails,
                                'Informasi Orang Tua',
                                FaUserAlt,
                                'text-red-500'
                            )}

                        </div>

                        {/* Footer */}
                        <div className="mt-8 pt-4 border-t text-right">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition shadow-lg transform hover:scale-[1.02]"
                            >
                                Tutup
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}