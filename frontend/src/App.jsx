import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./pages/Login";
import HomePage from "./pages/HomePage";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main public site - "/" */}
        <Route path="/" element={<HomePage />} />

        {/* Admin panel - "/admin" and "/admin/*" */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminLogin />} />

        {/* Catch-all: redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

