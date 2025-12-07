import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../config/firebase";
import { ref, get } from "firebase/database";
import { motion } from "framer-motion";
import logo from "../assets/logo.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const adminRef = ref(db, "admins");
      const snapshot = await get(adminRef);

      if (snapshot.exists()) {
        const admins = snapshot.val();
        let loggedIn = false;

        Object.keys(admins).forEach((key) => {
          if (
            admins[key].username === username &&
            admins[key].password === password
          ) {
            loggedIn = true;
          }
        });

        if (loggedIn) {
          localStorage.setItem("admins", JSON.stringify({ username }));
          navigate("/dashboard");
        } else {
          setErrorMsg("Username atau password salah!");
        }
      } else {
        setErrorMsg("Tidak ada data admin ditemukan.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Terjadi kesalahan, coba lagi.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden">
      {/* LEFT SIDE */}
      <motion.div
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 60, damping: 20 }}
        className="md:w-1/2 w-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex flex-col justify-center items-center p-8 relative"
      >
        {/* Glow Card Behind Logo */}
        <div className="relative flex items-center justify-center mb-10">
          <div className="absolute w-72 h-72 md:w-96 md:h-96 bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl"></div>
          <img
            src={logo}
            alt="Logo Posyandu"
            className="relative w-64 md:w-80 lg:w-96 object-contain drop-shadow-2xl"
          />
        </div>

        <h1 className="text-white text-5xl font-extrabold text-center drop-shadow-lg">
          Welcome Back!
        </h1>
        <p className="mt-4 text-white/80 text-lg text-center max-w-md">
          Login to access the Admin Dashboard. Keep your credentials safe and
          secure.
        </p>
      </motion.div>

      {/* RIGHT SIDE */}
      <motion.div
        initial={{ x: 200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 60, damping: 20 }}
        className="md:w-1/2 w-full flex items-center justify-center bg-gray-100 p-6"
      >
        <div className="w-full max-w-md p-10 bg-white rounded-3xl shadow-xl border border-gray-200">
          <h2 className="text-3xl font-extrabold mb-8 text-gray-800 text-center">
            Admin Login
          </h2>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-gray-700 font-medium"
                required
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-gray-700 font-medium"
                required
              />
            </div>

            {errorMsg && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm font-medium text-center"
              >
                {errorMsg}
              </motion.p>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Login
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
