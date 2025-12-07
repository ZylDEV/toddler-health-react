// src/pages/components/ModalRekamMedis.js
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import Select from "react-select";
import { db } from "../../config/firebase";
import { ref, onValue, push, update } from "firebase/database";

export default function ModalRekamMedis({ isOpen, onClose, initialData }) {
  const [formData, setFormData] = useState({
    balitaId: "",
    namaBalita: "",
    usia: "",
    jenisKelamin: "",
    tanggalPemeriksaan: new Date().toISOString().split("T")[0], // default hari ini
    bb: "",
    tj: "",
    lk: "",
    ll: "",
    vitaminA: "",
  });

  const [balitaData, setBalitaData] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);

  // Load data balita dari Firebase
  useEffect(() => {
    const balitaRef = ref(db, "balita");
    const unsubscribe = onValue(balitaRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arr = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));
        setBalitaData(arr);
      }
    });
    return () => unsubscribe(); // Cleanup function
  }, []);

  // Reset atau set form saat buka modal
  useEffect(() => {
    if (isOpen) { // Hanya jalankan saat modal terbuka
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData({
          balitaId: "",
          namaBalita: "",
          usia: "",
          jenisKelamin: "",
          tanggalPemeriksaan: new Date().toISOString().split("T")[0],
          bb: "",
          tj: "",
          lk: "",
          ll: "",
          vitaminA: "",
        });
      }
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Hitung usia dari tanggal lahir
  const getUsia = (tglLahir) => {
    if (!tglLahir) return "";
    const birthDate = new Date(tglLahir);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    return `${years} th ${months} bln`;
  };

  const balitaOptions = (balitaData || []).map((b) => ({
    value: b.id,
    label: b.nama,
    data: b, // Menyimpan data balita lengkap di sini
  }));

  const vitaminOptions = [
    { value: "Kapsul Biru 100.000 IU", label: "Vit A Kapsul Biru 100.000 IU" },
    { value: "Kapsul Merah 200.000 IU", label: "Vit A Kapsul Merah 200.000 IU" },
    { value: "Belum Waktunya", label: "Belum Waktunya" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.balitaId) {
        setToastMessage("Pilih Nama Balita terlebih dahulu.");
        setToastError(true);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return; // Hentikan proses submit
    }

    try {
      const rekamRef = ref(db, "rekamMedis");

      // Salin formData dan hapus kunci-kunci yang tidak ingin Anda simpan 
      // (meskipun di sini semua field di form memang ingin disimpan)
      const dataToSave = { ...formData };

      if (initialData?.id) {
        const updateRef = ref(db, `rekamMedis/${initialData.id}`);
        await update(updateRef, dataToSave);
        setToastMessage("Data rekam medis berhasil diperbarui!");
      } else {
        await push(rekamRef, dataToSave);
        setToastMessage("Data rekam medis berhasil disimpan!");
      }

      setToastError(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      onClose();
    } catch (err) {
      console.error(err);
      setToastMessage("Gagal menyimpan data!");
      setToastError(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl p-6 relative overflow-y-auto max-h-[90vh]"
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 30 }}
            >
              {/* Tombol close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              >
                <FaTimes />
              </button>

              {/* Header */}
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-extrabold text-gray-800">
                  {initialData ? "Edit Rekam Medis" : "Tambah Rekam Medis"}
                </h2>
                <p className="text-gray-500 mt-1 text-sm">
                  Masukkan data rekam medis balita secara lengkap
                </p>
              </div>

              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                {/* Nama Balita */}
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Balita
                  </label>
                  <Select
                    options={balitaOptions}
                    // Menentukan nilai awal Select dari formData
                    value={
                      formData.balitaId && formData.namaBalita
                        ? {
                            label: formData.namaBalita,
                            value: formData.balitaId,
                            data: balitaData.find(b => b.id === formData.balitaId), // Mencari data balita lengkap untuk edit mode
                          }
                        : null
                    }
                    onChange={(selected) => {
                      if (selected?.data) {
                        const b = selected.data;
                        setFormData({
                          ...formData,
                          balitaId: b.id, // ✅ balitaId tersimpan otomatis
                          namaBalita: b.nama,
                          usia: getUsia(b.tanggalLahir),
                          jenisKelamin: b.jenisKelamin || "",
                        });
                      } else {
                        // Reset jika pilihan dikosongkan
                        setFormData({
                          ...formData,
                          balitaId: "",
                          namaBalita: "",
                          usia: "",
                          jenisKelamin: "",
                        });
                      }
                    }}
                    placeholder="Pilih nama balita..."
                    isClearable
                    // Pastikan Select dinonaktifkan saat edit agar ID tidak berubah
                    isDisabled={!!initialData}
                  />
                  {initialData && (
                    <p className="text-xs text-red-500 mt-1">Nama balita tidak bisa diubah saat mengedit rekam medis.</p>
                  )}
                </div>

                {/* Jenis Kelamin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jenis Kelamin
                  </label>
                  <input
                    type="text"
                    name="jenisKelamin"
                    value={formData.jenisKelamin}
                    readOnly
                    className="p-3 border border-gray-300 rounded-xl bg-gray-100 w-full"
                  />
                </div>

                {/* Usia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usia
                  </label>
                  <input
                    type="text"
                    name="usia"
                    value={formData.usia}
                    readOnly
                    className="p-3 border border-gray-300 rounded-xl bg-gray-100 w-full"
                  />
                </div>

                {/* Tanggal Pemeriksaan */}
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Pemeriksaan
                  </label>
                  <input
                    type="date"
                    name="tanggalPemeriksaan"
                    value={formData.tanggalPemeriksaan}
                    onChange={handleChange}
                    className="p-3 border border-gray-300 rounded-xl w-full"
                  />
                </div>

                {/* Input manual */}
                {[
                  {
                    name: "bb",
                    label: "Berat Badan (kg)",
                    placeholder: "Masukkan berat badan",
                  },
                  {
                    name: "tj",
                    label: "Tinggi/Panjang Badan (cm)",
                    placeholder: "Masukkan tinggi/panjang",
                  },
                  {
                    name: "lk",
                    label: "Lingkar Kepala (cm)",
                    placeholder: "Masukkan lingkar kepala",
                  },
                  {
                    name: "ll",
                    label: "Lingkar Lengan (cm)",
                    placeholder: "Masukkan lingkar lengan",
                  },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {f.label}
                    </label>
                    <input
                      type="number"
                      name={f.name}
                      value={formData[f.name]}
                      onChange={handleChange}
                      placeholder={f.placeholder}
                      className="p-3 border border-gray-300 rounded-xl w-full"
                      step="0.01" // Tambahkan step untuk angka desimal
                    />
                  </div>
                ))}

                {/* Vitamin A */}
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vitamin A
                  </label>
                  <select
                    name="vitaminA"
                    value={formData.vitaminA}
                    onChange={handleChange}
                    className="p-3 border border-gray-300 rounded-xl w-full"
                  >
                    <option value="">Pilih Vitamin A...</option>
                    {vitaminOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tombol */}
                <div className="flex justify-end gap-3 mt-4 md:col-span-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2 rounded-xl border bg-gray-100 hover:bg-gray-200"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold hover:from-blue-600 hover:to-indigo-600"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-5 right-5 px-6 py-3 rounded-xl shadow-lg z-50 ${
              toastError
                ? "bg-red-500 text-white"
                : "bg-gradient-to-r from-blue-400 to-indigo-500 text-white"
            }`}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}