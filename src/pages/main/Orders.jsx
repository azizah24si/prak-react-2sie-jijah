import React, { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import { supabase } from "../../lib/supabaseClient";

export default function Orders() {
  const [showForm, setShowForm] = useState(false);
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, profiles(full_name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrdersData(data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;
      fetchOrders();
    } catch (err) {
      alert("Gagal update status: " + err.message);
    }
  };

  return (
    <div className="p-4">
      <PageHeader 
        title="Orders Management" 
        breadcrumb={["Dashboard", "Orders List"]}
      >
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-hijau text-white px-6 py-2 rounded-xl font-bold shadow-md hover:scale-105 transition-all"
        >
          {showForm ? "Close" : "Refresh"}
        </button>
      </PageHeader>

      {/* Tabel Data */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-sm uppercase">
            <tr>
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total Asli</th>
              <th className="p-4">Diskon</th>
              <th className="p-4">Total Final</th>
              <th className="p-4">Poin</th>
              <th className="p-4">Status</th>
              <th className="p-4">Aksi</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {ordersData.map((order) => (
              <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50">
                <td className="p-4 font-bold text-gray-800 font-mono text-xs">
                  {order.id.substring(0, 8)}...
                </td>
                <td className="p-4">{order.profiles?.full_name || "N/A"}</td>
                <td className="p-4">
                  Rp {Number(order.total_original).toLocaleString("id-ID")}
                </td>
                <td className="p-4 text-orange-500 font-semibold">
                  {order.discount_percentage}%
                </td>
                <td className="p-4 font-bold text-hijau">
                  Rp {Number(order.total_final).toLocaleString("id-ID")}
                </td>
                <td className="p-4 text-purple-500 font-semibold">
                  {order.points_earned}
                </td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                    order.status === "completed" ? "bg-green-100 text-green-600" : 
                    order.status === "pending" ? "bg-yellow-100 text-yellow-600" : 
                    "bg-red-100 text-red-600"
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4">
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                    className="border p-1 rounded text-xs"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {ordersData.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-400">Belum ada pesanan.</div>
        )}
      </div>
    </div>
  );
}