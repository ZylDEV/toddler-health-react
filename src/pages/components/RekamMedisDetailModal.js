// src/pages/components/RekamMedisDetailModal.js

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaTimes, 
    FaBaby, 
    FaWeightHanging, 
    FaRulerVertical, 
    FaCalendarAlt, 
    FaFileMedical,
    FaMars, 
    FaVenus, 
    FaHeadSideVirus, 
    FaHandPointRight, 
    FaCapsules, 
    FaClock
} from 'react-icons/fa';
// FaIdCard telah dihapus dari import

/**
 * Komponen Modal untuk menampilkan detail lengkap dari satu data Rekam Medis.
 * Menggunakan layout 3 kolom (grid-cols-3) dan ID Rekam Medis sudah dihapus.
 */
export default function RekamMedisDetailModal({ isOpen, onClose, data }) {
    if (!data) return null;

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
    };

    // PENGELOMPOKAN DATA UNTUK KETERBACAAN
    const sections = [
        {
            title: 'Data Identitas Balita',
            items: [
                { label: 'Nama Balita', value: data.namaBalita, icon: FaBaby, color: 'text-blue-700', isHighlighted: true },
                { 
                    label: 'Jenis Kelamin', 
                    value: data.jenisKelamin, 
                    icon: data.jenisKelamin === 'Laki-laki' ? FaMars : FaVenus, 
                    color: data.jenisKelamin === 'Laki-laki' ? 'text-blue-500' : 'text-pink-500',
                    isHighlighted: true
                },
                { label: 'Usia', value: data.usia, icon: FaClock, color: 'text-gray-600' },
            ]
        },
        {
            title: 'Data Pemeriksaan',
            items: [
                { label: 'Tanggal Periksa', value: data.tanggalPemeriksaan || '-', icon: FaCalendarAlt, color: 'text-gray-600' },
                { label: 'Berat Badan (BB)', value: `${data.bb || '-'} kg`, icon: FaWeightHanging, color: 'text-green-600', isHighlighted: true },
                { label: 'Tinggi/P. Badan', value: `${data.tj || '-'} cm`, icon: FaRulerVertical, color: 'text-red-600', isHighlighted: true },
                { label: 'Lingkar Kepala (LK)', value: `${data.lk || '-'} cm`, icon: FaHeadSideVirus, color: 'text-purple-600' },
                { label: 'Lingkar Lengan (LL)', value: `${data.ll || '-'} cm`, icon: FaHandPointRight, color: 'text-yellow-600' },
                { label: 'Pemberian Vit. A', value: data.vitaminA || '-', icon: FaCapsules, color: 'text-pink-600' },
            ]
        }
    ];

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
                        
                        {/* Header */}
                        <h2 className="text-2xl font-extrabold text-blue-700 mb-6 border-b pb-2 flex items-center gap-2">
                            <FaFileMedical className="text-3xl"/> Detail Rekam Medis
                        </h2>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-5 right-5 p-2 text-gray-500 hover:text-red-600 transition duration-150 rounded-full bg-gray-100 hover:bg-red-50"
                            title="Tutup"
                        >
                            <FaTimes className="text-xl" />
                        </button>

                        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                            {sections.map((section, sectionIndex) => (
                                <div key={sectionIndex} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-lg">
                                    
                                    {/* Sub-Header Pengelompokan */}
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-blue-100">
                                        {section.title}
                                    </h3>
                                    
                                    {/* Detail Grid: Menggunakan 3 kolom */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {section.items.map((item, index) => (
                                            <motion.div 
                                                key={index} 
                                                className={`flex items-start p-3 rounded-xl border ${
                                                    item.isHighlighted
                                                        ? 'bg-blue-100/50 border-blue-200 shadow-md' 
                                                        : 'bg-gray-50 border-gray-100'
                                                } h-full`}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: sectionIndex * 0.1 + index * 0.05 }}
                                            >
                                                <div className={`flex-shrink-0 mr-3 mt-1 ${item.color}`}>
                                                    <item.icon className="text-xl" />
                                                </div>
                                                <div className="flex flex-col flex-grow">
                                                    <span className="text-xs font-semibold uppercase text-gray-500">{item.label}</span>
                                                    <span className="text-sm font-bold text-gray-800 break-words">{item.value}</span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* ID Rekam Medis DIHAPUS DARI SINI */}

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