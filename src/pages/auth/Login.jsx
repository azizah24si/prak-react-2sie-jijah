import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { user } = await signIn(email, password);
            // Redirect based on role - profile will be fetched by AuthContext
            // Default to admin dashboard; route guards will handle redirection
            navigate("/");
        } catch (err) {
            const msg = err.message || "";
            if (msg.includes("Email not confirmed")) {
                setError("Email belum diverifikasi. Silakan cek inbox email Anda atau hubungi admin.");
            } else if (msg.includes("Invalid login credentials")) {
                setError("Email atau password salah. Silakan coba lagi.");
            } else {
                setError(msg || "Login gagal. Periksa email dan password Anda.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold text-gray-700 mb-6 text-center">
                Welcome Back 👋
            </h2>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm
                            placeholder-gray-400"
                        placeholder="you@example.com"
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg shadow-sm
                            placeholder-gray-400"
                        placeholder="********"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4
                        rounded-lg transition duration-300 disabled:opacity-50"
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-4">
                Don't have an account?{" "}
                <Link to="/register" className="text-green-500 font-semibold hover:underline">
                    Register
                </Link>
            </p>
            <p className="text-center text-sm mt-2">
                <Link to="/forgot" className="text-gray-400 hover:underline">
                    Forgot password?
                </Link>
            </p>
        </div>
    )
}
