// src/pages/components/Topbar.js
import React from "react";
import toast, { Toaster } from "react-hot-toast";
import logo from "../../assets/logo.png";

export default function Topbar({ pageTitle }) {
  let admin = null;
  try {
    admin = JSON.parse(localStorage.getItem("admins"));
  } catch (e) {
    admin = null;
  }

  // Copy username ke clipboard + toast
  const handleCopyUsername = async () => {
    if (admin?.username) {
      try {
        await navigator.clipboard.writeText(admin.username);
        toast.success("Username disalin!", {
          duration: 2000,
          position: "top-right",
          style: {
            background: "#4ade80",
            color: "#fff",
            borderRadius: "12px",
            padding: "10px 16px",
            fontSize: "14px",
          },
        });
      } catch (err) {
        toast.error("Gagal menyalin!");
        console.error("Copy gagal", err);
      }
    }
  };

  return (
    <>
      <header className="h-16 bg-white/80 backdrop-blur-md shadow-md flex items-center justify-between px-6 rounded-2xl m-4 relative">
        {/* Kiri: logo + judul */}
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="Logo Posyandu"
            className="w-16 h-16 object-contain cursor-pointer"
          />
          <h1 className="text-xl font-bold text-gray-800">
            Posyandu
          </h1>
        </div>

        {/* Kanan: Judul halaman + area akun */}
        <div className="flex items-center gap-6">
          <h2 className="text-lg font-semibold text-gray-700">{pageTitle}</h2>

          {admin && (
            <button
              onClick={handleCopyUsername}
              className="flex items-center gap-3 bg-blue-50 px-3 py-1 rounded-full shadow-sm focus:outline-none hover:bg-blue-100 transition"
              title="Klik untuk menyalin username"
            >
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                {admin.username ? admin.username[0].toUpperCase() : "A"}
              </div>
              <div className="text-sm leading-tight text-left">
                <p className="font-semibold text-gray-800">{admin.username}</p>
              </div>
            </button>
          )}
        </div>
      </header>

      {/* Toast Container */}
      <Toaster />
    </>
  );
}
