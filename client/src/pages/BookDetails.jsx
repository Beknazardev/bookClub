import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { getFavorites, toggleFavorite } from "../services/favoriteService";

export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const savedUser = JSON.parse(localStorage.getItem("bookclubUser"));
  const currentUserEmail = savedUser?.email;

  const [book, setBook] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!currentUserEmail) {
      navigate("/login");
      return;
    }

    async function fetchBook() {
      try {
        const res = await axios.get(`http://localhost:5000/api/books/${id}`);
        setBook(res.data);
      } catch (error) {
        console.error("Fetch book details error:", error);
      }
    }

    async function fetchComments() {
      try {
        const res = await axios.get(`http://localhost:5000/api/comments/${id}`);
        setComments(res.data);
      } catch (error) {
        console.error("Fetch comments error:", error);
      }
    }

    async function fetchFavoriteStatus() {
      try {
        const favorites = await getFavorites(currentUserEmail);
        const exists = favorites.some((fav) => fav._id === id);
        setIsFavorite(exists);
      } catch (error) {
        console.error("Fetch favorite status error:", error);
      }
    }

    fetchBook();
    fetchComments();
    fetchFavoriteStatus();
  }, [id, currentUserEmail, navigate]);

  async function handleAddComment(e) {
    e.preventDefault();

    if (!commentText.trim()) {
      alert("Comment cannot be empty");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/api/comments", {
        email: currentUserEmail,
        bookId: id,
        text: commentText,
        rating,
      });

      setComments((prev) => [res.data.comment, ...prev]);
      setBook(res.data.book);
      setCommentText("");
      setRating(5);
      setHoveredRating(0);
      alert("Comment added");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to add comment");
    }
  }

  async function handleDeleteComment(commentId) {
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/comments/${commentId}`,
        {
          data: { email: currentUserEmail },
        }
      );

      setComments((prev) => prev.filter((comment) => comment._id !== commentId));
      setBook(res.data.book);
      alert("Comment deleted");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to delete comment");
    }
  }

  async function handleToggleFavorite() {
    try {
      const res = await toggleFavorite(currentUserEmail, id);

      if (res.message === "Book added to favorites") {
        setIsFavorite(true);
      } else {
        setIsFavorite(false);
      }

      alert(res.message);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to update favorites");
    }
  }

  function renderStars(value, interactive = false) {
    return [1, 2, 3, 4, 5].map((star) => {
      const active = interactive
        ? star <= (hoveredRating || rating)
        : star <= Math.round(value);

      return (
        <button
          key={star}
          type={interactive ? "button" : "button"}
          onClick={interactive ? () => setRating(star) : undefined}
          onMouseEnter={interactive ? () => setHoveredRating(star) : undefined}
          onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
          style={{
            border: "none",
            background: "transparent",
            cursor: interactive ? "pointer" : "default",
            fontSize: interactive ? "28px" : "18px",
            lineHeight: 1,
            padding: 0,
            color: active ? "#f4c86a" : "#4c567a",
            transition: "color 0.2s ease, transform 0.2s ease",
            transform: interactive && active ? "scale(1.08)" : "scale(1)",
          }}
        >
          ★
        </button>
      );
    });
  }

  function getCommentAuthor(comment) {
    const firstName = comment.user?.firstName || "";
    const lastName = comment.user?.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || comment.user?.username || "Unknown user";
  }

  function getAvatarFallback(comment) {
    const firstName = comment.user?.firstName || "";
    const username = comment.user?.username || "";
    return (firstName.charAt(0) || username.charAt(0) || "U").toUpperCase();
  }

  if (!book) {
    return (
      <div className="dashboard">
        <div className="container">
          <div className="glass-card" style={{ padding: "30px" }}>
            Loading book...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div
          className="glass-card"
          style={{
            padding: "28px",
            display: "grid",
            gridTemplateColumns: "320px 1fr",
            gap: "28px",
            marginBottom: "24px",
          }}
        >
          <img
            src={book.coverImage}
            alt={book.title}
            style={{
              width: "100%",
              borderRadius: "24px",
              aspectRatio: "3 / 4",
              objectFit: "cover",
            }}
          />

          <div>
            <p style={{ color: "#d4a85f", margin: "0 0 8px", fontWeight: 700 }}>
              Book Details
            </p>

            <h1 className="section-title" style={{ marginBottom: 10 }}>
              {book.title}
            </h1>

            <div style={{ color: "#a9b2d0", marginBottom: 18, fontSize: 18 }}>
              {book.author}
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "20px",
              }}
            >
              <span className="genre-chip active">{book.genre}</span>
              <span className="genre-chip">{book.year}</span>

              <div
                className="genre-chip"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div style={{ display: "flex", gap: "2px" }}>
                  {renderStars(book.averageRating || 0, false)}
                </div>
                <span>
                  {book.averageRating || 0} ({book.ratingsCount || 0})
                </span>
              </div>
            </div>

            <p className="section-subtitle" style={{ maxWidth: 760 }}>
              {book.description}
            </p>

            <div
              style={{
                display: "flex",
                gap: "14px",
                flexWrap: "wrap",
                marginTop: "24px",
              }}
            >
              <button className="primary-btn" onClick={handleToggleFavorite}>
                {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              </button>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "24px" }}>
          <h2 style={{ marginTop: 0, marginBottom: 18 }}>Discussion</h2>

          <form
            onSubmit={handleAddComment}
            style={{
              display: "grid",
              gap: "14px",
              marginBottom: "24px",
            }}
          >
            <textarea
              className="textarea"
              placeholder="Write your thoughts about this book..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                flexWrap: "wrap",
              }}
            >
              <span style={{ color: "#a9b2d0" }}>Your rating:</span>

              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  alignItems: "center",
                }}
              >
                {renderStars(rating, true)}
              </div>

              <span style={{ color: "#d4a85f", fontWeight: 700 }}>
                {rating}/5
              </span>
            </div>

            <button className="primary-btn" style={{ width: "fit-content" }}>
              Post Comment
            </button>
          </form>

          <div style={{ display: "grid", gap: "14px" }}>
            {comments.length === 0 ? (
              <p className="section-subtitle">No comments yet.</p>
            ) : (
              comments.map((comment) => {
                const isOwnComment = comment.user?.email === currentUserEmail;

                return (
                  <div
                    key={comment._id}
                    style={{
                      padding: "16px",
                      borderRadius: "18px",
                      border: "1px solid rgba(255,255,255,.08)",
                      background: "rgba(255,255,255,.03)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "16px",
                        alignItems: "flex-start",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "14px",
                          alignItems: "flex-start",
                          flex: 1,
                        }}
                      >
                        <Link
                          to={`/users/${comment.user?._id}`}
                          style={{
                            display: "flex",
                            gap: "14px",
                            alignItems: "flex-start",
                            textDecoration: "none",
                            color: "inherit",
                            flex: 1,
                          }}
                        >
                          {comment.user?.avatar ? (
                            <img
                              src={comment.user.avatar}
                              alt={getCommentAuthor(comment)}
                              style={{
                                width: "52px",
                                height: "52px",
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: "1px solid rgba(255,255,255,.08)",
                                flexShrink: 0,
                                cursor: "pointer",
                              }}
                            />
                          ) : (
                            <div
                              style={{
                                width: "52px",
                                height: "52px",
                                borderRadius: "50%",
                                background:
                                  "linear-gradient(135deg, rgba(212,168,95,.95), rgba(97,122,255,.85))",
                                display: "grid",
                                placeItems: "center",
                                fontWeight: 800,
                                color: "#0b1020",
                                flexShrink: 0,
                                cursor: "pointer",
                              }}
                            >
                              {getAvatarFallback(comment)}
                            </div>
                          )}

                          <div style={{ flex: 1 }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                gap: "12px",
                                marginBottom: "8px",
                                flexWrap: "wrap",
                              }}
                            >
                              <strong>{getCommentAuthor(comment)}</strong>

                              <span style={{ color: "#a9b2d0", fontSize: 14 }}>
                                {new Date(comment.createdAt).toLocaleString()}
                              </span>
                            </div>

                            <div
                              style={{
                                display: "flex",
                                gap: "2px",
                                marginBottom: "10px",
                              }}
                            >
                              {renderStars(comment.rating, false)}
                            </div>

                            <div style={{ color: "#dbe3ff", lineHeight: 1.6 }}>
                              {comment.text}
                            </div>
                          </div>
                        </Link>
                      </div>

                      {isOwnComment && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comment._id)}
                          style={{
                            border: "1px solid rgba(255,255,255,.08)",
                            background: "rgba(255,255,255,.03)",
                            color: "#ffb1b1",
                            borderRadius: "12px",
                            padding: "10px 12px",
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}