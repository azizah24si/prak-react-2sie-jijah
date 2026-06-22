import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import ProtectedRoute from "./components/ProtectedRoute";

const Dashboard = lazy(() => import("./pages/main/Dashboard"));
const Orders = lazy(() => import("./pages/main/Orders"));
const Customers = lazy(() => import("./pages/main/Customers"));
const CustomerDetail = lazy(() => import("./pages/main/CustomerDetail"));
const Products = lazy(() => import("./pages/main/Products"));
const ProductDetail = lazy(() => import("./pages/main/ProductDetail"));
const NotFound = lazy(() => import("./pages/main/NotFound"));
const ErrorPage = lazy(() => import("./pages/main/ErrorPage"));
const Components = lazy(() => import("./pages/main/Components"));
const FiturXyz = lazy(() => import("./pages/main/FiturXyz"));
const MainLayout = lazy(() => import("./layouts/MainLayout"));
const AuthLayout = lazy(() => import("./layouts/AuthLayout"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const Forgot = lazy(() => import("./pages/auth/Forgot"));
const Notes = lazy(() => import("./pages/main/Notes"));

// Member pages
const MemberLayout = lazy(() => import("./layouts/MemberLayout"));
const MemberDashboard = lazy(() => import("./pages/member/MemberDashboard"));
const MemberOrders = lazy(() => import("./pages/member/MemberOrders"));
const Cart = lazy(() => import("./pages/member/Cart"));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        {/* Admin Routes - protected with admin role guard */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/components" element={<Components />} />
          <Route path="/fitur-xyz" element={<FiturXyz />} />
          <Route path="/notes" element={<Notes />} />
          <Route
            path="/400"
            element={
              <ErrorPage
                code="400"
                description="Permintaan Gagal (Bad Request)"
                image="https://cdn-icons-png.flaticon.com/512/5804/5804978.png"
              />
            }
          />

          <Route
            path="/401"
            element={
              <ErrorPage
                code="401"
                description="Akses Tidak Diizinkan (Unauthorized)"
                image="https://cdn-icons-png.flaticon.com/512/3064/3064197.png"
              />
            }
          />

          <Route
            path="/403"
            element={
              <ErrorPage
                code="403"
                description="Akses Dilarang (Forbidden)"
                image="https://cdn-icons-png.flaticon.com/512/2599/2599810.png"
              />
            }
          />
        </Route>

        {/* Member Routes - protected with member/guest role guard */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["member", "guest"]}>
              <MemberLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/member" element={<MemberDashboard />} />
          <Route path="/member/orders" element={<MemberOrders />} />
          <Route path="/member/cart" element={<Cart />} />
        </Route>

        {/* Auth Routes - public */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<Forgot />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;