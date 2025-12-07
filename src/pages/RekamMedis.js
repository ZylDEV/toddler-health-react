// src/pages/RekamMedis.js

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaSearch, FaEdit, FaTrashAlt, FaPlus, FaFilePdf, FaInfoCircle, // FaInfoCircle digunakan untuk tombol Detail
    FaTachometerAlt, FaUser, FaUsers, FaBaby,
    FaFileMedical, FaSyringe, FaCalendarAlt
} from "react-icons/fa";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import Topbar from "./components/Topbar";
import ModalRekamMedis from "./components/ModalRekamMedis";
import RekamMedisDetailModal from "./components/RekamMedisDetailModal";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { db } from "../config/firebase";
import { ref, onValue, push, update, remove } from "firebase/database";

export default function RekamMedis() {
    const navigate = useNavigate();
    const [rekamMedis, setRekamMedis] = useState([]);
    const [search, setSearch] = useState("");
    const [openModal, setOpenModal] = useState(false); // Modal Tambah/Edit
    const [openDetailModal, setOpenDetailModal] = useState(false); // Modal Detail BARU
    const [selectedData, setSelectedData] = useState(null);

    const tableContainerRef = useRef();
    const [tableHeight, setTableHeight] = useState("500px");

    // Load data dari Firebase (TETAP SAMA)
    useEffect(() => {
        const rekamRef = ref(db, "rekamMedis");
        const unsubscribe = onValue(rekamRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const formattedData = Object.keys(data).map((key) => ({
                    id: key,
                    ...data[key],
                }));
                setRekamMedis(formattedData);
            } else {
                setRekamMedis([]);
            }
        });
        return () => unsubscribe();
    }, []);

    const filteredRekamMedis = rekamMedis.filter((data) =>
        data.namaBalita?.toLowerCase().includes(search.toLowerCase())
    );

    const handleSave = (data) => {
        const action = selectedData ? 'Memperbarui' : 'Menambah';
        const loadingToast = toast.loading(`${action} data rekam medis...`);

        const promise = selectedData
            ? update(ref(db, `rekamMedis/${selectedData.id}`), data)
            : push(ref(db, "rekamMedis"), data);

        promise
            .then(() => {
                toast.dismiss(loadingToast);
                toast.success(`Data berhasil di${selectedData ? 'perbarui' : 'simpan'}!`);
            })
            .catch((err) => {
                toast.dismiss(loadingToast);
                toast.error("Gagal menyimpan data. Silakan coba lagi.");
                console.error("Save failed:", err);
            });

        setSelectedData(null);
        setOpenModal(false);
    };

    const handleDelete = (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus data rekam medis ini?")) {
            const loadingToast = toast.loading("Menghapus data...");
            remove(ref(db, `rekamMedis/${id}`))
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

    // Fungsi handleDownloadPDF (TETAP SAMA)
    const handleDownloadPDF = () => {
    const doc = new jsPDF("landscape", "mm", "a4");

        const centerX = 148.5; 
        let currentY = 15;

        // --- 1. KOP SURAT RAPI (HANYA NAMA & ALAMAT) ---

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

        // Garis Pemisah Kop
        doc.setLineWidth(0.8); 
        doc.line(15, currentY, 282, currentY); 
        doc.setLineWidth(0.2); 
        doc.line(15, currentY + 1, 282, currentY + 1);

        currentY += 8; 

        // --- 2. JUDUL DOKUMEN ---
        doc.setFontSize(14);
        doc.setFont("times", "bold");
        doc.text("SURAT KETERANGAN DATA REKAM MEDIS BALITA", centerX, currentY, { align: "center" });
        
        currentY += 15;

        // --- 3. PARAGRAF PEMBUKA ---
        doc.setFontSize(11);
        doc.setFont("times", "normal");
        doc.setLineHeightFactor(1.5);
        const openingText = "Dengan hormat,\n\n" +
                            "Sehubungan dengan pendataan kesehatan balita di Posyandu, bersama ini kami sampaikan " +
                            "rekapitulasi data rekam medis balita sebagai berikut:";
        
        doc.text(openingText, 20, currentY, { maxWidth: 260 });

        const tableStartY = currentY + 30;

        // --- 4. TABEL DATA ---
        autoTable(doc, {
            head: [["No", "Nama Balita", "Jns Kel", "Usia", "Tgl Periksa", "BB (kg)", "TB/PB (cm)", "LK (cm)", "LL (cm)", "Vit A"]],
            body: filteredRekamMedis.map((data, idx) => [
                idx + 1,
                data.namaBalita || "-",
                data.jenisKelamin || "-",
                data.usia || "-",
                data.tanggalPemeriksaan || "-",
                data.bb || "-",
                data.tj || "-",
                data.lk || "-",
                data.ll || "-",
                data.vitaminA || "-",
            ]),
            startY: tableStartY, 
            theme: "grid",
            styles: { fontSize: 8, cellPadding: 2, font: "times" },
            headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 8, fontStyle: "bold" },
            columnStyles: {
                2: { cellWidth: 18 },
                3: { cellWidth: 15 },
                5: { cellWidth: 12 },
                6: { cellWidth: 15 },
                7: { cellWidth: 12 },
                8: { cellWidth: 12 },
                9: { cellWidth: 15 },
            },
            // Tambahkan opsi untuk penanganan baris baru (page break) jika tabel sangat panjang
            // Pilihan ini akan memastikan teks tanda tangan diletakkan di halaman berikutnya jika tidak cukup ruang
            margin: { top: 10, bottom: 20 },
        });

        // --- 5. PENUTUP DAN TANDA TANGAN ---
        
        // Titik awal paragraf penutup. Diambil 15mm setelah akhir tabel.
        let finalY = doc.lastAutoTable.finalY + 15; 
        
        // Pemeriksaan Manual (Penting): Jika finalY terlalu dekat dengan batas bawah halaman,
        // tambahkan halaman baru. Ukuran A4 Landscape adalah 210mm. Kita asumsikan batas aman 170mm.
        const pageHeightLimit = 180; 
        
        if (finalY > pageHeightLimit) {
            doc.addPage();
            finalY = 20; // Mulai di 20mm pada halaman baru
        }


        doc.setFontSize(11);
        const closingText = "Demikian surat keterangan ini dibuat dengan sebenar-benarnya untuk dapat " +
                            "dipergunakan sebagaimana mestinya.\n\n" +
                            "Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.";

        doc.text(closingText, 20, finalY, { maxWidth: 260 });
        
        // Jarak Y untuk baris Tanggal dan Tanda Tangan
        const signatureY = finalY + 25; 

        const tanggal = new Date().toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
        
        const ttdX = 220; // Posisi X untuk Tanda Tangan (di kanan)

        doc.text(`Jayapura, ${tanggal}`, ttdX, signatureY, { align: "left" });
        doc.text("Hormat Kami,", ttdX, signatureY + 10, { align: "left" }); // Jarak 10mm dari tanggal
        doc.text("(__________________)", ttdX, signatureY + 35, { align: "left" }); // Jarak 35mm dari tanggal

        doc.save("surat_data_rekam_medis.pdf");
    };

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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { delayChildren: 0.1, staggerChildren: 0.08 } },
    };
    const itemVariants = { hidden: { y: 15, opacity: 0 }, visible: { y: 0, opacity: 1 } };

    // Catatan Penting (TETAP SAMA)
    const notesContent = [
        { label: "BB", value: "Berat Badan" },
        { label: "PB", value: "Panjang Badan (Bayi 0-24 bulan)" },
        { label: "TB", value: "Tinggi Badan (Balita ≥ 2 tahun)" },
        { label: "LK", value: "Lingkar Kepala" },
        { label: "LL", value: "Lingkar Lengan" },
        { label: "Vit A (Biru)", value: "100.000 UI (6-11 bulan)" },
        { label: "Vit A (Merah)", value: "200.000 UI (12-59 bulan)" },
    ];

    // Hook untuk menghitung tinggi tabel dinamis (TETAP SAMA)
    useEffect(() => {
        const updateHeight = () => {
            const topbarHeight = 80;
            const quickAccessHeight = 80;
            const headerHeight = 80;
            const notesHeight = 150;
            const padding = 48;
            const availableHeight =
                window.innerHeight - (topbarHeight + quickAccessHeight + headerHeight + notesHeight + padding);
            setTableHeight(`${availableHeight}px`);
        };
        updateHeight();
        window.addEventListener("resize", updateHeight);
        return () => window.removeEventListener("resize", updateHeight);
    }, []);

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 font-sans overflow-hidden">
            <Topbar pageTitle="Rekam Medis" />

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
                            item.path === "/rekam-medis"
                                ? "bg-blue-600 text-white border-blue-300"
                                : "bg-white text-gray-800 border border-blue-100 hover:border-blue-300"
                        }`}
                    >
                        <div className={`text-lg ${item.path === "/rekam-medis" ? "text-white" : "text-blue-500"}`}>
                            {item.icon}
                        </div>
                        <span>{item.name}</span>
                    </motion.button>
                ))}
            </motion.div>

            {/* Header & Controls (TETAP SAMA) */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                    <h1 className="text-3xl font-extrabold text-gray-800 hidden lg:block">
                        Kelola Rekam Medis
                    </h1>
                    <div className="flex items-center gap-4 w-full justify-between lg:w-auto lg:justify-normal">
                        <div className="relative flex items-center bg-white/50 backdrop-blur-md rounded-2xl shadow-inner border border-gray-200 px-4 flex-1">
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
                            className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-2xl font-semibold flex items-center gap-2 shadow-lg transition-all duration-300 transform hover:scale-105"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaFilePdf className="text-lg" />
                            <span className="hidden sm:inline">Unduh PDF</span>
                        </motion.button>
                        <motion.button
                            onClick={() => { setSelectedData(null); setOpenModal(true); }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-semibold flex items-center gap-2 shadow-lg transition-all duration-300 transform hover:scale-105"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaPlus className="text-lg" />
                            <span className="hidden sm:inline">Tambah Data</span>
                        </motion.button>
                    </div>
                </div>

                {/* Catatan (TETAP SAMA) */}
                <motion.div
                    className="bg-white/70 backdrop-blur-md rounded-3xl p-4 shadow-xl border border-gray-200 mb-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <FaInfoCircle className="text-blue-600 text-lg" />
                        <h2 className="text-md font-bold text-gray-800">Catatan Singkatan & Kapsul Vitamin A</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-gray-600 text-xs sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
                        {notesContent.map((note, index) => (
                            <motion.div key={index} variants={itemVariants} className="flex items-center gap-1">
                                <span className="font-semibold text-blue-700 flex-shrink-0">{note.label}:</span>
                                <span className="flex-shrink-1">{note.value}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Table (Style Kolom Aksi Diperbarui) */}
                <motion.div
                    className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex-1 flex flex-col"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div ref={tableContainerRef} className="overflow-auto rounded-b-3xl" style={{ maxHeight: tableHeight }}>
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-blue-600 text-white sticky top-0 z-10 shadow-lg">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-[5%]">No</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider w-[18%]">Nama Balita</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider w-[10%]">Jns Kel</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider w-[8%]">Usia</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider w-[12%]">Tgl Periksa</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider w-[8%]">BB (kg)</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider w-[8%]">TB/PB (cm)</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider w-[8%]">LK (cm)</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider w-[8%]">LL (cm)</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider w-[8%]">Vit A</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider w-[7%]">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredRekamMedis.length > 0 ? (
                                    filteredRekamMedis.map((data, idx) => (
                                        <motion.tr key={data.id} className="hover:bg-blue-50/50 transition-colors duration-200" variants={itemVariants}>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{idx + 1}</td>
                                            <td className="px-4 py-4 whitespace-nowrap font-bold text-gray-800 text-sm">{data.namaBalita}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-600">{data.jenisKelamin}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-600">{data.usia}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-600">{data.tanggalPemeriksaan || "-"}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-600">{data.bb || "-"}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-600">{data.tj || "-"}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-600">{data.lk || "-"}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-gray-600">{data.ll || "-"}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                                                <span 
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                                                        data.vitaminA && data.vitaminA.includes('Merah') ? "bg-red-100 text-red-700" :
                                                        data.vitaminA && data.vitaminA.includes('Biru') ? "bg-blue-100 text-blue-700" :
                                                        "bg-gray-100 text-gray-500"
                                                    }`}
                                                >
                                                    {data.vitaminA || "-"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-center">
                                                <div className="flex justify-center items-center space-x-2">
                                                    {/* Tombol Detail (Biru Solid) - Disesuaikan */}
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
                                                    
                                                    {/* Tombol Edit (Kuning Solid) - Disesuaikan */}
                                                    <motion.button
                                                        onClick={() => { setSelectedData(data); setOpenModal(true); }}
                                                        // Style Diperbarui: Kotak solid, shadow
                                                        className="bg-yellow-400 hover:bg-yellow-500 text-white p-2 rounded-xl shadow-md"
                                                        title="Edit Data"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <FaEdit className="text-base" />
                                                    </motion.button>
                                                    {/* Tombol Hapus (Merah Solid) - Disesuaikan */}
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
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={11} className="text-center py-12 text-gray-500 font-medium bg-white">
                                            Tidak ada data rekam medis yang ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </main>

            {/* Modal Tambah/Edit (TETAP SAMA) */}
            <ModalRekamMedis
                isOpen={openModal}
                onClose={() => { setOpenModal(false); setSelectedData(null); }}
                onSave={handleSave}
                initialData={selectedData}
            />
            
            {/* Modal Detail Rekam Medis BARU (TETAP SAMA) */}
            <RekamMedisDetailModal
                isOpen={openDetailModal}
                onClose={() => { setOpenDetailModal(false); setSelectedData(null); }}
                data={selectedData}
            />
        </div>
    );
}