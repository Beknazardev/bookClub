import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getFavorites } from "../services/favoriteService";

export default function Profile() {
  const navigate = useNavigate();

  const savedUser = JSON.parse(localStorage.getItem("bookclubUser"));
  const currentUserEmail = savedUser?.email;

  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    bio: "",
    avatar: "",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    if (!currentUserEmail) {
      navigate("/login");
      return;
    }

    async function fetchProfile() {
      try {
        const userRes = await axios.get(
          `http://localhost:5000/api/users/profile/${currentUserEmail}`
        );
        setUser(userRes.data);

        setForm({
          firstName: userRes.data.firstName || "",
          lastName: userRes.data.lastName || "",
          username: userRes.data.username || "",
          bio: userRes.data.bio || "",
          avatar: userRes.data.avatar || "",
        });

        const favoritesRes = await getFavorites(currentUserEmail);
        setFavorites(favoritesRes);
      } catch (error) {
        console.error("Profile fetch error:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [currentUserEmail, navigate]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];

    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  }

  async function handleUploadAvatar() {
    if (!avatarFile) {
      alert("Select an image first");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("email", currentUserEmail);
      formData.append("avatar", avatarFile);

      const res = await axios.post(
        "http://localhost:5000/api/users/upload-avatar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUser(res.data.user);
      setForm((prev) => ({
        ...prev,
        avatar: res.data.user.avatar,
      }));

      localStorage.setItem("bookclubUser", JSON.stringify(res.data.user));
      setAvatarFile(null);
      setAvatarPreview("");

      alert("Avatar uploaded successfully");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to upload avatar");
    }
  }

  async function handleSaveProfile(e) {
    e.preventDefault();

    try {
      const res = await axios.put("http://localhost:5000/api/users/profile", {
        email: currentUserEmail,
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        bio: form.bio,
        avatar: form.avatar,
      });

      setUser(res.data.user);
      localStorage.setItem("bookclubUser", JSON.stringify(res.data.user));

      alert("Profile updated successfully");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to update profile");
    }
  }

  function handleLogout() {
    localStorage.removeItem("bookclubUser");
    navigate("/login");
  }

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

  if (!user) {
    return (
      <div className="dashboard">
        <div className="container">
          <div className="glass-card" style={{ padding: "24px" }}>
            User not found.
          </div>
        </div>
      </div>
    );
  }

  const displayedAvatar = avatarPreview || form.avatar;
  const avatarLetter =
    form.firstName?.charAt(0)?.toUpperCase() ||
    form.username?.charAt(0)?.toUpperCase() ||
    "U";

  return (
    <div className="dashboard">
      <div className="container">
        <div
          className="glass-card"
          style={{
            padding: "28px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "20px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            {displayedAvatar ? (
              <img
                src={displayedAvatar}
                alt={form.username}
                style={{
                  width: "110px",
                  height: "110px",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  width: "110px",
                  height: "110px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, rgba(212,168,95,.95), rgba(97,122,255,.85))",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "36px",
                  fontWeight: 800,
                  color: "#0b1020",
                }}
              >
                {avatarLetter}
              </div>
            )}

            <div style={{ flex: 1 }}>
              <p style={{ color: "#d4a85f", margin: "0 0 8px", fontWeight: 700 }}>
                My Profile
              </p>
              <h1 className="section-title" style={{ marginBottom: 10 }}>
                {user.firstName} {user.lastName}
              </h1>
              <div style={{ color: "#a9b2d0", marginBottom: 10 }}>
                @{user.username}
              </div>
              <div className="section-subtitle">
                {user.bio || "You have not added a bio yet."}
              </div>
            </div>

            <button className="secondary-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "20px",
            marginBottom: "24px",
          }}
        >
          <div className="glass-card" style={{ padding: "24px" }}>
            <h2 style={{ marginTop: 0, marginBottom: "18px" }}>Edit Profile</h2>

            <form onSubmit={handleSaveProfile} style={{ display: "grid", gap: "14px" }}>
              <input
                className="input"
                name="firstName"
                placeholder="First name"
                value={form.firstName}
                onChange={handleChange}
              />

              <input
                className="input"
                name="lastName"
                placeholder="Last name"
                value={form.lastName}
                onChange={handleChange}
              />

              <input
                className="input"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
              />

              <textarea
                className="textarea"
                name="bio"
                placeholder="Tell us about yourself"
                value={form.bio}
                onChange={handleChange}
              />

              <div
                style={{
                  padding: "16px",
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,.08)",
                  background: "rgba(255,255,255,.03)",
                  display: "grid",
                  gap: "12px",
                }}
              >
                <label style={{ fontWeight: 700 }}>Upload avatar</label>

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleAvatarChange}
                />

                {avatarPreview && (
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "16px",
                      border: "1px solid rgba(255,255,255,.08)",
                    }}
                  />
                )}

                <button
                  type="button"
                  className="secondary-btn"
                  onClick={handleUploadAvatar}
                >
                  Upload Avatar
                </button>
              </div>

              <button className="primary-btn" type="submit">
                Save Changes
              </button>
            </form>
          </div>

          <div className="glass-card" style={{ padding: "24px" }}>
            <h2 style={{ marginTop: 0, marginBottom: "18px" }}>My Favorites</h2>

            {favorites.length === 0 ? (
              <p className="section-subtitle">No favorite books yet.</p>
            ) : (
              <div className="books-grid">
                {favorites.map((book) => (
                  <article key={book._id} className="glass-card book-card">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="book-cover"
                    />

                    <p className="book-meta">
                      {book.genre} • ⭐ {book.averageRating || 0} ({book.ratingsCount || 0})
                    </p>

                    <h3 className="book-title">{book.title}</h3>
                    <div className="book-author">{book.author}</div>

                    <div className="book-card-footer">
                      <Link to={`/books/${book._id}`} className="secondary-btn">
                        Open
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}