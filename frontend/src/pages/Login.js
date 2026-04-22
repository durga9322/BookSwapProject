import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://bookswap-backend-odto.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      console.log("Login data:", data);
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        login(data.user, data.token);
        navigate("/");
      } else {
        setError(data.error || "Login failed.");
      }
    } catch (err) {
      setError("Cannot connect to server.");
    }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", padding: "1rem" }}>
      <div style={{ width: 400, background: "#fff", borderRadius: 14, padding: "2rem", border: "1px solid #e2e8f0" }}>
        <h2 style={{ marginBottom: "1.5rem", color: "#1e293b", textAlign: "center" }}>Welcome Back</h2>
        {error && <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "10px 12px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Email</label>
            <input type="email" required value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, marginTop: 6,
                border: "1.5px solid #e2e8f0", fontSize: 14, boxSizing: "border-box", outline: "none" }} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>Password</label>
            <input type="password" required value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, marginTop: 6,
                border: "1.5px solid #e2e8f0", fontSize: 14, boxSizing: "border-box", outline: "none" }} />
          </div>
          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "11px", background: loading ? "#93c5fd" : "#3b82f6",
            color: "#fff", border: "none", borderRadius: 8, fontSize: 15,
            fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#64748b" }}>
          No account? <Link to="/register" style={{ color: "#3b82f6", textDecoration: "none" }}>Register here</Link>
        </p>
      </div>
    </div>
  );
}
