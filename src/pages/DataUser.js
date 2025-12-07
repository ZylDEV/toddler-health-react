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
    FaInfoCircle, 
} from "react-icons/fa";
import { motion } from "framer-motion";
import Topbar from "./components/Topbar";
import ModalUser from "./components/ModalUser";
import UserDetailModal from "./components/UserDetailModal";

// Firebase
import { db } from "../config/firebase";
import { ref, onValue, set, push, remove } from "firebase/database";




export default function DataUser() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [selectedData, setSelectedData] = useState(null); 

    // Ambil data user dari Firebase Realtime Database
    useEffect(() => {
        const usersRef = ref(db, "users");
        const unsubscribe = onValue(usersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const usersArray = Object.keys(data).map((key) => ({
                    id: key,
                    ...data[key],
                }));
                setUsers(usersArray);
            } else {
                setUsers([]);
            }
        });

        return () => unsubscribe(); // clean up
    }, []);

    // filter hanya berdasarkan nama ibu atau nik ibu
    const filteredUsers = users.filter(
        (user) =>
            (user.namaIbu && user.namaIbu.toLowerCase().includes(search.toLowerCase())) ||
            (user.nikIbu && user.nikIbu.includes(search))
    );

    const handleDelete = (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus data user ini?")) {
            const userRef = ref(db, `users/${id}`);
            remove(userRef);
        }
    };

    const handleSave = (data) => {
        if (editingUser) {
            // Update user
            const userRef = ref(db, `users/${editingUser.id}`);
            set(userRef, data);
        } else {
            // Tambah user baru
            const usersRef = ref(db, "users");
            push(usersRef, data);
        }
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
            <Topbar pageTitle="Data User" />

            {/* Quick Access */}
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
                        className={`flex items-center gap-3 px-5 py-2 rounded-2xl shadow-md flex-shrink-0 whitespace-nowrap font-semibold text-sm cursor-pointer transition-all duration-300 ${
                            item.path === "/data-user"
                                ? "bg-blue-600 text-white border-blue-300"
                                : "bg-white text-gray-800 border border-blue-100 hover:border-blue-300"
                        }`}
                    >
                        <div
                            className={`text-lg ${
                                item.path === "/data-user" ? "text-white" : "text-blue-500"
                            }`}
                        >
                            {item.icon}
                        </div>
                        <span>{item.name}</span>
                    </motion.button>
                ))}
            </motion.div>

            {/* Main Content */}
            <main className="flex-1 mt-6 space-y-8 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-extrabold text-gray-800 hidden lg:block">
                        Kelola Data User
                    </h1>
                    <div className="flex items-center gap-4 w-full justify-between lg:w-auto lg:justify-normal">
                        {/* Search */}
                        <div className="relative flex items-center bg-white/50 backdrop-blur-md rounded-2xl shadow-inner border border-gray-200 px-4 flex-1">
                            <FaSearch className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari Nama / NIK Ibu..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-transparent px-3 py-2 text-gray-700 placeholder-gray-400 focus:outline-none"
                            />
                        </div>

                        {/* Add User */}
                        <motion.button
                            onClick={() => {
                                setEditingUser(null);
                                setIsModalOpen(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-semibold flex items-center gap-2 shadow-lg transition-all duration-300 transform hover:scale-105 flex-shrink-0"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FaUserPlus className="text-lg" />
                            <span className="hidden sm:inline">Tambah User</span>
                        </motion.button>
                    </div>
                </div>

                {/* Table */}
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
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider w-2/12">NIK Ibu</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider w-2/12">Nama Ibu</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider w-2/12">Password</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider w-2/12">Nama Ayah</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider w-2/12">Alamat</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider w-1/12">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200/50">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user, idx) => (
                                        <motion.tr
                                            key={user.id}
                                            className="hover:bg-blue-50/50 transition-colors duration-300"
                                            variants={itemVariants}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-1/12">{idx + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 w-2/12">{user.nikIbu || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 w-2/12">{user.namaIbu || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 w-2/12">{user.password || '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 w-2/12">{user.namaAyah || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs w-2/12">{user.alamat || '-'}</td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap w-1/12">
                                                <div className="flex justify-center items-center space-x-2">
                                                    
                                                    {/* Tombol Detail (BIRU SOLID) */}
                                                    <motion.button
                                                        onClick={() => {
                                                            setSelectedData(user);
                                                            setOpenDetailModal(true);
                                                        }}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl shadow-md"
                                                        title="Lihat Detail"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <FaInfoCircle className="text-base" />
                                                    </motion.button>

                                                    {/* Tombol Edit (KUNING SOLID) */}
                                                    <motion.button
                                                        onClick={() => {
                                                            setEditingUser(user);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="bg-yellow-400 hover:bg-yellow-500 text-white p-2 rounded-xl shadow-md"
                                                        title="Edit Data"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.95 }}
                                                    >
                                                        <FaEdit className="text-base" />
                                                    </motion.button>
                                                    
                                                    {/* Tombol Hapus (MERAH SOLID) */}
                                                    <motion.button
                                                        onClick={() => handleDelete(user.id)}
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
                                        <td colSpan={7} className="text-center py-12 text-gray-500 font-medium bg-white">
                                            Tidak ada data user yang ditemukan.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </main>

            {/* Modal Tambah/Edit */}
            <ModalUser
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingUser(null);
                }}
                initialData={editingUser}
                onSave={handleSave}
            />

            {/* Modal Detail Baru */}
            <UserDetailModal
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