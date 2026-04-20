import { Routes, Route } from "react-router-dom";
import Sidebar from "./layouts/Sidebar";
import Header from "./layouts/Header";
import Dashboard from "./pages/Dashboard";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import NotFound from "./pages/NotFound";
import ErrorPage from "./pages/ErrorPage";

export default function App() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-4">
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="*" element={<NotFound />} />

            <Route path="/400" element={<ErrorPage code="400" 
            description="Permintaan Gagal (Bad Request)" 
            image="https://cdn-icons-png.flaticon.com/512/5804/5804978.png" />} />
            
            <Route path="/401" element={<ErrorPage code="401" 
            description="Akses Tidak Diizinkan (Unauthorized)" 
            image="https://cdn-icons-png.flaticon.com/512/3064/3064197.png" />} />
            
            <Route path="/403" element={<ErrorPage code="403" 
            description="Akses Dilarang (Forbidden)" 
            image="https://cdn-icons-png.flaticon.com/512/2599/2599810.png" />} />
            
            <Route path="*" element={<ErrorPage code="404" 
            description="Halaman Tidak Ditemukan" 
            image="https://cdn-icons-png.flaticon.com/512/2748/2748558.png" />} />
        </Routes>
      </div>
    </div>
  );
}