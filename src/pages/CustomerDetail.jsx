import { useParams, Link } from "react-router-dom";
import { customers, LOYALTY_CONFIG } from "../data/ordersData";
import PageHeader from "../components/PageHeader";

export default function CustomerDetail() {
  const { id } = useParams();

  // Biar aman kalau id di data berupa number
  const customer = customers.find((c) => String(c.id) === id);

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

  const loyalty = LOYALTY_CONFIG[customer.loyalty] || {};

  return (
    <div className="flex flex-col w-full">
      <PageHeader
        title="Customer Detail"
        breadcrumb={["Dashboard", "Customers", customer.customerName]}
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
              src={`https://avatar.iran.liara.run/public?username=${customer.customerName}`}
              alt={customer.customerName}
            />
            <div>
              <h2 className="text-xl font-bold text-gray-800">{customer.customerName}</h2>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${loyalty.bg} ${loyalty.text}`}
              >
                {customer.loyalty}
              </span>
            </div>
          </div>

          {/* Info Detail */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-50 pb-3">
              <span className="text-sm font-semibold text-gray-400">Customer ID</span>
              <span className="font-mono text-gray-700 font-medium">#{customer.id}</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-50 pb-3">
              <span className="text-sm font-semibold text-gray-400">Nama</span>
              <span className="text-gray-700 font-medium">{customer.customerName}</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-50 pb-3">
              <span className="text-sm font-semibold text-gray-400">Email</span>
              <span className="text-gray-700">{customer.email}</span>
            </div>
            <div className="flex items-center justify-between border-b border-gray-50 pb-3">
              <span className="text-sm font-semibold text-gray-400">Telepon</span>
              <span className="text-gray-700">{customer.phone}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-400">Loyalty</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${loyalty.bg} ${loyalty.text}`}
              >
                {customer.loyalty}
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