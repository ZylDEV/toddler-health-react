// src/pages/JadwalPosyandu.js
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
import ModalJadwal from "./components/ModalJadwal";
import JadwalDetailModal from "./components/JadwalDetailModal"; // Impor modal detail
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { db } from "../config/firebase";
import { ref, onValue, push, remove } from "firebase/database";

export default function JadwalPosyandu() {
    const navigate = useNavigate();
    const tableRef = useRef();
    const [tableHeight, setTableHeight] = useState("500px");

    const [jadwal, setJadwal] = useState([]);
    const [search, setSearch] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [openDetailModal, setOpenDetailModal] = useState(false); // State untuk Detail Modal
    const [selectedJadwal, setSelectedJadwal] = useState(null);

    // Load data dari Firebase
    useEffect(() => {
        const jadwalRef = ref(db, "jadwal");
        onValue(jadwalRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const formattedData = Object.entries(data).map(([id, item]) => ({
                    id,
                    ...item,
                }));
                setJadwal(formattedData);
            } else {
                setJadwal([]);
            }
        });
    }, []);

    // Filter jadwal
    const filteredJadwal = jadwal.filter(
        (item) =>
            item.lokasi?.toLowerCase().includes(search.toLowerCase()) ||
            item.deskripsiKegiatan?.toLowerCase().includes(search.toLowerCase())
    );

    // Hapus jadwal
    const handleDelete = (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus jadwal posyandu ini?")) {
            const jadwalRef = ref(db, `jadwal/${id}`);
            remove(jadwalRef)
                .then(() => console.log("Jadwal berhasil dihapus"))
                .catch((err) => console.error("Gagal menghapus jadwal", err));
        }
    };

    // Tambah/Edit jadwal
    // JadwalPosyandu.js (bagian handleSave)
    const handleSave = (data) => {
    if (selectedJadwal && selectedJadwal.id) {
        // Edit jadwal: update state lokal
        setJadwal((prev) =>
        prev.map((item) =>
            item.id === selectedJadwal.id ? { ...item, ...data } : item
        )
        );
        console.log("Jadwal berhasil diupdate (state lokal)");
    } else {
        // Tambah jadwal baru: push ke Firebase dulu, lalu ambil key baru
        const dataRef = ref(db, "jadwal");
        push(dataRef, data)
        .then((res) => {
            const newItem = { id: res.key, ...data };
            setJadwal((prev) => [...prev, newItem]);
            console.log("Jadwal berhasil ditambahkan");
        })
        .catch((err) => console.error("Gagal menambah jadwal", err));
    }
    };


    // Tambah jadwal via modal (untuk modal tambah/edit)
    const handleAdd = () => {
        setSelectedJadwal(null);
        setOpenModal(true);
    };

    // Lihat Detail jadwal via modal
    const handleViewDetail = (item) => {
        setSelectedJadwal(item);
        setOpenDetailModal(true);
    };

    // Download PDF formal
    const handleDownloadPDF = () => {
    const doc = new jsPDF("landscape", "mm", "a4");

    const centerX = 148.5; 
    let currentY = 15;

    // --- 1. KOP SURAT POSYANDU BOUGENVIL ---

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
        // Judul dimulai pada Y setelah Kop Surat
        doc.text("JADWAL PELAKSANAAN POSYANDU", centerX, currentY, { align: "center" });

        currentY += 15;

        // --- 3. PARAGRAF PEMBUKA ---
        doc.setFont("times", "normal");
        doc.setFontSize(11);
        doc.setLineHeightFactor(1.5);
        // Paragraf pembuka dimulai pada Y setelah Judul
        doc.text(
            "Berikut adalah rekapitulasi jadwal kegiatan Posyandu:",
            20,
            currentY,
            { maxWidth: 260 }
        );

        const tableStartY = currentY + 10; // Estimasi Y untuk memulai tabel

        // --- 4. TABEL DATA ---
        autoTable(doc, {
            head: [["No", "Tanggal Pelaksanaan", "Waktu Pelaksanaan", "Lokasi", "Deskripsi Kegiatan"]],
            body: filteredJadwal.map((item, idx) => [
                idx + 1,
                item.tanggalPelaksanaan || "-",
                item.waktuPelaksanaan || "-",
                item.lokasi || "-",
                item.deskripsiKegiatan || "-",
            ]),
            // Mulai tabel setelah paragraf pembuka
            startY: tableStartY, 
            theme: "grid",
            styles: { fontSize: 8, cellPadding: 2, font: "times", overflow: "linebreak" },
            headStyles: { fillColor: [29, 78, 216], textColor: 255, fontSize: 8, fontStyle: "bold" }, 
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
        // Paragraf penutup dimulai pada Y setelah tabel
        doc.text(
            "Demikian jadwal ini dibuat agar dapat dipergunakan sebagaimana mestinya.\n\n" +
            "Atas perhatian dan partisipasinya, kami ucapkan terima kasih.",
            20,
            finalY,
            { maxWidth: 260 }
        );
        
        const signatureY = finalY + 20; // Jarak Y untuk baris Tanggal dan Tanda Tangan
        const ttdX = 220; // Posisi X untuk Tanda Tangan (di kanan)
        const tempat = "Jayapura"; // Menggunakan lokasi Posyandu

        const tanggal = new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

        doc.text(`${tempat}, ${tanggal}`, ttdX, signatureY, { align: "left" });
        doc.text("Mengetahui,", ttdX, signatureY + 10, { align: "left" }); 
        doc.text("Petugas Posyandu", ttdX, signatureY + 20, { align: "left" });
        doc.text("(__________________)", ttdX, signatureY + 45, { align: "left" }); 

        doc.save("jadwal_posyandu.pdf");
    };

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
        visible: { opacity: 1, transition: { delayChildren: 0.1, staggerChildren: 0.08 } },
    };
    const itemVariants = { hidden: { y: 15, opacity: 0 }, visible: { y: 0, opacity: 1 } };

    useEffect(() => {
        const updateHeight = () => {
            const topbarHeight = 80,
                quickAccessHeight = 80,
                headerHeight = 80,
                padding = 48;
            const availableHeight = window.innerHeight - (topbarHeight + quickAccessHeight + headerHeight + padding);
            setTableHeight(`${availableHeight}px`);
        };
        updateHeight();
        window.addEventListener("resize", updateHeight);
        return () => window.removeEventListener("resize", updateHeight);
    }, []);

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 font-sans overflow-hidden">
            <Topbar pageTitle="Jadwal Posyandu" />

            {/* Quick Access Horizontal */}
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
                            item.path === "/jadwal"
                                ? "bg-blue-600 text-white border-blue-300"
                                : "bg-white text-gray-800 border border-blue-100 hover:border-blue-300"
                        }`}
                    >
                        <div className={`text-lg ${item.path === "/jadwal" ? "text-white" : "text-blue-500"}`}>
                            {item.icon}
                        </div>
                        <span>{item.name}</span>
                    </motion.button>
                ))}
            </motion.div>

            {/* Main Content */}
            <main className="flex-1 mt-6 space-y-8 overflow-hidden">
                {/* Header & Controls */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <h1 className="text-3xl font-extrabold text-gray-800 hidden lg:block">Jadwal Posyandu</h1>
                    <div className="flex items-center gap-4 w-full justify-between lg:w-auto lg:justify-normal">
                        {/* Search */}
                        <div className="relative flex items-center bg-white/50 backdrop-blur-md rounded-2xl shadow-inner border border-gray-200 px-4 flex-1">
                            <FaSearch className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari lokasi atau kegiatan..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-transparent px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none"
                            />
                        </div>

                        {/* Tombol PDF */}
                        <motion.button
                            onClick={handleDownloadPDF}
                            className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-2xl font-semibold flex items-center gap-2 shadow-lg transition-all duration-300 transform hover:scale-105 flex-shrink-0"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaFilePdf className="text-lg" />
                            <span className="hidden sm:inline">Unduh PDF</span>
                        </motion.button>

                        {/* Tombol Tambah */}
                        <motion.button
                            onClick={handleAdd}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-semibold flex items-center gap-2 shadow-lg transition-all duration-300 transform hover:scale-105 flex-shrink-0"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaPlus className="text-lg" />
                            <span className="hidden sm:inline">Tambah Jadwal</span>
                        </motion.button>
                    </div>
                </div>

                {/* Table Card */}
                <motion.div
                    className="bg-white/50 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden border border-gray-200"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="overflow-auto" style={{ maxHeight: tableHeight }} ref={tableRef}>
                        <table className="min-w-full divide-y divide-gray-200">
                            {/* Menggunakan bg-blue-600 untuk Header yang Solid */}
                            <thead className="bg-blue-600 text-white sticky top-0 z-10 shadow-lg"> 
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">No</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Tanggal Pelaksanaan</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Waktu Pelaksanaan</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Lokasi</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold">Deskripsi Kegiatan</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200/50">
                                {filteredJadwal.length > 0 ? (
                                    filteredJadwal.map((item, idx) => (
                                        <motion.tr
                                            key={item.id}
                                            className="hover:bg-blue-50/50 transition-colors duration-300"
                                            variants={itemVariants}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">{idx + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{item.tanggalPelaksanaan}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{item.waktuPelaksanaan}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{item.lokasi}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">{item.deskripsiKegiatan}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                                                <div className="flex justify-center items-center space-x-2">
                                                    
                                                    {/* Tombol Lihat Detail (BIRU SOLID) */}
                                                    <motion.button
                                                        onClick={() => handleViewDetail(item)}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl shadow-md transition-all duration-300"
                                                        title="Lihat Detail"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <FaInfoCircle className="text-base" /> 
                                                    </motion.button>
                                                    
                                                    {/* Tombol Edit (KUNING SOLID) */}
                                                    <motion.button
                                                        onClick={() => {
                                                            setSelectedJadwal(item);
                                                            setOpenModal(true);
                                                        }}
                                                        className="bg-yellow-400 hover:bg-yellow-500 text-white p-2 rounded-xl shadow-md transition-all duration-300"
                                                        title="Edit Jadwal"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <FaEdit className="text-base" /> 
                                                    </motion.button>
                                                    
                                                    {/* Tombol Hapus (MERAH SOLID) */}
                                                    <motion.button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl shadow-md transition-all duration-300"
                                                        title="Hapus Jadwal"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <FaTrashAlt className="text-base" /> 
                                                    </motion.button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-gray-500 font-medium">
                                            Tidak ada data jadwal posyandu yang ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </main>

            {/* Modal Tambah/Edit Jadwal */}
            <ModalJadwal
                isOpen={openModal}
                onClose={() => setOpenModal(false)}
                onSaved={handleSave}
                initialData={selectedJadwal}
            />

            {/* Modal Detail Jadwal */}
            <JadwalDetailModal
                isOpen={openDetailModal}
                onClose={() => setOpenDetailModal(false)}
                data={selectedJadwal}
            />
        </div>
    );
}