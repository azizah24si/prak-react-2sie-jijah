import React, { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import { supabase } from "../../lib/supabaseClient";

export default function Customers() {
  const [showForm, setShowForm] = useState(false);
  const [customersData, setCustomersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    full_name: "",
    password: "",
    tier: "Bronze",
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "member")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCustomersData(data || []);
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      alert("Password minimal 6 karakter.");
      return;
    }
    setFormLoading(true);
    try {
      // Step 1: Create auth user via signUp (triggers profile creation)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name,
            role: "member",
          },
        },
      });
      if (authError) throw authError;

      // Step 2: Update profile with tier (trigger already created the profile row)
      if (authData.user) {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ tier: formData.tier })
          .eq("id", authData.user.id);
        if (updateError) console.warn("Tier update warning:", updateError.message);
      }

      setShowForm(false);
      setFormData({ email: "", full_name: "", password: "", tier: "Bronze" });
      fetchCustomers();
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("User already registered")) {
        alert("Email ini sudah terdaftar.");
      } else if (msg.toLowerCase().includes("rate limit")) {
        alert("Terlalu banyak percobaan. Tunggu beberapa menit.");
      } else {
        alert("Gagal menambah customer: " + msg);
      }
    } finally {
      setFormLoading(false);
    }
  };

  const tierBadge = (tier) => {
    const styles = {
      Platinum: "bg-purple-100 text-purple-600",
      Gold: "bg-yellow-100 text-yellow-600",
      Silver: "bg-gray-100 text-gray-600",
      Bronze: "bg-orange-100 text-orange-600",
    };
    return `px-3 py-1 rounded-full text-xs font-bold ${styles[tier] || styles.Bronze}`;
  };

  return (
    <div className="p-4">
      <PageHeader 
        title="Customer Database" 
        breadcrumb={["Dashboard", "Customers"]}
      >
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-hijau text-white px-6 py-2 rounded-xl font-bold shadow-md hover:scale-105 transition-all"
        >
          {showForm ? "Close Form" : "+ Add Customer"}
        </button>
      </PageHeader>

      {/* Form Add Customer */}
      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-6 border-l-4 border-hijau animate-in fade-in zoom-in duration-300">
          <h3 className="font-bold text-gray-700 mb-4">Register New Customer</h3>
          <form onSubmit={handleAddCustomer}>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="border p-2 rounded-lg"
              />
              <input
                type="text"
                placeholder="Full Name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
                className="border p-2 rounded-lg"
              />
              <input
                type="password"
                placeholder="Password (min 6 karakter)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
                className="border p-2 rounded-lg"
              />
              <select
                value={formData.tier}
                onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                className="border p-2 rounded-lg"
              >
                <option>Bronze</option>
                <option>Silver</option>
                <option>Gold</option>
                <option>Platinum</option>
              </select>
              <button type="submit" disabled={formLoading} className="bg-hijau text-white p-2 rounded-lg font-bold col-span-2 disabled:opacity-50">
                {formLoading ? "Menyimpan..." : "Save Customer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabel Data Customers */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-sm uppercase">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Tier</th>
              <th className="p-4">Points</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {customersData.map((cust) => (
              <tr key={cust.id} className="border-t border-gray-50 hover:bg-gray-50">
                <td className="p-4 font-bold text-gray-800 font-mono text-xs">
                  {cust.id.substring(0, 8)}...
                </td>
                <td className="p-4">{cust.full_name || "N/A"}</td>
                <td className="p-4">{cust.email}</td>
                <td className="p-4">
                  <span className={tierBadge(cust.tier)}>
                    {cust.tier}
                  </span>
                </td>
                <td className="p-4 font-semibold text-purple-500">{cust.points}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {customersData.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-400">Belum ada data customer.</div>
        )}
      </div>
    </div>
  );
}