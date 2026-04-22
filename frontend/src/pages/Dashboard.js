import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Dashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [notifs, setNotifs]     = useState([]);
  const [myBooks, setMyBooks]   = useState([]);

  useEffect(() => {
    api.get("/swap/my-requests").then(r => setRequests(r.data.requests || [])).catch(() => {});
    api.get("/swap/notifications").then(r => setNotifs(r.data.notifications || [])).catch(() => {});
    api.get("/books/my").then(r => setMyBooks(r.data.books || [])).catch(() => {});
  }, []);

  const respond = async (id, status) => {
    try {
      await api.put("/swap/respond/" + id, { status });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      if (status === "Accepted") {
        alert("Accepted! Check notifications for contact details.");
        api.get("/swap/notifications").then(r => setNotifs(r.data.notifications || []));
      }
    } catch (err) { alert(err.response?.data?.error || "Failed."); }
  };

  const deleteBook = async (bookId, title) => {
    if (!window.confirm("Delete book: " + title + "?")) return;
    try {
      await api.delete("/swap/delete-book/" + bookId);
      setMyBooks(prev => prev.filter(b => b.id !== bookId));
      alert("Book deleted!");
    } catch (err) { alert(err.response?.data?.error || "Failed to delete."); }
  };

  const statusColor = { Pending: "#f59e0b", Accepted: "#10b981", Rejected: "#ef4444" };
  const statusBg    = { Pending: "#fffbeb", Accepted: "#f0fdf4", Rejected: "#fef2f2" };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1rem" }}>
      <h2 style={{ color: "#1e293b", marginBottom: "1.5rem" }}>
        Dashboard &mdash; {user?.name}
      </h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 28 }}>
        {[["My Books", myBooks.length, "#3b82f6"],
          ["Swap Requests", requests.length, "#f59e0b"],
          ["Notifications", notifs.filter(n => !n.is_read).length, "#10b981"]
        ].map(([label, value, color]) => (
          <div key={label} style={{ background: "#fff", borderRadius: 12, padding: "1.2rem",
            border: "1px solid #e2e8f0", textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 700, color }}>{value}</div>
            <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      <h3 style={{ color: "#1e293b", marginBottom: 12 }}>Notifications</h3>
      {notifs.length === 0 ? (
        <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 24 }}>No notifications yet.</p>
      ) : notifs.map(n => (
        <div key={n.id} style={{
          background: n.is_read ? "#f8fafc" : "#eff6ff",
          border: "1px solid " + (n.is_read ? "#e2e8f0" : "#bfdbfe"),
          borderRadius: 8, padding: "10px 14px", marginBottom: 8, fontSize: 13
        }}>{n.message}</div>
      ))}

      <h3 style={{ color: "#1e293b", marginBottom: 12, marginTop: 24 }}>My Books for Swap</h3>
      {myBooks.length === 0 ? (
        <p style={{ color: "#94a3b8", fontSize: 14, marginBottom: 24 }}>No books listed yet.</p>
      ) : myBooks.map(b => (
        <div key={b.id} style={{ background: "#fff", border: "1px solid #e2e8f0",
          borderRadius: 10, padding: "12px 16px", marginBottom: 10,
          display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontWeight: 600, color: "#1e293b" }}>{b.title}</span>
            <span style={{ color: "#64748b", fontSize: 13, marginLeft: 10 }}>{b.author}</span>
            <div style={{ marginTop: 4, display: "flex", gap: 6 }}>
              <span style={{ fontSize: 11, background: "#f0f9ff", color: "#0369a1",
                padding: "2px 6px", borderRadius: 4 }}>{b.condition}</span>
              <span style={{ fontSize: 11, background: "#f0fdf4", color: "#166534",
                padding: "2px 6px", borderRadius: 4 }}>{b.city}</span>
              <span style={{ fontSize: 11, padding: "2px 6px", borderRadius: 4,
                background: b.is_available ? "#f0fdf4" : "#fef2f2",
                color: b.is_available ? "#166534" : "#b91c1c" }}>
                {b.is_available ? "Available" : "Swapped"}
              </span>
            </div>
          </div>
          <button onClick={() => deleteBook(b.id, b.title)} style={{
            padding: "6px 14px", background: "#ef4444", color: "#fff",
            border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13
          }}>Delete</button>
        </div>
      ))}

      <h3 style={{ color: "#1e293b", marginBottom: 12, marginTop: 24 }}>Incoming Swap Requests</h3>
      {requests.length === 0 ? (
        <p style={{ color: "#94a3b8", fontSize: 14 }}>No swap requests yet.</p>
      ) : requests.map(r => (
        <div key={r.id} style={{
          background: statusBg[r.status] || "#fff",
          border: "1px solid #e2e8f0", borderRadius: 12,
          padding: "1rem 1.2rem", marginBottom: 12
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <p style={{ fontWeight: 600, margin: 0, color: "#1e293b" }}>
                {r.requester_name} wants your book:
                <em style={{ color: "#3b82f6", marginLeft: 6 }}>{r.book_title}</em>
              </p>
              {r.message && (
                <p style={{ color: "#64748b", fontSize: 13, margin: "4px 0 0" }}>
                  "{r.message}"
                </p>
              )}
              {r.status === "Accepted" && (
                <div style={{ marginTop: 8, padding: "8px 12px", background: "#f0fdf4",
                  borderRadius: 8, fontSize: 13, color: "#166534" }}>
                  Contact: <strong>{r.requester_email}</strong> | City: {r.requester_city}
                </div>
              )}
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
              background: statusBg[r.status], color: statusColor[r.status],
              border: "1px solid " + statusColor[r.status], whiteSpace: "nowrap" }}>
              {r.status}
            </span>
          </div>
          {r.status === "Pending" && (
            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button onClick={() => respond(r.id, "Accepted")} style={{
                padding: "6px 18px", background: "#10b981", color: "#fff",
                border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>
                Accept
              </button>
              <button onClick={() => respond(r.id, "Rejected")} style={{
                padding: "6px 18px", background: "#ef4444", color: "#fff",
                border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 }}>
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
