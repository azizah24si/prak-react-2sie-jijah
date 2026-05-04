import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import productData from "./productData.json";

export default function Products() {
  return (
    <div className="p-4">
      <PageHeader
        title="Product List"
        breadcrumb={["Dashboard", "Product List"]}
      />

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-sm uppercase">
            <tr>
              <th className="px-6 py-4">#</th>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Brand</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Stock</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {productData.map((item, index) => (
              <tr key={item.id} className="border-t border-gray-50 hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-400">{index + 1}</td>
                <td className="px-6 py-4">
                  <Link
                    to={`/products/${item.id}`}
                    className="text-emerald-400 hover:text-emerald-600 hover:underline font-medium"
                  >
                    {item.title}
                  </Link>
                </td>
                <td className="px-6 py-4 capitalize">{item.category}</td>
                <td className="px-6 py-4">{item.brand}</td>
                <td className="px-6 py-4">Rp {(item.price * 1000).toLocaleString("id-ID")}</td>
                <td className="px-6 py-4">{item.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
