import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    FaUsers, // Digunakan untuk header utama
    FaIdCardAlt, 
    FaLock, 
    FaHome, 
    FaTimes, 
    FaMale, 
    FaFemale,
    FaInfoCircle, // Ikon baru untuk grouping
} from "react-icons/fa"; 
// Ikon FaKey sudah dihapus dari import

export default function UserDetailModal({ isOpen, onClose, data }) {
    if (!data) return null;

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
    };

    // 1. Definisikan Data Detail dalam Array (untuk loop)
    const details = [
        { label: 'NIK Ibu', value: data.nikIbu || '-', icon: FaIdCardAlt, color: 'text-blue-600' },
        { label: 'Nama Ibu', value: data.namaIbu || '-', icon: FaFemale, color: 'text-blue-600' },
        { label: 'Nama Ayah', value: data.namaAyah || '-', icon: FaMale, color: 'text-blue-600' },
        // Perhatikan: Menambahkan fallback value '-' jika data kosong
        { label: 'Password', value: data.password || 'TIDAK DITAMPILKAN', icon: FaLock, color: 'text-red-500' },
    ];

    // Pisahkan Alamat menjadi item tunggal yang membutuhkan lebar penuh
    const addressDetail = { label: 'Alamat', value: data.alamat, icon: FaHome, color: 'text-green-600' };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose} 
                >
                    <motion.div
                        className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto"
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
                            title="Tutup"
                        >
                            <FaTimes className="text-xl" />
                        </button>

                        {/* Header Modal */}
                        <h2 className="text-2xl font-extrabold text-blue-700 mb-6 border-b pb-2 flex items-center gap-2">
                            <FaUsers className="text-3xl"/> Detail Data User
                        </h2>

                        {/* === Bagian Informasi Utama === */}
                        <h3 className="text-lg font-bold text-gray-700 mb-3 mt-4 flex items-center gap-2 border-b border-gray-200 pb-1">
                            <FaInfoCircle className="text-blue-500"/> Informasi Akun & Keluarga
                        </h3>
                        {/* Kontainer Detail dengan Grid 2 kolom */}
                        <div className="grid grid-cols-2 gap-4 border p-4 rounded-xl bg-blue-50/50 max-h-72 overflow-y-auto">
                            
                            {/* Loop untuk detail NIK, Nama, Password */}
                            {details.map((item, index) => (
                                <div key={index} className="flex flex-col">
                                    <span className="text-xs font-semibold uppercase text-gray-500">{item.label}</span>
                                    <span className="text-md font-bold text-gray-800 break-words flex items-center gap-2">
                                        <item.icon className={`text-sm ${item.color}`} /> {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* === Bagian Alamat (Lebar Penuh) === */}
                        <h3 className="text-lg font-bold text-gray-700 mb-3 mt-6 flex items-center gap-2 border-b border-gray-200 pb-1">
                            <FaHome className="text-green-600"/> Detail Alamat
                        </h3>
                        <div className="border p-4 rounded-xl bg-green-50/50">
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold uppercase text-gray-500">{addressDetail.label}</span>
                                <p className="text-md font-bold text-gray-800 break-words flex items-start gap-2 pt-1">
                                    <addressDetail.icon className={`text-sm ${addressDetail.color} mt-1`} /> 
                                    <span>{addressDetail.value || 'Alamat tidak tersedia.'}</span>
                                </p>
                            </div>
                        </div>

                        {/* === ID Database Dihapus dari sini === */}
                        {/* <div className="flex items-center justify-end pt-4 text-gray-500">
                            <FaKey className="mr-2 text-sm" /> 
                            <span className="text-xs font-medium">ID Database:</span>
                            <span className="text-xs text-gray-400 truncate max-w-[150px] ml-2">{data.id || '-'}</span>
                        </div>
                        */}


                        {/* Tombol Tutup Utama */}
                        <motion.button
                            onClick={onClose}
                            className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-2xl transition-colors shadow-lg transform hover:scale-[1.01]"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Tutup Detail
                        </motion.button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}