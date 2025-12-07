// src/pages/components/ModalJadwal.js
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import { db } from "../../config/firebase";
import { ref, push, update } from "firebase/database";

export default function ModalJadwal({ isOpen, onClose, initialData, onSaved }) {
  const [formData, setFormData] = useState({
    tanggalPelaksanaan: "",
    jamMulai: "",
    jamSelesai: "",
    lokasi: "",
    deskripsiKegiatan: "",
    id: null, // Tambahkan id agar edit bisa
  });

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);

  // Isi form otomatis saat edit
  useEffect(() => {
    if (initialData) {
      let jamMulai = "", jamSelesai = "";
      if (initialData.waktuPelaksanaan) {
        const parts = initialData.waktuPelaksanaan.split(" - ");
        jamMulai = parts[0] || "";
        jamSelesai = parts[1] || "";
      }
      setFormData({ 
        tanggalPelaksanaan: initialData.tanggalPelaksanaan || "",
        jamMulai,
        jamSelesai,
        lokasi: initialData.lokasi || "",
        deskripsiKegiatan: initialData.deskripsiKegiatan || "",
        id: initialData.id || null,
      });
    } else {
      setFormData({
        tanggalPelaksanaan: "",
        jamMulai: "",
        jamSelesai: "",
        lokasi: "",
        deskripsiKegiatan: "",
        id: null,
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const showToastMessage = (message, isError = false) => {
    setToastMessage(message);
    setToastError(isError);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.tanggalPelaksanaan || !formData.jamMulai || !formData.jamSelesai) {
      showToastMessage("Tanggal, jam mulai, dan jam selesai wajib diisi!", true);
      return;
    }

    const waktuPelaksanaan = `${formData.jamMulai} - ${formData.jamSelesai}`;
    const dataToSave = { 
      tanggalPelaksanaan: formData.tanggalPelaksanaan,
      waktuPelaksanaan,
      lokasi: formData.lokasi,
      deskripsiKegiatan: formData.deskripsiKegiatan,
    };

    try {
      if (formData.id) {
        // Edit jadwal
        const dataRef = ref(db, `jadwal/${formData.id}`);
        update(dataRef, dataToSave)
          .then(() => {
            showToastMessage("Jadwal berhasil diupdate!", false);
            onSaved && onSaved(); // update parent
            onClose();
          })
          .catch(() => showToastMessage("Gagal mengupdate jadwal!", true));
      } else {
        // Tambah jadwal baru
        const dataRef = ref(db, "jadwal");
        push(dataRef, dataToSave)
          .then(() => {
            showToastMessage("Jadwal berhasil disimpan!", false);
            onSaved && onSaved();
            onClose();
          })
          .catch(() => showToastMessage("Gagal menyimpan jadwal!", true));
      }
    } catch (err) {
      console.error(err);
      showToastMessage("Terjadi kesalahan!", true);
    }
  };

  return (
    <>
      {/* Toast */}
      {showToast && (
        <motion.div
          className={`fixed top-5 right-5 px-6 py-3 rounded-xl shadow-lg z-50 ${
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

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6"
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 30 }}
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-800">
                    {formData.id ? "Edit Jadwal" : "Tambah Jadwal"}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Masukkan informasi lengkap kegiatan
                  </p>
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col">
                  <label className="font-semibold">Tanggal Pelaksanaan</label>
                  <input
                    type="date"
                    name="tanggalPelaksanaan"
                    value={formData.tanggalPelaksanaan}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                    required
                  />
                </div>

                <div className="flex flex-col md:flex-row md:gap-4">
                  <div className="flex flex-col flex-1">
                    <label className="font-semibold">Jam Mulai</label>
                    <input
                      type="time"
                      name="jamMulai"
                      value={formData.jamMulai}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                      required
                    />
                  </div>
                  <div className="flex flex-col flex-1">
                    <label className="font-semibold">Jam Selesai</label>
                    <input
                      type="time"
                      name="jamSelesai"
                      value={formData.jamSelesai}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold">Lokasi</label>
                  <input
                    type="text"
                    name="lokasi"
                    value={formData.lokasi}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                    required
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold">Deskripsi Kegiatan</label>
                  <textarea
                    name="deskripsiKegiatan"
                    value={formData.deskripsiKegiatan}
                    onChange={handleChange}
                    rows={3}
                    className="border border-gray-300 rounded-xl px-3 py-2 w-full focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 rounded-xl border bg-gray-100 hover:bg-gray-200 font-semibold transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold hover:from-blue-600 hover:to-indigo-600 transition"
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
