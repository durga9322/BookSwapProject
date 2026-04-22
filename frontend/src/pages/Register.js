import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", city: "", pincode: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/auth/register", form);
      alert("Registered successfully! Please login.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed.");
    }
    setLoading(false);
  };

  const inp = (label, name, type = "text", required = false) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: "#374151" }}>{label}</label>
      <input type={type} required={required} value={form[name]}
        onChange={e => setForm({ ...form, [name]: e.target.value })}
        style={{ width: "100%", padding: "10px 12px", borderRadius: 8, marginTop: 6,
          border: "1.5px solid #e2e8f0", fontSize: 14, boxSizing: "border-box", outline: "none" }} />
    </div>
  );

  return (
    <div style={{ display: "flex", justifyContent: "center", padding: "2rem 1rem" }}>
      <div style={{ width: 440, background: "#fff", borderRadius: 14, padding: "2rem", border: "1px solid #e2e8f0" }}>
        <h2 style={{ marginBottom: "1.5rem", color: "#1e293b", textAlign: "center" }}>Create Account</h2>
        {error && <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "10px 12px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          {inp("Full Name", "name", "text", true)}
          {inp("Email", "email", "email", true)}
          {inp("Password", "password", "password", true)}
          {inp("City (for book swapping)", "city")}
          {inp("Pincode", "pincode")}
          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "11px", background: loading ? "#93c5fd" : "#3b82f6",
            color: "#fff", border: "none", borderRadius: 8, fontSize: 15,
            fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Creating..." : "Register"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#64748b" }}>
          Already have an account? <Link to="/login" style={{ color: "#3b82f6", textDecoration: "none" }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
