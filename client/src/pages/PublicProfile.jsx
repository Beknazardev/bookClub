import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPublicUserProfile } from "../services/userService";

export default function PublicProfile() {
  const { id } = useParams();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUser() {
      try {
        setLoading(true);
        setError("");

        const data = await getPublicUserProfile(id);
        setUser(data);
      } catch (error) {
        console.error("Public profile error:", error);
        setError(error.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="container">
          <div className="glass-card" style={{ padding: "24px" }}>
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="container">
          <div
            className="glass-card"
            style={{ padding: "24px", color: "#ff8a8a" }}
          >
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dashboard">
        <div className="container">
          <div className="glass-card" style={{ padding: "24px" }}>
            User not found
          </div>
        </div>
      </div>
    );
  }

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  const displayName = fullName || user.username || "Unknown user";
  const avatarLetter = (
    user.firstName?.charAt(0) ||
    user.username?.charAt(0) ||
    "U"
  ).toUpperCase();

  return (
    <div className="dashboard">
      <div className="container">
        <div style={{ marginBottom: "18px" }}>
          <Link
            to="/books"
            style={{
              color: "#d4a85f",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            ← Back to books
          </Link>
        </div>

        <div
          className="glass-card"
          style={{
            padding: "32px",
            display: "grid",
            gap: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "24px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={displayName}
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "1px solid rgba(255,255,255,.1)",
                }}
              />
            ) : (
              <div
                style={{
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, rgba(212,168,95,.95), rgba(97,122,255,.85))",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                  fontSize: "38px",
                  color: "#0b1020",
                }}
              >
                {avatarLetter}
              </div>
            )}

            <div>
              <p
                style={{
                  color: "#d4a85f",
                  margin: "0 0 8px",
                  fontWeight: 700,
                }}
              >
                Public Profile
              </p>

              <h1 className="section-title" style={{ marginBottom: 10 }}>
                {displayName}
              </h1>

              <div style={{ color: "#a9b2d0", marginBottom: 10 }}>
                @{user.username}
              </div>

              <div style={{ color: "#dbe3ff", lineHeight: 1.7 }}>
                {user.bio?.trim() || "This user has not added a bio yet."}
              </div>
            </div>
          </div>

          <div
            style={{
              padding: "18px",
              borderRadius: "18px",
              background: "rgba(255,255,255,.03)",
              border: "1px solid rgba(255,255,255,.08)",
            }}
          >
            <div style={{ color: "#a9b2d0", marginBottom: 8 }}>Joined</div>
            <div style={{ color: "#dbe3ff" }}>
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "Unknown"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}