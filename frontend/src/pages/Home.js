import { useEffect, useState } from "react";
import api from "../api/axios";
import BookCard from "../components/BookCard";
import RecommendationSection from "../components/RecommendationSection";

export default function Home() {
  const [popular, setPopular]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState("popular");

  useEffect(() => {
    api.get("/recommend/popular")
      .then(r => setPopular(r.data.books || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
        <h1 style={{ fontSize: 34, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>
          Discover Your Next Book
        </h1>
        <p style={{ color: "#64748b", fontSize: 16 }}>
          ML-powered recommendations + local book swapping
        </p>
      </div>

      <div style={{ display: "flex", borderBottom: "2px solid #e2e8f0", marginBottom: "1.5rem" }}>
        {["popular", "recommend"].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: "10px 24px", background: "none", border: "none", cursor: "pointer",
            fontWeight: 600, fontSize: 14,
            borderBottom: activeTab === tab ? "2px solid #3b82f6" : "2px solid transparent",
            color: activeTab === tab ? "#3b82f6" : "#64748b",
            marginBottom: -2
          }}>
            {tab === "popular" ? "Popular Books" : "Get Recommendations"}
          </button>
        ))}
      </div>

      {activeTab === "popular" && (
        loading ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
            Loading popular books...
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(165px, 1fr))", gap: 16 }}>
            {popular.map((book, i) => (
              <BookCard key={i} book={book} showRating={true}
                onFindSimilar={() => setActiveTab("recommend")} />
            ))}
          </div>
        )
      )}

      {activeTab === "recommend" && (
        <div>
          <p style={{ color: "#64748b", marginBottom: 20, fontSize: 14 }}>
            Type any book title to find similar books using ML model.
          </p>
          <RecommendationSection />
        </div>
      )}
    </div>
  );
}
