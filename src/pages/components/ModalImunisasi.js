// src/pages/components/ModalImunisasi.js
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import Select from "react-select";
import { db } from "../../config/firebase";
import { ref, onValue, push, update } from "firebase/database";

// --- DATA JADWAL IMUNISASI (Berdasarkan Rekomendasi IDAI) ---
// Usia dalam bulan.
const IMUNISASI_SCHEDULE = {
  hepatitisB: { label: "Saat Lahir (<24 jam)", startMonth: 0, endMonth: 0.5 },
  polio1: { label: "1 Bulan", startMonth: 1, endMonth: 1 },
  bcg: { label: "1 Bulan", startMonth: 1, endMonth: 1 },
  dptHbHib1: { label: "2 Bulan", startMonth: 2, endMonth: 2 },
  polio2: { label: "2 Bulan", startMonth: 2, endMonth: 2 },
  dptHbHib2: { label: "3 Bulan", startMonth: 3, endMonth: 3 },
  polio3: { label: "3 Bulan", startMonth: 3, endMonth: 3 },
  dptHbHib3: { label: "4 Bulan", startMonth: 4, endMonth: 4 },
  polio4: { label: "4 Bulan", startMonth: 4, endMonth: 4 },
  ipv: { label: "9 Bulan", startMonth: 9, endMonth: 9 },
  mr: { label: "9 Bulan", startMonth: 9, endMonth: 9 },
  dptHbHibLanjutan: { label: "18 Bulan", startMonth: 18, endMonth: 18 },
  mrLanjutan: { label: "18 Bulan", startMonth: 18, endMonth: 18 },
};

// --- FUNGSI BARU UNTUK KALKULASI STATUS ---
const calculateAgeInMonths = (dob) => {
  if (!dob) return 0;
  const birthDate = new Date(dob);
  const today = new Date();
  let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
  months -= birthDate.getMonth();
  months += today.getMonth();
  return months <= 0 ? 0 : months;
};

const getImunisasiStatus = (vaccineName, formData, ageInMonths) => {
  if (formData[vaccineName]?.tanggal) {
    return "DIBERIKAN";
  }
  const schedule = IMUNISASI_SCHEDULE[vaccineName];
  if (!schedule) {
    return "JADWAL TIDAK DIKETAHUI";
  }

  if (ageInMonths < schedule.startMonth) {
    return "BELUM WAKTUNYA";
  } else if (ageInMonths >= schedule.startMonth && ageInMonths <= schedule.endMonth + 1) { // Toleransi 1 bulan
    return "WAKTUNYA";
  } else {
    return "TERLAMBAT";
  }
};


