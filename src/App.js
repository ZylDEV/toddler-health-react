import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import DataAdmin from "./pages/DataAdmin"; 
import DataUser from "./pages/DataUser"; 
import DataBalita from "./pages/DataBalita";
import RekamMedis from "./pages/RekamMedis";
import DataImunisasi from "./pages/DataImunisasi";
import JadwalPosyandu from "./pages/JadwalPosyandu";
import { FaSignOutAlt } from "react-icons/fa";

// Tombol logout
function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("admins"); // hapus session
    navigate("/"); // redirect ke login
  };

  return (
    <button
      onClick={handleLogout}
      className="fixed bottom-6 right-6 bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center z-50 transition-all duration-300 hover:scale-105"
      title="Logout"
    >
      <FaSignOutAlt className="text-xl" />
    </button>
  );
}

// Proteksi route
function ProtectedRoute({ children }) {
  const admin = localStorage.getItem("admins");
  if (!admin) {
    return <Navigate to="/" replace />;
  }
  return children;
}

// Layout untuk route yang dilindungi
function ProtectedLayout({ children }) {
  return (
    <>
      {children}
      <LogoutButton />
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Login */}
        <Route path="/" element={<LoginPage />} />

        {/* Halaman yang butuh login */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          </ProtectedRoute>
        }/>
        <Route path="/data-admin" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <DataAdmin />
            </ProtectedLayout>
          </ProtectedRoute>
        }/>
        <Route path="/data-user" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <DataUser />
            </ProtectedLayout>
          </ProtectedRoute>
        }/>
        <Route path="/data-balita" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <DataBalita />
            </ProtectedLayout>
          </ProtectedRoute>
        }/>
        <Route path="/rekam-medis" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <RekamMedis />
            </ProtectedLayout>
          </ProtectedRoute>
        }/>
        <Route path="/imunisasi" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <DataImunisasi />
            </ProtectedLayout>
          </ProtectedRoute>
        }/>
        <Route path="/jadwal" element={
          <ProtectedRoute>
            <ProtectedLayout>
              <JadwalPosyandu />
            </ProtectedLayout>
          </ProtectedRoute>
        }/>
      </Routes>
    </Router>
  );
}

export default App;
