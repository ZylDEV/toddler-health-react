// src/pages/DataBalita.js

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
import Topbar from "./components/Topbar";
import ModalBalita from "./components/ModalBalita";
import BalitaDetailModal from "./components/BalitaDetailModal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import toast from "react-hot-toast";

// Firebase
import { db } from "../config/firebase";
import { ref, onValue, remove } from "firebase/database";

export default function DataBalita() {
    const navigate = useNavigate();
    const [balitas, setBalitas] = useState([]);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedData, setSelectedData] = useState(null);

    const tableContainerRef = useRef(); 
    const [tableHeight, setTableHeight] = useState("auto");

    // Load data balita dari Firebase (TETAP SAMA)
    useEffect(() => {
        const balitaRef = ref(db, "balita");
        const unsubscribe = onValue(balitaRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const formatted = Object.entries(data).map(([key, value]) => ({
                    id: key,
                    ...value,
                }));
                setBalitas(formatted);
            } else {
                setBalitas([]);
            }
        });
        return () => unsubscribe();
    }, []);

    // Hook untuk menghitung tinggi tabel dinamis (TETAP SAMA)
    useEffect(() => {
        const updateHeight = () => {
            // Estimasi tinggi elemen-elemen di atas tabel
            const topbarHeight = 80;
            const quickAccessHeight = 80;
            const headerHeight = 80;
            const padding = 48;
            const availableHeight =
                window.innerHeight - (topbarHeight + quickAccessHeight + headerHeight + padding);
            setTableHeight(`${availableHeight}px`);
        };
        updateHeight();
        window.addEventListener("resize", updateHeight);
        return () => window.removeEventListener("resize", updateHeight);
    }, []);


    // Filter pencarian (TETAP SAMA)
    const filteredBalitas = balitas.filter(
        (b) =>
            b.nama?.toLowerCase().includes(search.toLowerCase()) ||
            b.namaIbu?.toLowerCase().includes(search.toLowerCase()) ||
            b.namaAyah?.toLowerCase().includes(search.toLowerCase()) ||
            b.nikIbu?.toLowerCase().includes(search.toLowerCase())
    );

    // Handlers (TETAP SAMA)
    const handleAdd = () => {
        setSelectedData(null);
        setIsModalOpen(true);
    };

    const handleEdit = (balita) => {
        setSelectedData(balita);
        setIsModalOpen(true);
    };

    const handleDetail = (balita) => {
        setSelectedData(balita);
        setIsDetailModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus data balita ini?")) {
            const loadingToast = toast.loading("Menghapus data balita...");
            remove(ref(db, `balita/${id}`))
                .then(() => {
                    toast.dismiss(loadingToast);
                    toast.success("Data balita berhasil dihapus!");
                })
                .catch((err) => {
                    toast.dismiss(loadingToast);
                    toast.error("Gagal menghapus data. Silakan coba lagi.");
                    console.error("Delete failed:", err);
                });
        }
    };

    const handleSave = () => {
        setIsModalOpen(false);
        setSelectedData(null);
    };

    // Download PDF (TETAP SAMA)
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

        // --- 2. JUDUL DOKUMEN (Disamakan dengan Kop Surat) ---
        doc.setFontSize(14);
        doc.setFont("times", "bold");
        doc.text("SURAT KETERANGAN DATA BALITA", centerX, currentY, { align: "center" });
        
        currentY += 15;

        // --- 3. PARAGRAF PEMBUKA ---
        doc.setFontSize(11);
        doc.setFont("times", "normal");
        doc.setLineHeightFactor(1.5);
        const openingText = "Dengan hormat,\n\n" +
                            "Sehubungan dengan pendataan balita di Posyandu, bersama ini kami sampaikan " +
                            "rekapitulasi data balita sebagai berikut:";
        
        doc.text(openingText, 20, currentY, { maxWidth: 260 });

        const tableStartY = currentY + 30; // Estimasi Y untuk memulai tabel

        // --- 4. TABEL DATA BALITA ---
        autoTable(doc, {
            head: [
                [
                    "No", "Nama Balita", "Jenis Kelamin", "Tempat Lahir", 
                    "Tanggal Lahir", "NIK Ibu", "Nama Ibu", "Nama Ayah", "Alamat"
                ],
            ],
            body: filteredBalitas.map((b, idx) => [
                idx + 1,
                b.nama || "-",
                b.jenisKelamin || "-",
                b.tempatLahir || "-",
                b.tanggalLahir || "-",
                b.nikIbu || "-",
                b.namaIbu || "-",
                b.namaAyah || "-",
                b.alamat || "-",
            ]),
            startY: tableStartY,
            theme: "grid",
            styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
            headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 8, fontStyle: "bold" },
            columnStyles: {
                // Lebarkan kolom NIK dan Alamat
                5: { cellWidth: 30 },
                8: { cellWidth: 60 },
            },
            margin: { top: 10, bottom: 20 },
        });

        // --- 5. PENUTUP DAN TANDA TANGAN (PERBAIKAN POSISI) ---
        
        let finalY = doc.lastAutoTable.finalY + 15; 
        
        // Periksa apakah tanda tangan akan terpotong
        const pageHeightLimit = 180; 
        
        if (finalY > pageHeightLimit) {
            doc.addPage();
            finalY = 20; // Mulai di 20mm pada halaman baru
        }

        doc.setFontSize(11);
        doc.setFont("times", "normal");
        doc.text(
            "Demikian surat keterangan ini dibuat dengan sebenar-benarnya untuk dapat " +
            "dipergunakan sebagaimana mestinya.\n\n" +
            "Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.",
            20,
            finalY,
            { maxWidth: 260 }
        );

        // Jarak Y untuk baris Tanggal dan Tanda Tangan
        const signatureY = finalY + 25; 
        const ttdX = 220; // Posisi X untuk Tanda Tangan (di kanan)
        const tempat = "Jayapura"; // Menggunakan lokasi Posyandu

        const tanggal = new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

        doc.text(`${tempat}, ${tanggal}`, ttdX, signatureY, { align: "left" });
        doc.text("Hormat Kami,", ttdX, signatureY + 10, { align: "left" }); 
        doc.text("(__________________)", ttdX, signatureY + 35, { align: "left" }); 

        doc.save("data_balita.pdf");
    };

    // Quick Access (TETAP SAMA)
    const quickAccessItems = [
        { name: "Dashboard", icon: <FaTachometerAlt />, path: "/dashboard" },
        { name: "Data Admin", icon: <FaUser />, path: "/data-admin" },
        { name: "Data User", icon: <FaUsers />, path: "/data-user" },
        { name: "Data Balita", icon: <FaBaby />, path: "/data-balita" },
        { name: "Rekam Medis", icon: <FaFileMedical />, path: "/rekam-medis" },
        { name: "Data Imunisasi", icon: <FaSyringe />, path: "/imunisasi" },
        { name: "Jadwal Posyandu", icon: <FaCalendarAlt />, path: "/jadwal" },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { delayChildren: 0.1, staggerChildren: 0.08 },
        },
    };

    const itemVariants = {
        hidden: { y: 15, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 font-sans overflow-hidden">
            <Topbar pageTitle="Data Balita" />

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
                            item.path === "/data-balita"
                                ? "bg-blue-600 text-white border-blue-300"
                                : "bg-white text-gray-800 border border-blue-100 hover:border-blue-300"
                        }`}
                    >
                        <div
                            className={`text-lg ${
                                item.path === "/data-balita" ? "text-white" : "text-blue-500"
                            }`}
                        >
                            {item.icon}
                        </div>
                        <span>{item.name}</span>
                    </motion.button>
                ))}
            </motion.div>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Controls */}
                <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                    <h1 className="text-3xl font-extrabold text-gray-800 hidden lg:block">
                        Kelola Data Balita
                    </h1>

                    <div className="flex items-center gap-4 w-full justify-between lg:w-auto lg:justify-normal">
                        {/* Search */}
                        <div className="relative flex items-center bg-white/50 backdrop-blur-md rounded-2xl shadow-inner border border-gray-200 px-4 flex-1">
                            <FaSearch className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari nama balita / NIK Ibu..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-transparent px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none"
                            />
                        </div>

                        {/* Download PDF */}
                        <motion.button
                            onClick={handleDownloadPDF}
                            className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-2xl font-semibold flex items-center gap-2 shadow-lg transition-all duration-300 transform hover:scale-105"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaFilePdf className="text-lg" />
                            <span className="hidden sm:inline">Unduh PDF</span>
                        </motion.button>

                        {/* Add Balita */}
                        <motion.button
                            onClick={handleAdd}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-semibold flex items-center gap-2 shadow-lg transition-all duration-300 transform hover:scale-105"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaPlus className="text-lg" />
                            <span className="hidden sm:inline">Tambah Balita</span>
                        </motion.button>
                    </div>
                </div>

                {/* Table */}
                <motion.div
                    className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex-1 flex flex-col"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Hapus semua baris kosong/newline di antara tag tabel kritis */}
                    <div ref={tableContainerRef} className="overflow-auto rounded-b-3xl" style={{ maxHeight: tableHeight }}>
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-blue-600 text-white sticky top-0 z-10 shadow-lg">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-[3%]">No</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-[12%]">Nama Balita</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-[8%]">Jns Kel</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-[10%]">Tempat Lahir</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-[10%]">Tanggal Lahir</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-[15%]">NIK Ibu</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-[12%]">Nama Ibu</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-[12%]">Nama Ayah</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-[10%]">Alamat</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider w-[8%]">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredBalitas.length > 0 ? (
                                    filteredBalitas.map((b, idx) => (
                                        <motion.tr
                                            key={b.id}
                                            className="hover:bg-blue-50/50 transition-colors duration-300"
                                            variants={itemVariants}
                                        >
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{idx + 1}</td>
                                            <td className="px-4 py-3 whitespace-nowrap font-bold text-gray-800 text-sm">{b.nama}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{b.jenisKelamin || "-"}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{b.tempatLahir}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{b.tanggalLahir}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{b.nikIbu}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{b.namaIbu}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{b.namaAyah}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{b.alamat}</td>
                                            {/* Kolom Aksi: Tombol ringkas (DISESUAIKAN) */}
                                            <td className="px-4 py-3 text-center space-x-2 whitespace-nowrap">
                                                
                                                {/* Tombol Detail (Biru) */}
                                                <motion.button
                                                    onClick={() => handleDetail(b)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl shadow-md"
                                                    title="Lihat Detail"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <FaInfoCircle className="text-base" />
                                                </motion.button>

                                                {/* Tombol Edit (Kuning) */}
                                                <motion.button
                                                    onClick={() => handleEdit(b)}
                                                    className="bg-yellow-400 hover:bg-yellow-500 text-white p-2 rounded-xl shadow-md"
                                                    title="Edit Data"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <FaEdit className="text-base" />
                                                </motion.button>
                                                
                                                {/* Tombol Hapus (Merah) */}
                                                <motion.button
                                                    onClick={() => handleDelete(b.id)}
                                                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl shadow-md"
                                                    title="Hapus Data"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <FaTrashAlt className="text-base" />
                                                </motion.button>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={10} className="text-center py-12 text-gray-500 font-medium bg-white">
                                            Tidak ada data balita yang ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </main>

            {/* Modal Input/Edit Balita (TETAP SAMA) */}
            <ModalBalita
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSaved={handleSave}
                initialData={selectedData}
            />

            {/* Modal Detail Balita (TETAP SAMA) */}
            <BalitaDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => { setIsDetailModalOpen(false); setSelectedData(null); }}
                data={selectedData}
            />
        </div>
    );
}