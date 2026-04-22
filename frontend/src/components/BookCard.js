export default function BookCard({ book, onFindSimilar, onRequestSwap, showSwap, showRating }) {
  const title  = book.title  || book["Book-Title"]  || "Unknown";
  const author = book.author || book["Book-Author"] || "Unknown";
  const image  = book.image  || book["Image-URL-M"] || book.image_url || "";

  const stars = (rating) => {
    const r = Math.min(5, Math.max(0, Math.round(Number(rating) || 0)));
    return "?".repeat(r) + "?".repeat(5 - r);
  };

  return (
    <div style={{
      background: "#fff", borderRadius: 10, overflow: "hidden",
      border: "1px solid #e2e8f0", transition: "transform 0.2s"
    }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
    >
      <img
        src={image || "https://placehold.co/128x192?text=No+Cover"}
        alt={title}
        style={{ width: "100%", height: 190, objectFit: "cover", background: "#f1f5f9" }}
        onError={e => { e.target.src = "https://placehold.co/128x192?text=No+Cover"; }}
      />
      <div style={{ padding: "0.8rem" }}>
        <p style={{ fontWeight: 600, fontSize: 13, margin: 0, lineHeight: 1.4,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          color: "#1e293b" }} title={title}>{title}</p>
        <p style={{ color: "#64748b", fontSize: 12, margin: "3px 0 8px" }}>{author}</p>
        {showRating && book.avg_rating && (
          <div style={{ fontSize: 13, marginBottom: 8, color: "#f59e0b" }}>
            {stars(book.avg_rating)}
            <span style={{ color: "#94a3b8", marginLeft: 4, fontSize: 11 }}>
              {Number(book.avg_rating).toFixed(1)}
            </span>
          </div>
        )}
        {showSwap && (
          <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
            {book.condition && (
              <span style={{ fontSize: 11, background: "#f0f9ff", color: "#0369a1",
                padding: "2px 6px", borderRadius: 4 }}>{book.condition}</span>
            )}
            {book.city && (
              <span style={{ fontSize: 11, background: "#f0fdf4", color: "#166534",
                padding: "2px 6px", borderRadius: 4 }}>{book.city}</span>
            )}
          </div>
        )}
        <div style={{ display: "flex", gap: 6 }}>
          {onFindSimilar && (
            <button onClick={() => onFindSimilar(title)} style={{
              flex: 1, padding: "6px 0", fontSize: 11, background: "#3b82f6",
              color: "#fff", border: "none", borderRadius: 5, cursor: "pointer"
            }}>Find Similar</button>
          )}
          {onRequestSwap && (
            <button onClick={() => onRequestSwap(book)} style={{
              flex: 1, padding: "6px 0", fontSize: 11, background: "#10b981",
              color: "#fff", border: "none", borderRadius: 5, cursor: "pointer"
            }}>Request Swap</button>
          )}
        </div>
      </div>
    </div>
  );
}
