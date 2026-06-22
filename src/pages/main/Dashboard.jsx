import React, { useState, useEffect } from "react";
import { FaShoppingCart, FaTruck, FaBan, FaDollarSign, FaUtensils } 
from "react-icons/fa";
import PageHeader from "../../components/PageHeader";
import { supabase } from "../../lib/supabaseClient";

export default function Dashboard() {
    const [filter, setFilter] = useState("Weekly");
    const [stats, setStats] = useState({ totalOrders: 0, totalDelivered: 0, totalCanceled: 0, totalRevenue: 0 });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch all orders for stats
            const { data: allOrders, error } = await supabase
                .from("orders")
                .select("*");

            if (error) throw error;

            const orders = allOrders || [];
            const totalOrders = orders.length;
            const totalDelivered = orders.filter(o => o.status === "completed").length;
            const totalCanceled = orders.filter(o => o.status === "cancelled").length;
            const totalRevenue = orders
                .filter(o => o.status === "completed")
                .reduce((sum, o) => sum + Number(o.total_final), 0);

            setStats({ totalOrders, totalDelivered, totalCanceled, totalRevenue });

            // Fetch recent orders with profile join
            const { data: recent, error: recentError } = await supabase
                .from("orders")
                .select("*, profiles(full_name)")
                .order("created_at", { ascending: false })
                .limit(5);

            if (!recentError && recent) {
                setRecentOrders(recent);
            }
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const statusColor = (status) => {
        const colors = {
            completed: "text-green-500",
            pending: "text-yellow-500",
            cancelled: "text-red-500",
        };
        return colors[status] || "text-gray-500";
    };

    return (
        <div id="dashboard-container" className="p-2">
            
            {/* Header Area dengan Filter Button */}
            <div className="flex justify-between items-center pr-5">
                <PageHeader 
                    title="Dashboard" 
                    breadcrumb={["Dashboard", "Overview"]}
                />
                <PageHeader />
                
                {/* IMPROVISASI 1 (Visual): Button Group Filter */}
                <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 h-fit">
                    {["Daily", "Weekly", "Monthly"].map((item) => (
                        <button
                            key={item}
                            onClick={() => setFilter(item)}
                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                                filter === item 
                                ? "bg-hijau text-white shadow-md" 
                                : "text-gray-400 hover:text-gray-600"
                            }`}
                        >
                            {item}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid Card Statistik */}
            <div id="dashboard-grid" className="p-5 grid sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-center space-x-5 bg-white rounded-2xl shadow-sm p-6">
                    <div className="bg-hijau rounded-full p-4 text-3xl text-white"><FaShoppingCart /></div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-gray-800">{stats.totalOrders}</span>
                        <span className="text-gray-400 text-sm">Total Orders</span>
                    </div>
                </div>

                <div className="flex items-center space-x-5 bg-white rounded-2xl shadow-sm p-6">
                    <div className="bg-biru rounded-full p-4 text-3xl text-white"><FaTruck /></div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-gray-800">{stats.totalDelivered}</span>
                        <span className="text-gray-400 text-sm">Total Delivered</span>
                    </div>
                </div>

                <div className="flex items-center space-x-5 bg-white rounded-2xl shadow-sm p-6">
                    <div className="bg-merah rounded-full p-4 text-3xl text-white opacity-80"><FaBan /></div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-gray-800">{stats.totalCanceled}</span>
                        <span className="text-gray-400 text-sm">Total Canceled</span>
                    </div>
                </div>

                <div className="flex items-center space-x-5 bg-white rounded-2xl shadow-sm p-6">
                    <div className="bg-kuning rounded-full p-4 text-3xl text-white"><FaDollarSign /></div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold text-gray-800">Rp {stats.totalRevenue.toLocaleString("id-ID")}</span>
                        <span className="text-gray-400 text-sm">Total Revenue</span>
                    </div>
                </div>
            </div>

            {/* IMPROVISASI 2 (Visual): Recent Orders Table */}
            <div className="mx-5 mt-2 p-6 bg-white rounded-2xl shadow-sm border border-gray-50">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800">Recent Orders</h3>
                    <button className="text-hijau font-bold text-sm hover:underline">View All</button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-gray-400 text-sm border-b border-gray-50">
                                <th className="pb-4 font-medium">Order ID</th>
                                <th className="pb-4 font-medium">Status</th>
                                <th className="pb-4 font-medium">Customer</th>
                                <th className="pb-4 font-medium">Total</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {recentOrders.map((order) => (
                                <tr key={order.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                                    <td className="py-4 font-bold text-gray-700 font-mono text-xs">{order.id.substring(0, 8)}...</td>
                                    <td className="py-4">
                                        <div className="p-2 bg-green-50 text-hijau rounded-lg inline-block"><FaUtensils /></div>
                                    </td>
                                    <td className="py-4 text-gray-600">{order.profiles?.full_name || "N/A"}</td>
                                    <td className={`py-4 font-bold ${statusColor(order.status)}`}>
                                        Rp {Number(order.total_final).toLocaleString("id-ID")}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {recentOrders.length === 0 && !loading && (
                        <div className="text-center py-8 text-gray-400">Belum ada pesanan.</div>
                    )}
                </div>
            </div>
        </div>
    );
}