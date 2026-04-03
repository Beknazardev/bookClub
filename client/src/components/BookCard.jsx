import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFavorites, toggleFavorite } from "../services/favoriteService";

export default function BookCard({ book }) {
  const savedUser = JSON.parse(localStorage.getItem("bookclubUser"));
  const currentUserEmail = savedUser?.email;

  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFavorite, setLoadingFavorite] = useState(false);

  useEffect(() => {
    async function checkFavorite() {
      if (!currentUserEmail || !book?._id) return;

      try {
        const favorites = await getFavorites(currentUserEmail);
        const exists = favorites.some((fav) => fav._id === book._id);
        setIsFavorite(exists);
      } catch (error) {
        console.error("Check favorite error:", error);
      }
    }

    checkFavorite();
  }, [currentUserEmail, book?._id]);

  async function handleFavoriteClick(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUserEmail) {
      alert("Please login first");
      return;
    }

    try {
      setLoadingFavorite(true);

      const res = await toggleFavorite(currentUserEmail, book._id);

      if (res.message === "Book added to favorites") {
        setIsFavorite(true);
      } else {
        setIsFavorite(false);
      }
    } catch (error) {
      console.error("Toggle favorite error:", error);
      alert(error.response?.data?.message || "Failed to update favorites");
    } finally {
      setLoadingFavorite(false);
    }
  }

  return (
    <article className="glass-card book-card">
      <img src={book.coverImage} alt={book.title} className="book-cover" />

      <p className="book-meta">
        {book.genre} • ⭐ {book.averageRating || 0} ({book.ratingsCount || 0})
      </p>

      <h3 className="book-title">{book.title}</h3>
      <div className="book-author">{book.author}</div>

      <div className="book-card-footer">
        <Link to={`/books/${book._id}`} className="secondary-btn">
          Open
        </Link>

        <button
          type="button"
          onClick={handleFavoriteClick}
          disabled={loadingFavorite}
          style={{
            width: "54px",
            height: "54px",
            borderRadius: "18px",
            border: "1px solid rgba(255,255,255,.08)",
            background: isFavorite
              ? "rgba(212,168,95,.18)"
              : "rgba(255,255,255,.03)",
            color: isFavorite ? "#f4c86a" : "#a9b2d0",
            cursor: "pointer",
            fontSize: "22px",
            display: "grid",
            placeItems: "center",
            transition: "0.2s ease",
          }}
          title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? "♥" : "♡"}
        </button>
      </div>
    </article>
  );
}