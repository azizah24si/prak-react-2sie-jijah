import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import PageHeader from "../../components/PageHeader";

export default function MemberDashboard({ onAddToCart }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem("sedap_cart") || "[]");
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url,
        quantity: 1,
      });
    }

    localStorage.setItem("sedap_cart", JSON.stringify(cart));
    alert(`${product.name} ditambahkan ke keranjang!`);
  };

  if (loading) {
    return (
      <div className="p-4">
        <PageHeader title="Katalog Produk" breadcrumb={["Member", "Katalog"]} />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <PageHeader title="Katalog Produk" breadcrumb={["Member", "Katalog"]} />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
          >
            <img
              src={product.image_url || "https://via.placeholder.com/400x200?text=No+Image"}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-bold text-gray-800 text-lg">{product.name}</h3>
              <p className="text-gray-500 text-sm mt-1 line-clamp-2">
                {product.description}
              </p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-hijau font-bold text-lg">
                  Rp {Number(product.price).toLocaleString("id-ID")}
                </span>
                <span className="text-xs text-gray-400">
                  Stok: {product.stock}
                </span>
              </div>
              <button
                onClick={() => handleAddToCart(product)}
                disabled={product.stock === 0}
                className="w-full mt-3 bg-hijau text-white py-2 rounded-xl font-bold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.stock === 0 ? "Stok Habis" : "+ Keranjang"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg">Belum ada produk tersedia.</p>
        </div>
      )}
    </div>
  );
}
