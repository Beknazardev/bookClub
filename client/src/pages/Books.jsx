import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import BookCard from "../components/BookCard";

export default function Books() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [activeGenre, setActiveGenre] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBooks() {
      try {
        const res = await axios.get("https://bookclub-r1r8.onrender.com/api/books");
        setBooks(res.data);
      } catch (error) {
        console.error("Fetch books error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, []);

  const genres = useMemo(() => {
    const allGenres = books.map((book) => book.genre);
    return ["All", ...new Set(allGenres)];
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter((book) => {
      const matchesSearch = `${book.title} ${book.author} ${book.genre}`
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesGenre =
        activeGenre === "All" ? true : book.genre === activeGenre;

      return matchesSearch && matchesGenre;
    });
  }, [books, search, activeGenre]);

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-top">
          <div>
            <p style={{ color: "#d4a85f", margin: "0 0 8px", fontWeight: 700 }}>
              Book Dashboard
            </p>
            <h1 className="section-title" style={{ marginBottom: 8 }}>
              Explore your next favorite story
            </h1>
            <p className="section-subtitle">
              Browse the book collection available in the system.
            </p>
          </div>
        </div>

        <div className="search-box">
          <input
            className="input"
            placeholder="Search books..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="genre-row">
          {genres.map((genre) => (
            <button
              key={genre}
              className={`genre-chip ${activeGenre === genre ? "active" : ""}`}
              onClick={() => setActiveGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>

        <section style={{ marginBottom: "32px" }}>
          <h2 style={{ marginBottom: "16px" }}>My BookClub Library</h2>

          {loading ? (
            <div className="glass-card" style={{ padding: "24px" }}>
              Loading books...
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="glass-card" style={{ padding: "24px" }}>
              No books found.
            </div>
          ) : (
            <div className="books-grid">
              {filteredBooks.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}