import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";

// Lazy load pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Orders = lazy(() => import("./pages/Orders"));
const Customers = lazy(() => import("./pages/Customers"));
const CustomerDetail = lazy(() => import("./pages/CustomerDetail"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ErrorPage = lazy(() => import("./pages/ErrorPage"));
const MainLayout = lazy(() => import("./layouts/MainLayout"));
const AuthLayout = lazy(() => import("./layouts/AuthLayout"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const Forgot = lazy(() => import("./pages/auth/Forgot"));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />

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

          <Route path="*" element={<NotFound />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot" element={<Forgot />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;