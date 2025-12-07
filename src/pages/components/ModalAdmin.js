// src/pages/components/ModalAdmin.js
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import { db } from "../../config/firebase";
import { ref, push, update } from "firebase/database";

export default function ModalAdmin({ isOpen, onClose, onSave, initialData }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);

  useEffect(() => {
    if (initialData) {
      setUsername(initialData.username || "");
      setPassword(initialData.password || "");
    } else {
      setUsername("");
      setPassword("");
    }
  }, [initialData, isOpen]);

  const showToastMsg = (message, isError = false) => {
    setToastMessage(message);
    setToastError(isError);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      showToastMsg("Username dan Password wajib diisi!", true);
      return;
    }

    if (initialData && initialData.id) {
      // Edit admin
      const adminRef = ref(db, `admins/${initialData.id}`);
      update(adminRef, { username, password })
        .then(() => {
          showToastMsg("Admin berhasil diupdate!");
          onSave({ ...initialData, username, password });
          onClose();
        })
        .catch((err) => showToastMsg(err.message, true));
    } else {
      // Tambah admin baru
      const adminsRef = ref(db, "admins");
      push(adminsRef, { username, password })
        .then((res) => {
          showToastMsg("Admin berhasil ditambahkan!");
          onSave({ id: res.key, username, password });
          onClose();
        })
        .catch((err) => showToastMsg(err.message, true));
    }
  };

  return (
    <>
      {/* Toast di atas modal */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            className={`fixed top-5 right-5 px-6 py-3 rounded-xl shadow-lg z-[100] ${
              toastError
                ? "bg-red-500 text-white"
                : "bg-gradient-to-r from-blue-400 to-indigo-500 text-white"
            }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 relative"
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 30 }}
            >
              {/* Tombol X */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-2 rounded-full"
              >
                <FaTimes />
              </button>

              <div className="mb-6 text-center">
                <h2 className="text-2xl font-extrabold text-gray-800">
                  {initialData ? "Edit Admin" : "Tambah Admin"}
                </h2>
                <p className="text-gray-500 mt-1 text-sm">
                  Masukkan username dan password untuk admin
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                    placeholder="Masukkan username"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                    placeholder="Masukkan password"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2 rounded-xl border bg-gray-100 hover:bg-gray-200 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold hover:from-blue-600 hover:to-indigo-600 transition"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
