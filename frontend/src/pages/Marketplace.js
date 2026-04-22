import { useState, useEffect } from "react";
import api from "../api/axios";
import BookCard from "../components/BookCard";

export default function Marketplace() {
  const [books, setBooks]     = useState([]);
  const [myBooks, setMyBooks] = useState([]);
  const [filters, setFilters] = useState({ city: "", pincode: "", genre: "" });
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newBook, setNewBook] = useState({
    title: "", author: "", genre: "", condition: "Good",
    city: "", pincode: "", image_url: ""
  });

  useEffect(() => { fetchBooks(); fetchMyBooks(); }, []);

  const fetchBooks = async () => {
    setLoading(true);
    const params = new URLSearchParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v))
    );
    try {
      const res = await api.get("/books/?" + params);
      setBooks(res.data.books || []);
    } catch {}
    setLoading(false);
  };

  const fetchMyBooks = async () => {
    try {
      const res = await api.get("/books/my");
      setMyBooks(res.data.books || []);
    } catch {}
  };

  const addBook = async (e) => {
    e.preventDefault();
    try {
      await api.post("/books/add", newBook);
      setShowAdd(false);
      setNewBook({ title: "", author: "", genre: "", condition: "Good", city: "", pincode: "", image_url: "" });
      fetchBooks();
      fetchMyBooks();
      alert("Book added!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to add book.");
    }
  };

  const requestSwap = async (book) => {
    const msg = window.prompt("Message to owner (optional):") || "";
    try {
      await api.post("/swap/request", {
        book_id: book.id,
        offered_book_id: myBooks[0]?.id || null,
        message: msg
      });
      alert("Swap request sent!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed.");
    }
  };

  const inp = {
    width: "100%", padding: "8px 10px", borderRadius: 7,
    border: "1px solid #e2e8f0", fontSize: 13, boxSizing: "border-box", outline: "none"
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ color: "#1e293b" }}>Book Swap Marketplace</h2>
        <button onClick={() => setShowAdd(!showAdd)} style={{
          padding: "8px 18px", background: "#10b981", color: "#fff",
          border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600
        }}>
          {showAdd ? "Cancel" : "+ Add My Book"}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={addBook} style={{
          background: "#f8fafc", padding: "1.5rem", borderRadius: 12,
          marginBottom: 24, border: "1px solid #e2e8f0"
        }}>
          <h3 style={{ marginBottom: 16, fontSize: 16, color: "#1e293b" }}>Add Book for Swap</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "#374151" }}>Title *</label>
              <input required value={newBook.title}
                onChange={e => setNewBook({ ...newBook, title: e.target.value })}
                style={{ ...inp, marginTop: 4 }} placeholder="e.g. Harry Potter" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#374151" }}>Author</label>
              <input value={newBook.author}
                onChange={e => setNewBook({ ...newBook, author: e.target.value })}
                style={{ ...inp, marginTop: 4 }} placeholder="e.g. J.K. Rowling" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#374151" }}>Genre</label>
              <input value={newBook.genre}
                onChange={e => setNewBook({ ...newBook, genre: e.target.value })}
                style={{ ...inp, marginTop: 4 }} placeholder="e.g. Fiction" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#374151" }}>Condition</label>
              <select value={newBook.condition}
                onChange={e => setNewBook({ ...newBook, condition: e.target.value })}
                style={{ ...inp, marginTop: 4 }}>
                <option>New</option>
                <option>Good</option>
                <option>Fair</option>
                <option>Poor</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#374151" }}>City</label>
              <input value={newBook.city}
                onChange={e => setNewBook({ ...newBook, city: e.target.value })}
                style={{ ...inp, marginTop: 4 }} placeholder="e.g. Nanded" />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#374151" }}>Pincode</label>
              <input value={newBook.pincode}
                onChange={e => setNewBook({ ...newBook, pincode: e.target.value })}
                style={{ ...inp, marginTop: 4 }} placeholder="e.g. 431606" />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 12, color: "#374151" }}>
              Book Cover Image URL
              <span style={{ color: "#94a3b8", marginLeft: 6, fontWeight: 400 }}>
                (optional — paste image link from Google Images)
              </span>
            </label>
            <input value={newBook.image_url}
              onChange={e => setNewBook({ ...newBook, image_url: e.target.value })}
              style={{ ...inp, marginTop: 4 }}
              placeholder="https://... paste image URL here" />
            {newBook.image_url && (
              <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 12 }}>
                <img src={newBook.image_url} alt="preview"
                  style={{ width: 60, height: 80, objectFit: "cover", borderRadius: 6, border: "1px solid #e2e8f0" }}
                  onError={e => { e.target.style.display = "none"; }}
                />
                <span style={{ fontSize: 12, color: "#10b981" }}>Image preview</span>
              </div>
            )}
          </div>

          <div style={{ marginTop: 6, padding: "8px 12px", background: "#eff6ff",
            borderRadius: 8, fontSize: 12, color: "#1d4ed8" }}>
            How to get image URL: Search book on Google Images ? right click image ? Copy image address ? paste above
          </div>

          <button type="submit" style={{
            marginTop: 16, padding: "9px 24px", background: "#3b82f6",
            color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600
          }}>Submit Book</button>
        </form>
      )}

      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {["city", "pincode", "genre"].map(k => (
          <input key={k} placeholder={"Filter by " + k} value={filters[k]}
            onChange={e => setFilters({ ...filters, [k]: e.target.value })}
            style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }} />
        ))}
        <button onClick={fetchBooks} style={{
          padding: "8px 16px", background: "#3b82f6", color: "#fff",
          border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13
        }}>Apply Filters</button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#94a3b8", padding: "3rem" }}>Loading...</p>
      ) : books.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
          <p style={{ fontSize: 18, marginBottom: 8 }}>No books available yet</p>
          <p style={{ fontSize: 14 }}>Be the first to add a book!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 16 }}>
          {books.map(book => (
            <BookCard key={book.id} book={book} showSwap={true} onRequestSwap={requestSwap} />
          ))}
        </div>
      )}
    </div>
  );
}
