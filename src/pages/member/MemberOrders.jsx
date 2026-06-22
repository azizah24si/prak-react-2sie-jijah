import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import PageHeader from "../../components/PageHeader";

export default function MemberOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("member_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (status) => {
    const styles = {
      completed: "bg-green-100 text-green-600",
      pending: "bg-yellow-100 text-yellow-600",
      cancelled: "bg-red-100 text-red-600",
    };
    return `px-3 py-1 rounded-full text-xs font-bold capitalize ${styles[status] || "bg-gray-100 text-gray-600"}`;
  };

  return (
    <div className="p-4">
      <PageHeader title="Pesanan Saya" breadcrumb={["Member", "Pesanan"]} />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mt-4">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-400 text-sm uppercase">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Total Asli</th>
                <th className="p-4">Diskon</th>
                <th className="p-4">Total Bayar</th>
                <th className="p-4">Poin</th>
                <th className="p-4">Status</th>
                <th className="p-4">Tanggal</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="p-4 font-mono text-xs text-gray-600">
                    {order.id.substring(0, 8)}...
                  </td>
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
                    +{order.points_earned}
                  </td>
                  <td className="p-4">
                    <span className={statusBadge(order.status)}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 text-xs">
                    {new Date(order.created_at).toLocaleDateString("id-ID")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {orders.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🛒</p>
              <p>Belum ada pesanan. Mulai belanja di katalog!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
