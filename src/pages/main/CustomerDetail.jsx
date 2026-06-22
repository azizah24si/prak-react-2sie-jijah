import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import { supabase } from "../../lib/supabaseClient";

const TIER_STYLES = {
  Bronze: { bg: "bg-orange-100", text: "text-orange-600" },
  Silver: { bg: "bg-gray-100", text: "text-gray-600" },
  Gold: { bg: "bg-yellow-100", text: "text-yellow-600" },
  Platinum: { bg: "bg-purple-100", text: "text-purple-600" },
};

export default function CustomerDetail() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setCustomer(data);
    } catch (err) {
      console.error("Error fetching customer:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;

  if (!customer) {
    return (
      <div className="flex flex-col w-full">
        <PageHeader title="Customer Detail" breadcrumb={["Dashboard", "Customers", "Detail"]} />
        <div className="mt-8 flex flex-col items-center justify-center text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Customer Tidak Ditemukan</h2>
          <p className="text-gray-400 mb-6">
            Customer dengan ID{" "}
            <span className="font-mono font-bold text-red-400">{id}</span> tidak ada.
          </p>
          <Link
            to="/customers"
            className="bg-[#00B074] text-white px-5 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors"
          >
            ← Kembali ke Customers
          </Link>
        </div>
      </div>
    );
  }

  const loyalty = TIER_STYLES[customer.tier] || TIER_STYLES.Bronze;

  return (
    <div className="flex flex-col w-full">
      <PageHeader
        title="Customer Detail"
        breadcrumb={["Dashboard", "Customers", customer.full_name || customer.email]}
      >
        <Link
          to="/customers"
          className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          ← Kembali
        </Link>
      </PageHeader>

      <div className="mt-4 max-w-lg">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {/* Avatar & Nama */}
          <div className="flex items-center gap-4 mb-6">
            <img
              className="w-16 h-16 rounded-full border-2 border-[#00B074] object-cover"
              src={`https://avatar.iran.liara.run/public?username=${customer.full_name || customer.email}`}
              alt={customer.full_name || customer.email}
            />
            <div>
              <h2 className="text-xl font-bold text-gray-800">{customer.full_name || customer.email}</h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${loyalty.bg} ${loyalty.text}`}
              >
                {customer.tier}
              </span>
            </div>
          </div>

          {/* Info Detail */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-50 pb-3">
              <span className="text-sm font-semibold text-gray-400">Customer ID</span>
              <span className="font-mono text-gray-700 font-medium text-xs">#{customer.id}</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-50 pb-3">
              <span className="text-sm font-semibold text-gray-400">Nama</span>
              <span className="text-gray-700 font-medium">{customer.full_name || "-"}</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-50 pb-3">
              <span className="text-sm font-semibold text-gray-400">Email</span>
              <span className="text-gray-700">{customer.email}</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-50 pb-3">
              <span className="text-sm font-semibold text-gray-400">Role</span>
              <span className="text-gray-700 capitalize">{customer.role}</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-50 pb-3">
              <span className="text-sm font-semibold text-gray-400">Points</span>
              <span className="text-purple-600 font-bold">{customer.points}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-400">Tier</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${loyalty.bg} ${loyalty.text}`}
              >
                {customer.tier}
              </span>
            </div>
          </div>
        </div>

        {/* Info useParams */}
        <div className="mt-4 bg-gray-800 rounded-2xl p-4 text-sm font-mono">
          <p className="text-gray-400 mb-1">{"// Nilai dari useParams():"}</p>
          <p className="text-green-400">{"const { id } = useParams()"}</p>
          <p className="text-yellow-300 mt-1">
            id = <span className="text-white">"{id}"</span>
          </p>
        </div>
      </div>
    </div>
  );
}