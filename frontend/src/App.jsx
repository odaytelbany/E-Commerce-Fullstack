import { Navigate, Route, Routes } from "react-router"
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage"
import AdminPage from "./pages/AdminPage"
import Navbar from "./components/Navbar"
import RegisterPage from "./pages/RegisterPage"
import { Toaster } from "react-hot-toast"
import { useAuthStore } from "./store/useAuthStore"
import { useEffect } from "react"
import Loader from "./components/Loader"
import CategoryPage from "./components/CategoryPage"
import CartPage from "./pages/CartPage"
import { useCartStore } from "./store/useCartStore"
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage"
import PurchaseCancelPage from "./pages/PurchaseCancelPage"

const App = () => {
  const { user, checkAuth, checkingAuth } = useAuthStore();
  const {getCartItems} = useCartStore();

  useEffect(() => {
    if (user) {
      getCartItems();
    }
  }, [getCartItems, user]);

  useEffect(() => {
    console.log("Checking authentication status...");
    checkAuth();
  }, [checkAuth]);

  if (checkingAuth) {
    return <Loader />
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.3)_0%,_rgba(10,80,60,0.2)_45%,_rgba(0,0,0,0.1)_100%)]" />
        </div>
      </div>

      <div className="relative z-50 pt-20">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={user ? <Navigate to={"/"} /> : <RegisterPage />} />
          <Route path="/login" element={user ? <Navigate to={"/"} /> : <LoginPage />} />
          <Route path="/secret-dashboard" element={user?.role === "admin" ? <AdminPage /> : <Navigate to={"/login"} />} />
          <Route path="/category/:category" element={<CategoryPage />} />
          <Route path="/cart" element={user ? <CartPage /> : <Navigate to="/login" />} />
          <Route path="/purchase-success" element={user ? <PurchaseSuccessPage /> : <Navigate to="/login" />} />
          <Route path="/purchase-cancel" element={user ? <PurchaseCancelPage /> : <Navigate to="/login" />} />
        </Routes>
      </div>
      <Toaster />
    </div>

  )
}

export default App