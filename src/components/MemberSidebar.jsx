import { NavLink, useNavigate } from "react-router-dom";
import { FaStore, FaListAlt, FaShoppingCart, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import { DISCOUNT_BY_TIER } from "../lib/loyaltyUtils";

export default function MemberSidebar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const menuClass = ({ isActive }) =>
    `flex cursor-pointer items-center rounded-xl p-4 space-x-2 transition-all ${
      isActive
        ? "text-hijau bg-green-200 font-extrabold shadow-sm"
        : "text-gray-600 hover:text-hijau hover:bg-green-200 hover:font-extrabold"
    }`;

  const handleLogout = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div
      id="sidebar"
      className="flex min-h-screen w-90 flex-col bg-white p-10 shadow-lg"
    >
      {/* Logo */}
      <div id="sidebar-logo" className="flex flex-col">
        <span className="block text-[36px] font-[900] text-gray-900 leading-none tracking-tight font-poppins">
          Sedap{" "}
          <b id="logo-dot" className="text-hijau">
            .
          </b>
        </span>
        <span
          id="logo-subtitle"
          className="font-semibold text-gray-400 font-barlow"
        >
          Member Portal
        </span>
      </div>

      {/* Profile Info */}
      {profile && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <p className="font-bold text-gray-800">{profile.full_name || profile.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              profile.tier === "Platinum" ? "bg-purple-100 text-purple-600" :
              profile.tier === "Gold" ? "bg-yellow-100 text-yellow-600" : 
              profile.tier === "Silver" ? "bg-gray-100 text-gray-600" : 
              "bg-orange-100 text-orange-600"
            }`}>
              {profile.tier}
            </span>
            <span className="text-xs text-gray-500">{profile.points} pts</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Diskon: {DISCOUNT_BY_TIER[profile.tier] || 0}%
          </p>
        </div>
      )}

      {/* Menu */}
      <div id="sidebar-menu" className="mt-8">
        <ul id="menu-list" className="space-y-3">
          <li>
            <NavLink to="/member" end className={menuClass}>
              <FaStore className="mr-4 text-xl" /> Katalog Produk
            </NavLink>
          </li>
          <li>
            <NavLink to="/member/orders" className={menuClass}>
              <FaListAlt className="mr-4 text-xl" /> Pesanan Saya
            </NavLink>
          </li>
          <li>
            <NavLink to="/member/cart" className={menuClass}>
              <FaShoppingCart className="mr-4 text-xl" /> Keranjang
            </NavLink>
          </li>
        </ul>
      </div>

      {/* Footer */}
      <div id="sidebar-footer" className="mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-3 p-3 mb-6 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-300 font-bold group shadow-sm"
        >
          <FaSignOutAlt className="group-hover:-translate-x-1 transition-transform text-lg" />
          <span>Logout</span>
        </button>

        <span
          id="footer-brand"
          className="font-bold text-gray-400 block text-xs"
        >
          Sedap Restaurant Member Portal
        </span>
        <p
          id="footer-copyright"
          className="font-light text-gray-400 text-[10px]"
        >
          &copy; 2025 All Right Reserved
        </p>
      </div>
    </div>
  );
}
