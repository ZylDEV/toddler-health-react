// src/pages/components/JadwalDetailModal.js
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    FaTimes, 
    FaCalendarAlt, 
    FaMapMarkerAlt, 
    FaClock, 
    FaClipboardList, // Menggunakan ikon yang lebih relevan untuk deskripsi
    FaEye, // Menggunakan FaEye untuk konsistensi dengan tombol lihat
} from "react-icons/fa";

export default function JadwalDetailModal({ isOpen, onClose, data }) {
    // Jika modal tidak terbuka atau data kosong, jangan render apapun
    if (!isOpen || !data) return null;

    // Destrukturisasi data jadwal
    const {
        tanggalPelaksanaan,
        waktuPelaksanaan,
        lokasi,
        deskripsiKegiatan,
    } = data;

    // Data ditampilkan sebagai daftar terstruktur dengan desain timeline
    const detailItems = [
        { 
            icon: FaCalendarAlt, 
            label: "Tanggal Pelaksanaan", 
            value: tanggalPelaksanaan || "Tidak Ada",
            color: "text-indigo-600",
            borderColor: "border-indigo-400"
        },
        { 
            icon: FaClock, 
            label: "Waktu Pelaksanaan", 
            value: waktuPelaksanaan || "Tidak Ada",
            color: "text-blue-600",
            borderColor: "border-blue-400"
        },
        { 
            icon: FaMapMarkerAlt, 
            label: "Lokasi Posyandu", 
            value: lokasi || "Tidak Ada",
            color: "text-green-600",
            borderColor: "border-green-400"
        },
        { 
            icon: FaClipboardList, 
            label: "Deskripsi Kegiatan", 
            value: deskripsiKegiatan || "Tidak Ada",
            color: "text-purple-600",
            borderColor: "border-purple-400"
        },
    ];

    return (
        <AnimatePresence>
            {/* Backdrop */}
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                {/* Modal Container */}
                <motion.div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 md:p-8 relative overflow-y-auto max-h-[95vh] transform transition-all duration-300"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                    onClick={(e) => e.stopPropagation()} // Mencegah klik di dalam modal menutup modal
                >
                    
                    {/* Header */}
                    <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-100">
                        <h2 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
                            <FaEye className="text-3xl text-blue-600" /> Detail Jadwal
                        </h2>
                        <button 
                            onClick={onClose} 
                            className="p-3 text-gray-400 hover:text-red-600 transition rounded-full bg-gray-100 hover:bg-red-100/70"
                            title="Tutup"
                        >
                            <FaTimes className="text-xl" />
                        </button>
                    </div>

                    {/* Detail Items as Enhanced Stack / Card */}
                    <div className="space-y-6">
                        {detailItems.map((item, index) => (
                            <motion.div
                                key={index}
                                className={`p-5 rounded-xl border-l-4 ${item.borderColor} bg-gray-50 transition-shadow duration-300 hover:shadow-lg`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.08 }}
                            >
                                <div className="flex items-center gap-4">
                                    {/* Icon */}
                                    <div className={`p-3 rounded-full ${item.color} bg-white shadow-md`}>
                                        <item.icon className="text-2xl flex-shrink-0" />
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">
                                            {item.label}
                                        </span>
                                        <p className="text-lg font-semibold text-gray-800 whitespace-pre-wrap break-words mt-1">
                                            {item.value}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    {/* End Detail Stack */}

                    {/* Footer */}
                    <div className="flex justify-end mt-10 pt-4 border-t border-gray-100">
                        <button 
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/50 transform hover:scale-[1.02]"
                        >
                            Tutup Detail
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}