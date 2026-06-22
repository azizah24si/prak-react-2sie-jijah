import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import { supabase } from "../../lib/supabaseClient";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image_url: "",
  });

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

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        stock: Number(formData.stock),
        image_url: formData.image_url,
      };

      if (editId) {
        const { error } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("products")
          .insert(payload);
        if (error) throw error;
      }

      setShowForm(false);
      setEditId(null);
      setFormData({ name: "", description: "", price: "", stock: "", image_url: "" });
      fetchProducts();
    } catch (err) {
      const msg = err.message || "";
      if (msg.includes("row-level security")) {
        alert("Gagal menyimpan produk: Akun Anda tidak memiliki akses admin. Pastikan role Anda adalah 'admin' di tabel profiles.\n\nJalankan SQL ini di Supabase SQL Editor:\nUPDATE profiles SET role = 'admin' WHERE email = 'email-anda';");
      } else {
        alert("Gagal menyimpan produk: " + msg);
      }
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      description: product.description || "",
      price: String(product.price),
      stock: String(product.stock),
      image_url: product.image_url || "",
    });
    setEditId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus produk ini?")) return;
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      fetchProducts();
    } catch (err) {
      alert("Gagal menghapus produk: " + err.message);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setFormData({ name: "", description: "", price: "", stock: "", image_url: "" });
  };

  return (
    <Card>
    <div className="p-4">
      <PageHeader title="Product List" breadcrumb={["Dashboard", "Product List"]}>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="bg-hijau text-white px-6 py-2 rounded-xl font-bold shadow-md hover:scale-105 transition-all"
        >
          {showForm ? "Close Form" : "+ Add Product"}
        </button>
      </PageHeader>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-6 border-l-4 border-hijau">
          <h3 className="font-bold text-gray-700 mb-4">
            {editId ? "Edit Product" : "Add New Product"}
          </h3>
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="border p-2 rounded-lg"
              />
              <input
                type="text"
                placeholder="Image URL"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="border p-2 rounded-lg"
              />
              <input
                type="number"
                placeholder="Price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                className="border p-2 rounded-lg"
              />
              <input
                type="number"
                placeholder="Stock"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                required
                className="border p-2 rounded-lg"
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="border p-2 rounded-lg col-span-2"
                rows="2"
              />
              <button type="submit" className="bg-hijau text-white p-2 rounded-lg font-bold col-span-2">
                {editId ? "Update Product" : "Save Product"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-sm uppercase">
            <tr>
              <th className="px-6 py-4">#</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Stock</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {products.map((item, index) => (
              <tr key={item.id} className="border-t border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-400">{index + 1}</td>
                <td className="px-6 py-4">
                  <Link
                    to={`/products/${item.id}`}
                    className="text-emerald-400 hover:text-emerald-600 hover:underline font-medium"
                  >
                    {item.name}
                  </Link>
                </td>
                <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{item.description || "-"}</td>
                <td className="px-6 py-4">Rp {Number(item.price).toLocaleString("id-ID")}</td>
                <td className="px-6 py-4">{item.stock}</td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-500 hover:text-blue-700 font-semibold text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 hover:text-red-700 font-semibold text-xs"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-400">Belum ada produk.</div>
        )}
      </div>
    </div>
    </Card>
  );
}
