// src/pages/DataAdmin.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaSearch,
    FaEdit,
    FaTrashAlt,
    FaUserPlus,
    FaTachometerAlt,
    FaUser,
    FaUsers,
    FaBaby,
    FaFileMedical,
    FaSyringe,
    FaCalendarAlt,
    FaInfoCircle, // Import untuk tombol Detail
} from "react-icons/fa";
import { motion } from "framer-motion"; 
// Hapus 'AnimatePresence' dari sini karena sudah ada di ModalAdmin dan AdminDetailModal
import Topbar from "./components/Topbar";
import ModalAdmin from "./components/ModalAdmin";
// --- IMPORT MODAL YANG BARU DIPISAHKAN ---
import AdminDetailModal from "./components/AdminDetailModal"; 

// Firebase
import { db } from "../config/firebase";
import { ref, onValue, push, set, remove } from "firebase/database";

// --- MOCK COMPONENT AdminDetailModal DIHAPUS DARI SINI ---

export default function DataAdmin() {
    const navigate = useNavigate();

    const [admins, setAdmins] = useState([]);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState(null);
    // State baru untuk modal Detail
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [selectedData, setSelectedData] = useState(null);

    // Load data admin dari Firebase
    useEffect(() => {
        const adminRef = ref(db, "admins");
        const unsubscribe = onValue(adminRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const adminArray = Object.keys(data).map((key) => ({
                    id: key,
                    ...data[key],
                }));
                setAdmins(adminArray);
            } else {
                setAdmins([]);
            }
        });

        return () => unsubscribe(); // Cleanup function
    }, []);

    const filteredAdmins = admins.filter((admin) =>
        admin.username.toLowerCase().includes(search.toLowerCase())
    );

    const handleAdd = () => {
        setEditData(null);
        setIsModalOpen(true);
    };

    const handleEdit = (admin) => {
        setEditData(admin);
        setIsModalOpen(true);
    };

    // FUNGSI INI SUDAH BENAR
    const handleDetail = (admin) => {
        setSelectedData(admin);
        setOpenDetailModal(true);
    };

    const handleSave = (data) => {
        if (data.id) {
            // Update existing admin
            const adminRef = ref(db, `admins/${data.id}`);
            // Pastikan Anda hanya menyimpan field yang relevan ke Firebase
            set(adminRef, { username: data.username, password: data.password }); 
        } else {
            // Add new admin
            const adminRef = ref(db, "admins");
            const newAdminRef = push(adminRef);
            // Pastikan Anda hanya menyimpan field yang relevan ke Firebase
            set(newAdminRef, { username: data.username, password: data.password });
        }
    };

    const handleDelete = (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus data admin ini?")) {
            const adminRef = ref(db, `admins/${id}`);
            remove(adminRef);
        }
    };

    // Quick access menu
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
            <Topbar pageTitle="Data Admin" />

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
                        whileHover={{
                            scale: 1.03,
                            boxShadow: "0 6px 15px -3px rgba(0,0,0,0.1)",
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(item.path)}
                        className={`flex items-center gap-3 px-5 py-2 rounded-2xl shadow-md transition-all duration-300 flex-shrink-0 whitespace-nowrap font-semibold text-sm cursor-pointer ${
                            item.path === "/data-admin"
                                ? "bg-blue-600 text-white border-blue-300"
                                : "bg-white text-gray-800 border border-blue-100 hover:border-blue-300"
                        }`}
                    >
                        <div className={`text-lg ${item.path === "/data-admin" ? "text-white" : "text-blue-500"}`}>
                            {item.icon}
                        </div>
                        <span>{item.name}</span>
                    </motion.button>
                ))}
            </motion.div>

            {/* Main Content */}
            <main className="flex-1 mt-6 space-y-8 overflow-hidden flex flex-col">
                {/* Header & Controls */}
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-extrabold text-gray-800 hidden lg:block">
                        Kelola Data Admin
                    </h1>
                    <div className="flex items-center gap-4 w-full justify-between lg:w-auto lg:justify-normal">
                        {/* Search */}
                        <div className="relative flex items-center bg-white/50 backdrop-blur-md rounded-2xl shadow-inner border border-gray-200 px-4 flex-1">
                            <FaSearch className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari username..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-transparent px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none"
                            />
                        </div>

                        {/* Add Button */}
                        <motion.button
                            onClick={handleAdd}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-semibold flex items-center gap-2 shadow-lg transition-all duration-300 transform hover:scale-105 flex-shrink-0"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaUserPlus className="text-lg" />
                            <span className="hidden sm:inline">Tambah Admin</span>
                        </motion.button>
                    </div>
                </div>

                {/* Table Card */}
                <motion.div
                    className="bg-white/50 backdrop-blur-md rounded-3xl shadow-xl border border-gray-200 flex-1 flex flex-col overflow-hidden"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="overflow-auto flex-1">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-blue-600 text-white sticky top-0 z-10 shadow-lg">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider w-1/12">No</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider w-4/12">Username</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider w-4/12">Password</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider w-3/12">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200/50">
                                {filteredAdmins.length > 0 ? (
                                    filteredAdmins.map((admin, idx) => (
                                        <motion.tr
                                            key={admin.id}
                                            className="hover:bg-blue-50/50 transition-colors duration-300"
                                            variants={itemVariants}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-1/12">{idx + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 w-4/12">{admin.username}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 w-4/12">{admin.password}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center w-3/12">
                                                <div className="flex justify-center items-center space-x-2">
                                                    
                                                    {/* Tombol Detail (BIRU SOLID) */}
                                                    <motion.button
                                                        onClick={() => handleDetail(admin)}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl shadow-md transition-all duration-300"
                                                        title="Lihat Detail"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <FaInfoCircle className="text-base" />
                                                    </motion.button>
                                                    
                                                    {/* Tombol Edit (KUNING SOLID) */}
                                                    <motion.button
                                                        onClick={() => handleEdit(admin)}
                                                        className="bg-yellow-400 hover:bg-yellow-500 text-white p-2 rounded-xl shadow-md transition-all duration-300"
                                                        title="Edit Data"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <FaEdit className="text-base" />
                                                    </motion.button>
                                                    
                                                    {/* Tombol Hapus (MERAH SOLID) */}
                                                    <motion.button
                                                        onClick={() => handleDelete(admin.id)}
                                                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-xl shadow-md transition-all duration-300"
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
                                        <td colSpan={4} className="text-center py-12 text-gray-500 font-medium bg-white">
                                            Tidak ada data admin yang ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </main>

            {/* Modal Tambah/Edit */}
            <ModalAdmin
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditData(null);
                }}
                onSave={handleSave}
                initialData={editData}
            />
            
            {/* Modal Detail */}
            <AdminDetailModal
                isOpen={openDetailModal}
                onClose={() => {
                    setOpenDetailModal(false);
                    setSelectedData(null);
                }}
                data={selectedData}
            />
        </div>
    );
}