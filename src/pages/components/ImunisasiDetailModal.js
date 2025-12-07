// src/pages/components/ImunisasiDetailModal.js
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    FaTimes, 
    FaSyringe, 
    FaUserAlt, 
    FaCalendarDay,
    FaCheck, 
    FaCircle, 
    FaPencilAlt 
} from "react-icons/fa"; 

// Daftar lengkap imunisasi (Tidak Berubah)
const imunisasiFields = [
    { name: "hepatitisB", label: "Hepatitis B", minAge: "0 Hari" },
    { name: "bcg", label: "BCG", minAge: "0-1 Bulan" },
    { name: "polio1", label: "Polio Tetes 1 (OPV-1)", minAge: "2 Bulan" },
    { name: "dptHbHib1", label: "DPT HB Hib 1 (Pentabio-1)", minAge: "2 Bulan" },
    { name: "polio2", label: "Polio Tetes 2 (OPV-2)", minAge: "3 Bulan" },
    { name: "dptHbHib2", label: "DPT HB Hib 2 (Pentabio-2)", minAge: "3 Bulan" },
    { name: "polio3", label: "Polio Tetes 3 (OPV-3)", minAge: "4 Bulan" },
    { name: "dptHbHib3", label: "DPT HB Hib 3 (Pentabio-3)", minAge: "4 Bulan" },
    { name: "polio4", label: "Polio Tetes 4 (OPV-4)", minAge: "4 Bulan (Tambahan)" },
    { name: "ipv", label: "Polio Suntik (IPV)", minAge: "4 Bulan" },
    { name: "mr", label: "Campak Rubela (MR)", minAge: "9 Bulan" },
    { name: "dptHbHibLanjutan", label: "DPT HB Hib Lanjutan", minAge: "18 Bulan" },
    { name: "mrLanjutan", label: "Campak Rubela Lanjutan (MR)", minAge: "24 Bulan" },
];

export default function ImunisasiDetailModal({ isOpen, onClose, data }) {
    if (!data) return null;

    // Menarik data balita dan data imunisasi dari prop 'data'
    const { 
        namaBalita, 
        tanggalLahir, 
        // namaIbu sudah dihapus dari destructuring,
        ...imunisasiData 
    } = data;

    const isImunisasiCompleted = (fieldData) => {
        return fieldData && fieldData.tanggal;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        // Sesuaikan max-w agar terlihat proporsional (max-w-xl lebih cocok untuk 2 kolom data)
                        className="bg-white rounded-xl shadow-2xl w-full max-w-xl p-6 md:p-8 relative overflow-y-auto max-h-[95vh]"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6 border-b pb-4">
                            <h2 className="text-3xl font-bold text-gray-700 flex items-center gap-3">
                                <FaSyringe className="text-3xl text-indigo-500" /> Riwayat Vaksinasi
                            </h2>
                            <button 
                                onClick={onClose} 
                                className="p-2 text-gray-400 hover:text-red-500 transition rounded-full hover:bg-red-50"
                                title="Tutup"
                            >
                                <FaTimes className="text-xl" />
                            </button>
                        </div>

                        {/* Data Dasar Balita - Data diubah menjadi grid 2 kolom */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 p-5 bg-indigo-50 rounded-lg border border-indigo-200">
                            <DetailItem icon={FaUserAlt} label="Balita" value={namaBalita} color="text-indigo-600" />
                            <DetailItem icon={FaCalendarDay} label="Tgl Lahir" value={tanggalLahir} color="text-indigo-600" />
                            {/* Detail Nama Ibu telah dihapus */}
                        </div>

                        {/* Timeline Imunisasi */}
                        <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <FaPencilAlt className="text-lg text-gray-400" /> Daftar Jadwal
                        </h3>

                        {/* Area Scrollable dengan Timeline Style */}
                        <div className="relative border-l-4 border-gray-200 pl-6 space-y-4">
                            {imunisasiFields.map((field, index) => {
                                const fieldData = imunisasiData[field.name];
                                const isCompleted = isImunisasiCompleted(fieldData);
                                
                                const pointClass = isCompleted 
                                    ? 'bg-green-500 border-green-700' 
                                    : 'bg-white border-gray-400';
                                const cardClass = isCompleted 
                                    ? 'bg-white shadow-md border-t-4 border-green-500' 
                                    : 'bg-gray-50 shadow-sm border-t-4 border-gray-300';
                                const titleColor = isCompleted ? 'text-gray-900' : 'text-gray-700';

                                return (
                                    <motion.div 
                                        key={field.name} 
                                        className="relative"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.08 }}
                                    >
                                        {/* Titik Timeline */}
                                        <div className={`absolute -left-3.5 -mt-1 w-7 h-7 rounded-full border-4 flex items-center justify-center ${pointClass}`}>
                                            {isCompleted && <FaCheck className="text-white text-xs" />}
                                            {!isCompleted && <FaCircle className="text-gray-400 text-xs" />}
                                        </div>

                                        {/* Card Detail Imunisasi */}
                                        <div className={`p-4 rounded-lg transition-all duration-300 ml-4 ${cardClass}`}>
                                            
                                            {/* Baris 1: Nama Vaksin & Jadwal Ideal */}
                                            <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
                                                <p className={`font-extrabold ${titleColor}`}>{field.label}</p>
                                                <span className="text-xs font-medium text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full">
                                                    Ideal: {field.minAge}
                                                </span>
                                            </div>

                                            {/* Baris 2: Detail Hasil */}
                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                <div className="flex flex-col">
                                                    <span className="text-xs uppercase text-gray-500">Tanggal Vaksin</span>
                                                    <span className={`font-semibold ${isCompleted ? 'text-green-700' : 'text-red-500'}`}>
                                                        {fieldData?.tanggal || 'BELUM DILAKUKAN'}
                                                    </span>
                                                </div>
                                                
                                                <div className="flex flex-col text-right">
                                                    <span className="text-xs uppercase text-gray-500">Usia Balita</span>
                                                    <span className={`font-semibold ${isCompleted ? 'text-green-700' : 'text-gray-500'}`}>
                                                        {fieldData?.usia || '-'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                        {/* End Timeline */}


                        {/* Footer */}
                        <div className="flex justify-end mt-8 pt-4 border-t">
                            <button 
                                onClick={onClose}
                                className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shadow-lg"
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

// Komponen Pembantu untuk Item Detail Balita
const DetailItem = ({ icon: Icon, label, value, color }) => (
    <div className="flex flex-col">
        <span className={`text-xs font-semibold uppercase flex items-center gap-1 ${color}`}>
            <Icon /> {label}
        </span>
        <span className="text-base font-bold text-gray-800">{value || '-'}</span>
    </div>
);