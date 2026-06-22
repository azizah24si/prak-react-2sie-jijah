import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { useAuth } from "../../contexts/AuthContext";
import { calculateDiscount, calculatePoints, determineTier } from "../../lib/loyaltyUtils";
import PageHeader from "../../components/PageHeader";

export default function Cart() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    const stored = JSON.parse(localStorage.getItem("sedap_cart") || "[]");
    setCartItems(stored);
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty < 1) return;
    const updated = cartItems.map((item) =>
      item.id === productId ? { ...item, quantity: newQty } : item
    );
    setCartItems(updated);
    localStorage.setItem("sedap_cart", JSON.stringify(updated));
  };

  const removeItem = (productId) => {
    const updated = cartItems.filter((item) => item.id !== productId);
    setCartItems(updated);
    localStorage.setItem("sedap_cart", JSON.stringify(updated));
  };

  // Calculate totals
  const totalOriginal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const currentTier = profile?.tier || "Bronze";
  const { discountPercentage, totalFinal } = calculateDiscount(totalOriginal, currentTier);
  const pointsEarned = calculatePoints(totalFinal);

  const handleCheckout = async () => {
    if (!user || cartItems.length === 0) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // 1. Insert order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          member_id: user.id,
          total_original: totalOriginal,
          discount_percentage: discountPercentage,
          total_final: totalFinal,
          points_earned: pointsEarned,
          status: "completed",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Insert order items
      const itemsToInsert = cartItems.map((item) => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        price_per_unit: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // 3. Update member points and tier
      const newPoints = (profile.points || 0) + pointsEarned;
      const newTier = determineTier(newPoints);

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ points: newPoints, tier: newTier })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // 4. Refresh profile in context
      await refreshProfile();

      // 5. Clear cart
      setCartItems([]);
      localStorage.removeItem("sedap_cart");

      setSuccess(
        `Checkout berhasil! Anda mendapat ${pointsEarned} poin. Tier Anda: ${newTier}.`
      );

      setTimeout(() => navigate("/member/orders"), 2000);
    } catch (err) {
      setError(err.message || "Checkout gagal. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <PageHeader title="Keranjang Belanja" breadcrumb={["Member", "Keranjang"]} />

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}

      {cartItems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm mt-4">
          <p className="text-4xl mb-3">🛒</p>
          <p className="text-gray-400 text-lg">Keranjang masih kosong.</p>
          <button
            onClick={() => navigate("/member")}
            className="mt-4 bg-hijau text-white px-6 py-2 rounded-xl font-bold hover:bg-green-600 transition-colors"
          >
            Belanja Sekarang
          </button>
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mt-4">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-400 text-sm uppercase">
                <tr>
                  <th className="p-4">Produk</th>
                  <th className="p-4">Harga</th>
                  <th className="p-4">Qty</th>
                  <th className="p-4">Subtotal</th>
                  <th className="p-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {cartItems.map((item) => (
                  <tr key={item.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image_url || "https://via.placeholder.com/50"}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <span className="font-bold text-gray-800">{item.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      Rp {Number(item.price).toLocaleString("id-ID")}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 bg-gray-100 rounded-lg font-bold hover:bg-gray-200"
                        >
                          -
                        </button>
                        <span className="font-bold w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-100 rounded-lg font-bold hover:bg-gray-200"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-hijau">
                      Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 hover:text-red-600 font-bold"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Ringkasan Pesanan</h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Asli</span>
                <span className="font-semibold">
                  Rp {totalOriginal.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">
                  Diskon ({currentTier} - {discountPercentage}%)
                </span>
                <span className="font-semibold text-orange-500">
                  - Rp {(totalOriginal - totalFinal).toLocaleString("id-ID")}
                </span>
              </div>

              <div className="flex justify-between border-t border-gray-100 pt-3">
                <span className="text-gray-800 font-bold text-lg">Total Bayar</span>
                <span className="font-bold text-hijau text-lg">
                  Rp {totalFinal.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="flex justify-between bg-purple-50 p-3 rounded-xl mt-2">
                <span className="text-purple-600 font-semibold">Poin yang Didapat</span>
                <span className="font-bold text-purple-600">+{pointsEarned} poin</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full mt-6 bg-hijau text-white py-3 rounded-xl font-bold text-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : `Checkout - Rp ${totalFinal.toLocaleString("id-ID")}`}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
