import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth.jsx";
import Navbar from "./components/Navbar.jsx";
import AddCard from "./pages/AddCard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Analytics from "./pages/Analytics.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import MakePayment from "./pages/MakePayment.jsx";
import Register from "./pages/Register.jsx";
import Transactions from "./pages/Transactions.jsx";

function Protected({ admin = false }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (admin && !user.is_staff) return <Navigate to="/" replace />;
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </>
  );
}

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
      <Route element={<Protected />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/cards/new" element={<AddCard />} />
        <Route path="/pay" element={<MakePayment />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/analytics" element={<Analytics />} />
      </Route>
      <Route element={<Protected admin />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
