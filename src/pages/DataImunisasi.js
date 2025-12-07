// src/pages/DataImunisasi.js

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaSearch,
    FaEdit,
    FaTrashAlt,
    FaPlus,
    FaFilePdf,
    FaTachometerAlt,
    FaUser,
    FaUsers,
    FaBaby,
    FaFileMedical,
    FaSyringe,
    FaCalendarAlt,
    FaInfoCircle,
} from "react-icons/fa";
import { motion } from "framer-motion"; 
import toast from "react-hot-toast";
import Topbar from "./components/Topbar";
import ModalImunisasi from "./components/ModalImunisasi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { db } from "../config/firebase";
import { ref, onValue, remove } from "firebase/database";

import ImunisasiDetailModal from "./components/ImunisasiDetailModal"; 

export default function DataImunisasi() {
    const navigate = useNavigate();
    const tableRef = useRef();

    const [imunisasiData, setImunisasiData] = useState([]);
    const [search, setSearch] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [selectedData, setSelectedData] = useState(null);
    const [openDetailModal, setOpenDetailModal] = useState(false); 
    const [tableHeight, setTableHeight] = useState("500px");

    // Fungsi helper to format immunization object to string for PDF export
    const formatImunisasiCell = (value) => {
        if (value && typeof value === "object" && value.tanggal && value.usia) {
            return `${value.tanggal} (${value.usia})`;
        }
        return "-";
    };
    
    // Fungsi untuk menghitung status imunisasi ringkas
    const getImunisasiStatus = (data) => {
        const totalVaksin = 13; 
        let completed = 0;
        
        const imunisasiFields = [
            "hepatitisB", "bcg", "polio1", "dptHbHib1", "polio2", "dptHbHib2", 
            "polio3", "dptHbHib3", "polio4", "ipv", "mr", "dptHbHibLanjutan", "mrLanjutan"
        ];

        imunisasiFields.forEach(field => {
            if (data[field] && data[field].tanggal) {
                completed++;
            }
        });

        if (completed === totalVaksin) {
            return { count: completed, total: totalVaksin, color: "text-green-600", label: "Lengkap" };
        }
        if (completed > 0) {
            return { count: completed, total: totalVaksin, color: "text-yellow-600", label: "Sebagian" };
        }
        return { count: 0, total: totalVaksin, color: "text-red-500", label: "Belum Ada" };
    };


    useEffect(() => {
        const dataRef = ref(db, "imunisasi");
        const unsubscribe = onValue(
            dataRef,
            (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    const formatted = Object.keys(data).map((key) => ({
                        id: key,
                        ...data[key],
                    }));
                    setImunisasiData(formatted);
                } else {
                    setImunisasiData([]);
                }
            },
            (error) => {
                console.error("Firebase fetch error:", error);
                toast.error("Gagal memuat data. Periksa koneksi Anda.");
            }
        );
        return () => unsubscribe();
    }, []);

    // Hook untuk menghitung tinggi tabel dinamis (TETAP SAMA)
    useEffect(() => {
        const updateHeight = () => {
            const topbarHeight = 80;
            const quickAccessHeight = 80;
            const headerHeight = 80;
            const notesHeight = 120; 
            const padding = 48; 
            const availableHeight =
                window.innerHeight -
                (topbarHeight + quickAccessHeight + headerHeight + notesHeight + padding);
            setTableHeight(`${availableHeight}px`);
        };
        updateHeight();
        window.addEventListener("resize", updateHeight);
        return () => window.removeEventListener("resize", updateHeight);
    }, []);

    // Quick Access Items (TETAP SAMA)
    const quickAccessItems = [
        { name: "Dashboard", icon: <FaTachometerAlt />, path: "/dashboard" },
        { name: "Data Admin", icon: <FaUser />, path: "/data-admin" },
        { name: "Data User", icon: <FaUsers />, path: "/data-user" },
        { name: "Data Balita", icon: <FaBaby />, path: "/data-balita" },
        { name: "Rekam Medis", icon: <FaFileMedical />, path: "/rekam-medis" },
        { name: "Data Imunisasi", icon: <FaSyringe />, path: "/imunisasi" },
        { name: "Jadwal Posyandu", icon: <FaCalendarAlt />, path: "/jadwal" },
    ];

    // Notes Content (TETAP SAMA)
    const notesContent = [
        { label: "Hepatitis B", value: "0 (<24 Jam)" },
        { label: "BCG", value: "0-1 Bulan" },
        { label: "Polio 1/DPT-HB-Hib 1", value: "Usia 2 Bulan" },
        { label: "Polio 2/DPT-HB-Hib 2", value: "Usia 3 Bulan" },
        { label: "Polio 3/DPT-HB-Hib 3", value: "Usia 4 Bulan" },
        { label: "IPV", value: "Usia 4 Bulan" },
        { label: "MR", value: "Usia 9 Bulan" },
        { label: "DPT-HB-Hib Lanjutan", value: "Usia 18 Bulan" },
        { label: "MR Lanjutan", value: "Usia 24 Bulan" },
    ];

    const filteredData = imunisasiData.filter((data) =>
        data.namaBalita?.toLowerCase().includes(search.toLowerCase())
    );

    const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delayChildren: 0.1, staggerChildren: 0.08 } } };
    const itemVariants = { hidden: { y: 15, opacity: 0 }, visible: { y: 0, opacity: 1 } };

    const handleDelete = (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus data imunisasi ini?")) {
            const loadingToast = toast.loading("Menghapus data...");
            remove(ref(db, `imunisasi/${id}`))
                .then(() => {
                    toast.dismiss(loadingToast);
                    toast.success("Data berhasil dihapus!");
                })
                .catch((err) => {
                    toast.dismiss(loadingToast);
                    toast.error("Gagal menghapus data. Silakan coba lagi.");
                    console.error("Delete failed:", err);
                });
        }
    };
    
    // PDF download logic (TETAP SAMA)
    const handleDownloadPDF = () => {
    const doc = new jsPDF("landscape", "mm", "a4");

        const centerX = 148.5; 
        let currentY = 15;

        // Baris 1: Nama Posyandu (Paling Menonjol)
        doc.setFontSize(18);
        doc.setFont("times", "bold");
        doc.text("POSYANDU", centerX, currentY, { align: "center" });

        currentY += 8;

        // Baris 2: Alamat Lokasi
        doc.setFontSize(11);
        doc.setFont("times", "normal");
        doc.text("Alamat", centerX, currentY, { align: "center" });

        currentY += 5;

        // Garis Pemisah Kop (Garis Ganda yang lebih jelas)
        doc.setLineWidth(0.8); // Garis tebal
        doc.line(15, currentY, 282, currentY); 
        doc.setLineWidth(0.2); // Garis tipis kedua
        doc.line(15, currentY + 1, 282, currentY + 1);

        currentY += 8; // Jarak setelah garis pemisah

        // --- 2. JUDUL DOKUMEN ---
        doc.setFontSize(14);
        doc.setFont("times", "bold");
        doc.text("SURAT KETERANGAN DATA IMUNISASI BALITA", centerX, currentY, { align: "center" });
        
        currentY += 15;

        // --- 3. PARAGRAF PEMBUKA ---
        doc.setFontSize(11);
        doc.setFont("times", "normal");
        // Paragraf pembuka dimulai pada Y setelah judul
        doc.text("Dengan hormat,\n\nSehubungan dengan pendataan imunisasi balita di Posyandu, bersama ini kami sampaikan rekapitulasi data imunisasi balita sebagai berikut:", 20, currentY, { maxWidth: 260 });

        const tableStartY = currentY + 30; // Estimasi Y untuk memulai tabel

        // --- 4. DATA TABEL ---
        const headers = [
            "No", "Nama Balita", "Jns Kel", "Tgl Lahir",
            "Hepatitis B", "BCG", "Polio 1", "DPT-HB-Hib 1",
            "Polio 2", "DPT-HB-Hib 2", "Polio 3", "DPT-HB-Hib 3",
            "Polio 4", "IPV", "MR", "DPT-HB-Hib Lnjtn", "MR Lanjutan"
        ];

        const body = filteredData.map((data, idx) => [
            idx + 1,
            data.namaBalita || "-", 
            data.jenisKelamin || "-", 
            data.tanggalLahir || "-",
            formatImunisasiCell(data.hepatitisB), 
            formatImunisasiCell(data.bcg), 
            formatImunisasiCell(data.polio1), 
            formatImunisasiCell(data.dptHbHib1),
            formatImunisasiCell(data.polio2), 
            formatImunisasiCell(data.dptHbHib2), 
            formatImunisasiCell(data.polio3), 
            formatImunisasiCell(data.dptHbHib3),
            formatImunisasiCell(data.polio4), 
            formatImunisasiCell(data.ipv), 
            formatImunisasiCell(data.mr), 
            formatImunisasiCell(data.dptHbHibLanjutan), 
            formatImunisasiCell(data.mrLanjutan),
        ]);

        autoTable(doc, {
            head: [headers],
            body: body,
            startY: tableStartY,
            theme: "grid",
            // Menggunakan font yang lebih kecil dan padding minimal agar 17 kolom muat
            styles: { fontSize: 6.5, cellPadding: 1, overflow: "linebreak" }, 
            headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 7, fontStyle: "bold" },
            // Menambahkan margin agar tabel punya ruang gerak di halaman
            margin: { top: 10, bottom: 20, left: 10, right: 10 },
        });

        // --- 5. PENUTUP DAN TANDA TANGAN (MEMPERBAIKI POSISI Y) ---
        
        let finalY = doc.lastAutoTable.finalY + 15; 
        
        // Periksa apakah tanda tangan akan terpotong
        const pageHeightLimit = 180; 
        
        if (finalY > pageHeightLimit) {
            doc.addPage();
            finalY = 20; // Mulai di 20mm pada halaman baru
        }

        doc.setFontSize(11);
        doc.text("Demikian surat keterangan ini dibuat dengan sebenar-benarnya untuk dapat dipergunakan sebagaimana mestinya.\n\nAtas perhatian dan kerjasamanya, kami ucapkan terima kasih.", 20, finalY, { maxWidth: 260 });
        
        // Jarak Y untuk baris Tanggal dan Tanda Tangan
        const signatureY = finalY + 25; 

        const tanggal = new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
        
        const ttdX = 220; // Posisi X untuk Tanda Tangan (di kanan)
        const tempat = "Jayapura"; // Mengganti "Jakarta" dengan "Jayapura"

        doc.text(`${tempat}, ${tanggal}`, ttdX, signatureY, { align: "left" });
        doc.text("Hormat Kami,", ttdX, signatureY + 10, { align: "left" }); 
        doc.text("(__________________)", ttdX, signatureY + 35, { align: "left" }); 

        try {
            doc.save("surat_data_imunisasi.pdf");
        } catch (error) {
            console.error("PDF download failed:", error);
            // Pastikan 'toast' diimpor atau didefinisikan jika ingin menggunakan notifikasi
            // toast.error("Gagal mengunduh file PDF."); 
        }
    };


    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 font-sans overflow-hidden">
            <Topbar pageTitle="Data Imunisasi" />

            {/* Quick Access (TETAP SAMA) */}
            <motion.div
                className="flex gap-4 overflow-x-auto py-4 -mx-6 px-6 scrollbar-hide"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {quickAccessItems.map((item) => (
                    <motion.button
                        key={item.path}
                        variants={itemVariants}
                        whileHover={{ scale: 1.03, boxShadow: "0 6px 15px -3px rgba(0,0,0,0.1)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(item.path)}
                        className={`flex items-center gap-3 px-5 py-2 rounded-2xl shadow-md transition-all duration-300 flex-shrink-0 whitespace-nowrap font-semibold text-sm cursor-pointer ${
                            item.path === "/imunisasi"
                                ? "bg-blue-600 text-white border-blue-300"
                                : "bg-white text-gray-800 border border-blue-100 hover:border-blue-300"
                        }`}
                    >
                        <div className={`text-lg ${item.path === "/imunisasi" ? "text-white" : "text-blue-500"}`}>
                            {item.icon}
                        </div>
                        <span>{item.name}</span>
                    </motion.button>
                ))}
            </motion.div>

            {/* Catatan Singkatan (TETAP SAMA) */}
            <motion.div
                className="bg-white/70 backdrop-blur-md rounded-3xl p-4 shadow-xl border border-gray-200 mb-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="flex items-center gap-2 mb-2">
                    <FaInfoCircle className="text-blue-600 text-lg" />
                    <h2 className="text-md font-bold text-gray-800">Catatan Singkatan & Jadwal</h2>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-gray-600 text-xs sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7">
                    {notesContent.map((note, index) => (
                        <motion.div key={index} variants={itemVariants} className="flex items-center gap-1">
                            <span className="font-semibold text-blue-700 flex-shrink-0">{note.label}:</span>
                            <span className="flex-shrink-1">{note.value}</span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Main Table Header & Controls (TETAP SAMA) */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                    <h1 className="text-3xl font-extrabold text-gray-800 hidden lg:block">
                        Kelola Data Imunisasi
                    </h1>
                    <div className="flex items-center gap-4 w-full justify-between lg:w-auto lg:justify-normal">
                        <div className="relative flex-1 flex items-center bg-white/50 backdrop-blur-md rounded-2xl shadow-inner border border-gray-200 px-4">
                            <FaSearch className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari nama balita..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-transparent px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none"
                            />
                        </div>
                        <motion.button
                            onClick={handleDownloadPDF}
                            className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-2xl font-semibold flex items-center gap-2 shadow-lg transition-all duration-300 transform hover:scale-105 flex-shrink-0"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaFilePdf className="text-lg" />
                            <span className="hidden sm:inline">Unduh PDF</span>
                        </motion.button>
                        <motion.button
                            onClick={() => {
                                setSelectedData(null);
                                setOpenModal(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-semibold flex items-center gap-2 shadow-lg transition-all duration-300 transform hover:scale-105 flex-shrink-0"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaPlus className="text-lg" />
                            <span className="hidden sm:inline">Tambah Data</span>
                        </motion.button>
                    </div>
                </div>

                {/* Tabel Utama */}
                <motion.div
                    className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex-1 flex flex-col"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="overflow-auto" style={{ maxHeight: tableHeight }} ref={tableRef}>
                        <table className="min-w-full divide-y divide-gray-100">
                            {/* Header: Lebar Kolom Disesuaikan untuk Proporsional (TETAP SAMA) */}
                            <thead className="bg-blue-600 text-white sticky top-0 z-10 shadow-lg">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider w-1/12">No</th> 
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider w-3/12">Nama Balita</th> 
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider w-2/12">Jns Kel</th> 
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider w-2/12">Tgl Lahir</th> 
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider w-3/12">Status Imunisasi</th> 
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider w-1/12">Aksi</th> 
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredData.length > 0 ? (
                                    filteredData.map((data, idx) => {
                                        const status = getImunisasiStatus(data);
                                        
                                        return (
                                            <motion.tr
                                                key={data.id}
                                                className="hover:bg-blue-50/50 transition-colors duration-200"
                                                variants={itemVariants}
                                            >
                                                {/* No */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-1/12">{idx + 1}</td>
                                                {/* Nama Balita */}
                                                <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-800 text-sm w-3/12">
                                                    {data.namaBalita || "-"}
                                                </td>
                                                {/* Jenis Kelamin (Rata Tengah) */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600 w-2/12">{data.jenisKelamin || "-"}</td>
                                                {/* Tanggal Lahir (Rata Tengah) */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600 w-2/12">{data.tanggalLahir || "-"}</td>
                                                {/* Status Imunisasi (Badge) */}
                                                <td className="px-6 py-4 text-center whitespace-nowrap text-sm w-3/12">
                                                    <span 
                                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                                                            status.label === "Lengkap" ? "bg-green-100 text-green-700" :
                                                            status.label === "Sebagian" ? "bg-yellow-100 text-yellow-700" :
                                                            "bg-red-100 text-red-700"
                                                        }`}
                                                    >
                                                        {status.label}
                                                    </span>
                                                    <span className="text-gray-500 block text-xs mt-1">
                                                        ({status.count} dari {status.total})
                                                    </span>
                                                </td>
                                                {/* Aksi - STYLE DIPERBARUI */}
                                                <td className="px-6 py-4 whitespace-nowrap text-center w-1/12">
                                                    <div className="flex justify-center items-center space-x-2">
                                                        {/* Tombol Detail (Biru Solid) */}
                                                        <motion.button
                                                            onClick={() => {
                                                                setSelectedData(data);
                                                                setOpenDetailModal(true); 
                                                            }}
                                                            // Style Diperbarui: Kotak solid, shadow
                                                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl shadow-md"
                                                            title="Lihat Detail"
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            <FaInfoCircle className="text-base" />
                                                        </motion.button>
                                                        
                                                        {/* Tombol Edit (Kuning Solid) */}
                                                        <motion.button
                                                            onClick={() => {
                                                                setSelectedData(data);
                                                                setOpenModal(true);
                                                            }}
                                                            // Style Diperbarui: Kotak solid, shadow
                                                            className="bg-yellow-400 hover:bg-yellow-500 text-white p-2 rounded-xl shadow-md"
                                                            title="Edit Data"
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            <FaEdit className="text-base" />
                                                        </motion.button>
                                                        {/* Tombol Hapus (Merah Solid) */}
                                                        <motion.button
                                                            onClick={() => handleDelete(data.id)}
                                                            // Style Diperbarui: Kotak solid, shadow
                                                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl shadow-md"
                                                            title="Hapus Data"
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            <FaTrashAlt className="text-base" />
                                                        </motion.button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-center text-gray-500 py-10 bg-white"> 
                                            Tidak ada data imunisasi yang ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </main>

            {/* Modal Tambah/Edit (TETAP SAMA) */}
            <ModalImunisasi
                isOpen={openModal}
                onClose={() => setOpenModal(false)}
                initialData={selectedData}
                onSaved={() => {}} 
            />
            
            {/* Modal Detail Imunisasi Baru (TETAP SAMA) */}
            <ImunisasiDetailModal
                isOpen={openDetailModal}
                onClose={() => setOpenDetailModal(false)}
                data={selectedData} 
            />
        </div>
    );
}