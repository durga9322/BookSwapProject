import { useState } from "react";
import BookCard from "./BookCard";

export default function RecommendationSection() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [recs, setRecs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState("");

  const handleInput = async (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.length >= 2) {
      try {
        const res = await fetch(
          "http://localhost:5000/api/recommend/search?q=" + encodeURIComponent(val)
        );
        const data = await res.json();
        setSuggestions(data.suggestions || []);
      } catch { setSuggestions([]); }
    } else { setSuggestions([]); }
  };

  const search = async (title) => {
    const t = title || query;
    if (!t.trim()) return;
    setQuery(t);
    setSuggestions([]);
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/recommend/by-book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: t })
      });
      const data = await res.json();
      if (data.recommendations && data.recommendations.length > 0) {
        setRecs(data.recommendations);
        setSearched(t);
      } else {
        setError(data.message || "No recommendations found. Try: 1984, Harry Potter, The Da Vinci Code");
        setRecs([]);
      }
    } catch (err) {
      setError("Cannot connect to server. Make sure Flask is running.");
    }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ position: "relative", display: "flex", gap: 8, maxWidth: 520 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input
            value={query}
            onChange={handleInput}
            onKeyDown={e => e.key === "Enter" && search()}
            placeholder="e.g. 1984, Harry Potter, The Alchemist..."
            style={{ width: "100%", padding: "10px 14px", borderRadius: 8,
              border: "1.5px solid #e2e8f0", fontSize: 14, outline: "none", boxSizing: "border-box" }}
          />
          {suggestions.length > 0 && (
            <ul style={{ position: "absolute", top: "110%", left: 0, right: 0, zIndex: 50,
              background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)", listStyle: "none",
              padding: "4px 0", margin: 0, maxHeight: 200, overflowY: "auto" }}>
              {suggestions.map((s, i) => (
                <li key={i} onClick={() => search(s)}
                  style={{ padding: "8px 14px", cursor: "pointer", fontSize: 13 }}
                  onMouseEnter={e => e.target.style.background = "#f8fafc"}
                  onMouseLeave={e => e.target.style.background = "transparent"}>
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button onClick={() => search()} disabled={loading} style={{
          padding: "10px 20px", background: loading ? "#93c5fd" : "#3b82f6",
          color: "#fff", border: "none", borderRadius: 8, fontSize: 14,
          fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "..." : "Search"}
        </button>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c",
          padding: "10px 14px", borderRadius: 8, fontSize: 13, marginTop: 12 }}>{error}</div>
      )}

      {recs.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <p style={{ fontWeight: 600, marginBottom: 14, color: "#1e293b" }}>
            Books similar to "{searched}"
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 14 }}>
            {recs.map((book, i) => (
              <BookCard key={i} book={book} onFindSimilar={search} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
