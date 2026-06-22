import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import { supabase } from "../../lib/supabaseClient";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) return <div className="text-red-600 p-4">{error}</div>;
  if (!product) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <PageHeader
        title={product.name}
        breadcrumb={["Dashboard", "Product List", product.name]}
      />

      <div className="p-6 bg-white rounded-xl shadow-lg max-w-lg mx-auto mt-6">
        <img
          src={product.image_url || "https://via.placeholder.com/400x200?text=No+Image"}
          alt={product.name}
          className="rounded-xl mb-4 w-full h-48 object-cover"
        />
        <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
        <p className="text-gray-600 mb-1">{product.description || "No description"}</p>
        <p className="text-gray-600 mb-1">Stock: {product.stock}</p>
        <p className="text-gray-800 font-semibold text-lg">
          Harga: Rp {Number(product.price).toLocaleString("id-ID")}
        </p>
      </div>
    </div>
  );
}