export default function ModalImunisasi({ isOpen, onClose, initialData, onSaved }) {
  const [formData, setFormData] = useState({
    balitaId: "",
    namaBalita: "",
    jenisKelamin: "",
    tanggalLahir: "",
    hepatitisB: { tanggal: "", usia: "" },
    bcg: { tanggal: "", usia: "" },
    polio1: { tanggal: "", usia: "" },
    dptHbHib1: { tanggal: "", usia: "" },
    polio2: { tanggal: "", usia: "" },
    dptHbHib2: { tanggal: "", usia: "" },
    polio3: { tanggal: "", usia: "" },
    dptHbHib3: { tanggal: "", usia: "" },
    polio4: { tanggal: "", usia: "" },
    ipv: { tanggal: "", usia: "" },
    mr: { tanggal: "", usia: "" },
    dptHbHibLanjutan: { tanggal: "", usia: "" },
    mrLanjutan: { tanggal: "", usia: "" },
  });

  const [balitaOptions, setBalitaOptions] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastError, setToastError] = useState(false);

  useEffect(() => {
    const balitaRef = ref(db, "balita");
    const unsubscribe = onValue(balitaRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formatted = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setBalitaOptions(formatted);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        balitaId: initialData.balitaId || "",
      });
    } else {
      setFormData({
        balitaId: "",
        namaBalita: "",
        jenisKelamin: "",
        tanggalLahir: "",
        hepatitisB: { tanggal: "", usia: "" },
        bcg: { tanggal: "", usia: "" },
        polio1: { tanggal: "", usia: "" },
        dptHbHib1: { tanggal: "", usia: "" },
        polio2: { tanggal: "", usia: "" },
        dptHbHib2: { tanggal: "", usia: "" },
        polio3: { tanggal: "", usia: "" },
        dptHbHib3: { tanggal: "", usia: "" },
        polio4: { tanggal: "", usia: "" },
        ipv: { tanggal: "", usia: "" },
        mr: { tanggal: "", usia: "" },
        dptHbHibLanjutan: { tanggal: "", usia: "" },
        mrLanjutan: { tanggal: "", usia: "" },
      });
    }
  }, [initialData, isOpen]);

  const calculateUsia = (dob, tanggalImunisasi = null) => {
    if (!dob) return "";
    const birth = new Date(dob);
    const now = tanggalImunisasi ? new Date(tanggalImunisasi) : new Date();

    if (now < birth) return "Tanggal tidak valid";

    let years = now.getFullYear() - birth.getFullYear();
    let months = now.getMonth() - birth.getMonth();
    let days = now.getDate() - birth.getDate();

    if (days < 0) {
      months -= 1;
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    if (years > 0) return `${years} Tahun ${months} Bulan`;
    if (months > 0) return `${months} Bulan ${days} Hari`;
    return `${days} Hari`;
  };

  const handleBalitaChange = (selected) => {
    if (!selected) {
      setFormData((prev) => ({
        ...prev,
        balitaId: "",
        namaBalita: "",
        jenisKelamin: "",
        tanggalLahir: "",
      }));
      return;
    }
    const balita = balitaOptions.find((b) => b.id === selected.value);
    if (balita) {
      setFormData((prev) => ({
        ...prev,
        balitaId: balita.id,
        namaBalita: balita.nama,
        jenisKelamin: balita.jenisKelamin || "",
        tanggalLahir: balita.tanggalLahir || "",
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.balitaId) {
      setToastMessage("Nama Balita wajib diisi!");
      setToastError(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }
    const { id, ...dataToSave } = formData;
    try {
      if (initialData && initialData.id) {
        const dataRef = ref(db, `imunisasi/${initialData.id}`);
        update(dataRef, dataToSave).then(() => {
          setToastMessage("Data imunisasi berhasil diupdate!");
          setToastError(false);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
          onSaved && onSaved();
          onClose();
        });
      } else {
        const dataRef = ref(db, "imunisasi");
        push(dataRef, dataToSave).then(() => {
          setToastMessage("Data imunisasi berhasil disimpan!");
          setToastError(false);
          setShowToast(true);
          setTimeout(() => setShowToast(false), 3000);
          onSaved && onSaved();
          onClose();
        });
      }
    } catch (err) {
      console.error(err);
      setToastMessage("Terjadi kesalahan!");
      setToastError(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const imunisasiFields = [
    { name: "hepatitisB", label: "Hepatitis B" },
    { name: "polio1", label: "Polio Tetes 1" },
    { name: "bcg", label: "BCG" },
    { name: "dptHbHib1", label: "DPT-HB-Hib 1" },
    { name: "polio2", label: "Polio Tetes 2" },
    { name: "dptHbHib2", label: "DPT-HB-Hib 2" },
    { name: "polio3", label: "Polio Tetes 3" },
    { name: "dptHbHib3", label: "DPT-HB-Hib 3" },
    { name: "polio4", label: "Polio Tetes 4" },
    { name: "ipv", label: "Polio Suntik (IPV)" },
    { name: "mr", label: "Campak Rubela (MR)" },
    { name: "dptHbHibLanjutan", label: "DPT-HB-Hib Lanjutan" },
    { name: "mrLanjutan", label: "Campak Rubela Lanjutan (MR)" },
  ];

  const selectOptions = balitaOptions.map((b) => ({
    value: b.id,
    label: b.nama,
  }));

  const selectedBalita = formData.balitaId
    ? selectOptions.find((opt) => opt.value === formData.balitaId)
    : null;

  // --- LOGIKA BARU UNTUK UI ---
  const ageInMonths = calculateAgeInMonths(formData.tanggalLahir);

  const statusStyles = {
    DIBERIKAN: "bg-green-50 text-green-800",
    TERLAMBAT: "bg-red-50 text-red-800",
    WAKTUNYA: "bg-blue-50 text-blue-800",
    BELUM_WAKTUNYA: "bg-gray-50 text-gray-500",
  };
  
  const statusBadgeStyles = {
    DIBERIKAN: "bg-green-100 text-green-800",
    TERLAMBAT: "bg-red-100 text-red-800",
    WAKTUNYA: "bg-blue-100 text-blue-800",
    BELUM_WAKTUNYA: "bg-gray-100 text-gray-600",
  };

  return (
    <>
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
            {/* PERUBAHAN: max-w-7xl agar modal lebih lebar */}
            <motion.div
              className="bg-white rounded-3xl shadow-2xl w-full max-w-7xl p-6 overflow-y-auto max-h-[90vh]"
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 30 }}
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-800">
                    {initialData ? "Edit Data Imunisasi" : "Tambah Data Imunisasi"}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Pilih balita untuk melihat jadwal dan status imunisasi.
                  </p>
                </div>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Balita
                  </label>
                  <Select
                    options={selectOptions}
                    value={selectedBalita}
                    onChange={handleBalitaChange}
                    isClearable
                    placeholder="Cari dan pilih balita..."
                    isDisabled={!!initialData}
                  />
                  {initialData && (
                    <p className="text-xs text-red-500 mt-1">Nama balita tidak bisa diubah saat mengedit data imunisasi.</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jenis Kelamin
                    </label>
                    <input
                      type="text"
                      value={formData.jenisKelamin}
                      readOnly
                      className="w-full bg-gray-100 rounded-xl px-3 py-2 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Lahir
                    </label>
                    <input
                      type="date"
                      value={formData.tanggalLahir}
                      readOnly
                      className="w-full bg-gray-100 rounded-xl px-3 py-2 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-700 mb-3">Checklist Imunisasi</h3>
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-100 text-gray-700 font-semibold">
                          <th className="p-3 text-left">Pilih</th>
                          <th className="p-3 text-left">Jenis Imunisasi</th>
                          <th className="p-3 text-left">Jadwal</th>
                          <th className="p-3 text-left">Status</th>
                          <th className="p-3 text-left">Tanggal Diberikan</th>
                          <th className="p-3 text-left">Usia Saat Imunisasi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {imunisasiFields.map((field) => {
                          const status = getImunisasiStatus(field.name, formData, ageInMonths);
                          const isChecked = !!formData[field.name]?.tanggal;

                          return (
                            <tr key={field.name} className={`border-b transition-colors ${statusStyles[status]}`}>
                              <td className="p-3">
                                <input
                                  type="checkbox"
                                  className="h-5 w-5 rounded text-blue-500 focus:ring-blue-400"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    const today = new Date().toISOString().split("T")[0];
                                    setFormData((prev) => ({
                                      ...prev,
                                      [field.name]: checked
                                        ? {
                                            tanggal: today,
                                            usia: calculateUsia(prev.tanggalLahir, today),
                                          }
                                        : { tanggal: "", usia: "" },
                                    }));
                                  }}
                                  disabled={!formData.balitaId || status === "BELUM_WAKTUNYA"}
                                />
                              </td>
                              <td className="p-3 font-medium">{field.label}</td>
                              <td className="p-3">{IMUNISASI_SCHEDULE[field.name]?.label || '-'}</td>
                              <td className="p-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadgeStyles[status]}`}>
                                    {status.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="p-3">
                                <input
                                  type="date"
                                  value={formData[field.name]?.tanggal || ""}
                                  readOnly
                                  className="w-full bg-transparent p-1 cursor-not-allowed"
                                />
                              </td>
                              <td className="p-3">
                                <input
                                  type="text"
                                  value={formData[field.name]?.usia || ""}
                                  readOnly
                                  className="w-full bg-transparent p-1 cursor-not-allowed"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 rounded-xl border bg-gray-100 hover:bg-gray-200 transition font-semibold text-gray-700"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold hover:from-blue-600 hover:to-indigo-600 transition shadow-md hover:shadow-lg"
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