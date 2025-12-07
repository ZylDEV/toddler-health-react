import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import Select from "react-select";
import { db } from "../../config/firebase";
import { ref, onValue, push, update } from "firebase/database";

export default function ModalBalita({ isOpen, onClose, initialData, onSaved }) {
  const [form, setForm] = useState({
    nama: "",
    jenisKelamin: "",
    tempatLahir: "",
    tanggalLahir: "",
    namaIbu: "",
    nikIbu: "",
    namaAyah: "",
    alamat: "",
  });
  const [users, setUsers] = useState([]);

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);

  // Load users dari Firebase
  useEffect(() => {
    const usersRef = ref(db, "users");
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUsers(Object.values(data));
      }
    });
  }, []);

  // Set form saat edit
  useEffect(() => {
    if (initialData) setForm(initialData);
    else
      setForm({
        nama: "",
        jenisKelamin: "",
        tempatLahir: "",
        tanggalLahir: "",
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

  const handleSubmit = () => {
    if (!form.nama || !form.jenisKelamin || !form.tanggalLahir) {
      setToastMessage("Nama, Jenis Kelamin, dan Tanggal Lahir wajib diisi!");
      setToastError(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    if (initialData && initialData.id) {
      const balitaRef = ref(db, `balita/${initialData.id}`);
      update(balitaRef, form)
        .then(() => {
          setToastMessage("Data balita berhasil diupdate!");
          setToastError(false);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
          onSaved && onSaved();
          onClose();
        })
        .catch((err) => {
          console.error(err);
          setToastMessage("Gagal mengupdate data!");
          setToastError(true);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        });
    } else {
      push(ref(db, "balita"), form)
        .then(() => {
          setToastMessage("Data balita berhasil ditambahkan!");
          setToastError(false);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
          onSaved && onSaved();
          onClose();
          setForm({
            nama: "",
            jenisKelamin: "",
            tempatLahir: "",
            tanggalLahir: "",
            namaIbu: "",
            nikIbu: "",
            namaAyah: "",
            alamat: "",
          });
        })
        .catch((err) => {
          console.error(err);
          setToastMessage("Gagal menyimpan data!");
          setToastError(true);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
        });
    }
  };

  // Options untuk react-select (nama ibu & nik ibu)
  const namaIbuOptions = [
    ...new Set(users.map((u) => u.namaIbu).filter(Boolean))
  ].map((nama) => ({ value: nama, label: nama }));

  const nikIbuOptions = [
    ...new Set(users.map((u) => u.nikIbu).filter(Boolean))
  ].map((nik) => ({ value: nik, label: nik }));

  // ketika user pilih namaIbu atau nikIbu, autofill
  const handleIbuSelect = (selected, field) => {
    if (!selected) {
      setForm({ ...form, namaIbu: "", nikIbu: "", namaAyah: "", alamat: "" });
      return;
    }

    let selectedUser;
    if (field === "namaIbu") {
      selectedUser = users.find((u) => u.namaIbu === selected.value);
    } else if (field === "nikIbu") {
      selectedUser = users.find((u) => u.nikIbu === selected.value);
    }

    if (selectedUser) {
      setForm({
        ...form,
        namaIbu: selectedUser.namaIbu,
        nikIbu: selectedUser.nikIbu,
        namaAyah: selectedUser.namaAyah || "",
        alamat: selectedUser.alamat || "",
      });
    }
  };

  return (
    <>
      {/* Toast */}
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

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl p-6 relative overflow-y-auto max-h-[90vh]"
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
                  {initialData ? "Edit Balita" : "Tambah Balita"}
                </h2>
                <p className="text-gray-500 mt-1 text-sm">
                  Masukkan data balita secara lengkap
                </p>
              </div>

              <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nama Balita */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Balita</label>
                  <input
                    type="text"
                    name="nama"
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                    placeholder="Masukkan nama balita"
                    required
                  />
                </div>

                {/* Jenis Kelamin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                  <select
                    name="jenisKelamin"
                    value={form.jenisKelamin}
                    onChange={(e) => setForm({ ...form, jenisKelamin: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                    required
                  >
                    <option value="">Pilih jenis kelamin</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                </div>

                {/* Tempat Lahir */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    name="tempatLahir"
                    value={form.tempatLahir}
                    onChange={(e) => setForm({ ...form, tempatLahir: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                    placeholder="Masukkan tempat lahir"
                  />
                </div>

                {/* Tanggal Lahir */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    name="tanggalLahir"
                    value={form.tanggalLahir}
                    onChange={(e) => setForm({ ...form, tanggalLahir: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                  />
                </div>

                {/* Nama Ibu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Ibu</label>
                  <Select
                    options={namaIbuOptions}
                    value={form.namaIbu ? { value: form.namaIbu, label: form.namaIbu } : null}
                    onChange={(selected) => handleIbuSelect(selected, "namaIbu")}
                    placeholder="Pilih atau cari nama ibu..."
                    isClearable
                  />
                </div>

                {/* NIK Ibu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NIK Ibu</label>
                  <Select
                    options={nikIbuOptions}
                    value={form.nikIbu ? { value: form.nikIbu, label: form.nikIbu } : null}
                    onChange={(selected) => handleIbuSelect(selected, "nikIbu")}
                    placeholder="Pilih atau cari NIK ibu..."
                    isClearable
                  />
                </div>

                {/* Nama Ayah */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Ayah</label>
                  <input
                    type="text"
                    name="namaAyah"
                    readOnly
                    value={form.namaAyah}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                    placeholder="Nama ayah otomatis jika nama ibu dipilih"
                  />
                </div>

                {/* Alamat */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                  <textarea
                    name="alamat"
                    value={form.alamat}
                    readOnly
                    onChange={handleChange}
                    rows="3"
                    className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                    placeholder="Alamat otomatis jika nama ibu dipilih"
                  />
                </div>
              </form>

              {/* Tombol */}
              <div className="flex justify-end gap-3 pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl border bg-gray-100 hover:bg-gray-200 transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold hover:from-blue-600 hover:to-indigo-600 transition"
                >
                  Simpan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
