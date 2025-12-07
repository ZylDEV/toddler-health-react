// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Topbar from "./components/Topbar";
import {
  FaTachometerAlt,
  FaUser,
  FaUsers,
  FaBaby,
  FaFileMedical,
  FaSyringe,
  FaCalendarAlt,
  FaChartLine,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import { getDatabase, ref, onValue } from "firebase/database";

// Tooltip custom
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200 backdrop-blur-md">
        <p className="font-semibold text-gray-700 text-sm mb-1">{`Bulan: ${label}`}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} className="text-sm flex items-center gap-2">
            <span style={{ color: entry.color }} className="inline-block w-3 h-3 rounded-full"></span>
            {`${entry.name}: `}
            <span className="font-bold">{entry.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  const [stats, setStats] = useState([]);
  const [lineChartData, setLineChartData] = useState([]);

  useEffect(() => {
    const db = getDatabase();
    const dbRef = ref(db, "/"); // ambil seluruh root database

    onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;

      const { admins, users, balita, rekamMedis, imunisasi, jadwal } = data;

      // Statistik card otomatis
      setStats([
        { title: "Total Admin", value: admins ? Object.keys(admins).length : 0, icon: <FaUser />, color: "text-red-500" },
        { title: "Total User", value: users ? Object.keys(users).length : 0, icon: <FaUsers />, color: "text-emerald-500" },
        { title: "Total Balita", value: balita ? Object.keys(balita).length : 0, icon: <FaBaby />, color: "text-amber-500" },
        { title: "Rekam Medis", value: rekamMedis ? Object.keys(rekamMedis).length : 0, icon: <FaFileMedical />, color: "text-purple-500" },
        { title: "Imunisasi", value: imunisasi ? Object.keys(imunisasi).length : 0, icon: <FaSyringe />, color: "text-pink-500" },
        { title: "Jadwal Posyandu", value: jadwal ? Object.keys(jadwal).length : 0, icon: <FaCalendarAlt />, color: "text-teal-500" },
      ]);

      // Line chart: pertumbuhan Balita & User per bulan
      const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const lineData = [];
      for (let i = 0; i < 12; i++) {
        const month = i + 1;
        const balitaCount = balita ? Object.values(balita).filter(b => new Date(b.tanggalLahir).getMonth() + 1 === month).length : 0;
        const userCount = users ? Object.values(users).length : 0; // Bisa ditambah per-bulan kalau ada createdAt
        lineData.push({ name: monthNames[i], "Total User": userCount, "Total Balita": balitaCount });
      }
      setLineChartData(lineData);

    });
  }, []);

  const quickAccessItems = [
    { name: "Dashboard", icon: <FaTachometerAlt />, path: "/dashboard" },
    { name: "Data Admin", icon: <FaUser />, path: "/data-admin" },
    { name: "Data User", icon: <FaUsers />, path: "/data-user" },
    { name: "Data Balita", icon: <FaBaby />, path: "/data-balita" },
    { name: "Rekam Medis", icon: <FaFileMedical />, path: "/rekam-medis" },
    { name: "Data Imunisasi", icon: <FaSyringe />, path: "/imunisasi" },
    { name: "Jadwal Posyandu", icon: <FaCalendarAlt />, path: "/jadwal" },
  ];

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delayChildren: 0.1, staggerChildren: 0.08 } } };
  const itemVariants = { hidden: { y: 15, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 font-sans overflow-hidden">
      <Topbar pageTitle="Dashboard" />

      {/* Quick Access */}
      <motion.div className="flex gap-4 overflow-x-auto py-4 -mx-6 px-6 scrollbar-hide"
        variants={containerVariants} initial="hidden" animate="visible"
      >
        {quickAccessItems.map((item, index) => (
          <motion.button
            key={index}
            variants={itemVariants}
            whileHover={{ scale: 1.03, boxShadow: "0 6px 15px -3px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(item.path)}
            className={`flex items-center gap-3 px-5 py-2 rounded-2xl shadow-md border transition-all duration-300 flex-shrink-0 whitespace-nowrap font-semibold text-sm cursor-pointer ${location.pathname === item.path ? "bg-blue-600 text-white border-blue-300" : "bg-white text-gray-800 border-blue-100 hover:border-blue-300"}`}
          >
            <div className={`text-lg ${location.pathname === item.path ? "text-white" : "text-blue-500"}`}>{item.icon}</div>
            <span>{item.name}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Main Content */}
      <main className="flex-1 mt-6 space-y-8 overflow-y-auto pr-2">
        {/* Statistic Cards */}
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={containerVariants} initial="hidden" animate="visible"
        >
          {stats.map((item, idx) => (
            <motion.div key={idx} variants={itemVariants} whileHover={{ y: -4, boxShadow: "0 10px 20px -5px rgba(0,0,0,0.1)" }}
              className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-4 transition-all duration-300 transform"
            >
              <div className={`${item.color} text-3xl p-3 rounded-xl bg-blue-50 shadow-inner`}>{item.icon}</div>
              <div>
                <h3 className="text-gray-500 font-medium text-xs uppercase tracking-wide">{item.title}</h3>
                <p className="text-3xl font-bold text-gray-800">{item.value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-8">
        {/* Line Chart */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4, boxShadow: "0 10px 20px -5px rgba(0,0,0,0.1)" }}
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 w-full"
          >
            <h3 className="font-bold text-gray-700 text-lg mb-5 flex items-center gap-3">
              <FaChartLine className="text-blue-500" /> Pertumbuhan Balita & User
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineChartData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
                <XAxis dataKey="name" stroke="#607d8b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#607d8b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ paddingTop: '15px' }} iconType="circle" />
                <Line
                  type="monotone"
                  dataKey="Total User"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6, strokeWidth: 2, fill: '#3b82f6', stroke: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="Total Balita"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6, strokeWidth: 2, fill: '#f97316', stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
