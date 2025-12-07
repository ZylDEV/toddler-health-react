// src/pages/components/ModalUser.js
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import { db } from "../../config/firebase";
import { ref, push, set, get } from "firebase/database";

export default function ModalUser({ isOpen, onClose, initialData }) {
  const [form, setForm] = useState({
    password: "",
    namaIbu: "",
    nikIbu: "",
    namaAyah: "",
    alamat: "",
  });

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);

  useEffect(() => {
    if (initialData) setForm(initialData);
    else
      setForm({
        password: "",
        namaIbu: "",
        nikIbu: "",
        namaAyah: "",
        alamat: "",
      });
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "nikIbu") {
      if (/^\d*$/.test(value) && value.length <= 16) {
        setForm({ ...form, [name]: value });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const triggerToast = (message, isError = false) => {
    setToastMessage(message);
    setToastError(isError);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.password) {
      triggerToast("Password wajib diisi!", true);
      return;
    }

    try {
      // Cek NIK double
      if (form.nikIbu) {
        const snapshot = await get(ref(db, "users"));
        const data = snapshot.val();
        const nikExists =
          data &&
          Object.entries(data).some(
            ([key, user]) =>
              user.nikIbu === form.nikIbu && key !== form.id
          );
        if (nikExists) {
          triggerToast("NIK sudah terdaftar!", true);
          return;
        }
      }

      // Simpan atau update data
      const action = form.id
        ? set(ref(db, `users/${form.id}`), { ...form })
        : set(push(ref(db, "users")), { ...form });

      await action;

      triggerToast(
        form.id
          ? "Data user berhasil diperbarui!"
          : "Data user berhasil ditambahkan!",
        false
      );

      onClose();

      if (!form.id) {
        setForm({
          password: "",
          namaIbu: "",
          nikIbu: "",
          namaAyah: "",
          alamat: "",
        });
      }
    } catch (err) {
      console.error(err);
      triggerToast("Gagal menyimpan data user!", true);
    }
  };

  return (
    <>
      {/* Toast */}
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

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl p-8 relative"
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
            >
              {/* Tombol X */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-2 rounded-full"
              >
                <FaTimes />
              </button>

              <div className="mb-8 text-center">
                <h2 className="text-3xl font-extrabold text-gray-800">
                  {initialData ? "Edit User" : "Tambah User"}
                </h2>
                <p className="text-gray-500 mt-1 text-sm">
                  Masukkan data user secara lengkap
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="text"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                    placeholder="Masukkan password"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Ibu
                  </label>
                  <input
                    type="text"
                    name="namaIbu"
                    value={form.namaIbu}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                    placeholder="Masukkan nama ibu"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NIK Ibu
                  </label>
                  <input
                    type="text"
                    name="nikIbu"
                    value={form.nikIbu}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                    placeholder="Masukkan NIK ibu (16 digit)"
                    maxLength={16}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Ayah
                  </label>
                  <input
                    type="text"
                    name="namaAyah"
                    value={form.namaAyah}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                    placeholder="Masukkan nama ayah"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat
                  </label>
                  <textarea
                    name="alamat"
                    value={form.alamat}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition resize-none"
                    rows="3"
                    placeholder="Masukkan alamat lengkap"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end gap-3 pt-4">
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
