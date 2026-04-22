import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0.8rem 2rem", background: "#1e293b", color: "#fff",
      position: "sticky", top: 0, zIndex: 100, margin: 0, width: "100%",
      boxSizing: "border-box"
    }}>
      <Link to="/" style={{ color: "#fff", textDecoration: "none", fontSize: 22, fontWeight: 700 }}>
        BookSwap
      </Link>
      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
        <Link to="/" style={{ color: "#94a3b8", textDecoration: "none", fontSize: 14 }}>Home</Link>
        {user ? (
          <>
            <Link to="/marketplace" style={{ color: "#94a3b8", textDecoration: "none", fontSize: 14 }}>Marketplace</Link>
            <Link to="/dashboard" style={{ color: "#94a3b8", textDecoration: "none", fontSize: 14 }}>Dashboard</Link>
            <span style={{ color: "#e2e8f0", fontSize: 14 }}>Hi, {user.name}</span>
            <button onClick={handleLogout} style={{
              padding: "6px 14px", background: "#ef4444", color: "#fff",
              border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13
            }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: "#94a3b8", textDecoration: "none", fontSize: 14 }}>Login</Link>
            <Link to="/register" style={{
              padding: "6px 14px", background: "#3b82f6", color: "#fff",
              textDecoration: "none", borderRadius: 6, fontSize: 13
            }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
