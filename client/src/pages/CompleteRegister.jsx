import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function CompleteRegister() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "";

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    confirmPassword: "",
    bio: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (form.password.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }

    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await axios.post("https://bookclub-1-64ys.onrender.com/api/auth/complete-register", {
        email,
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        password: form.password,
        bio: form.bio,
      });

      alert("Registration completed successfully");
      navigate("/login");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Registration failed");
    }
  }

  return (
    <div className="auth-layout">
      <div className="glass-card auth-card">
        <p style={{ color: "#d4a85f", marginTop: 0, fontWeight: 700 }}>
          Complete Profile
        </p>

        <h1 className="section-title">Finish registration</h1>

        <p className="section-subtitle">
          Create your reading identity inside BookClub.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            className="input"
            name="firstName"
            placeholder="First name"
            value={form.firstName}
            onChange={handleChange}
            required
          />

          <input
            className="input"
            name="lastName"
            placeholder="Last name"
            value={form.lastName}
            onChange={handleChange}
            required
          />

          <input
            className="input"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            required
          />

          <input
            className="input"
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            minLength={8}
          />

          <p
            style={{
              margin: "-4px 0 0",
              color: "#a9b2d0",
              fontSize: "14px",
            }}
          >
            Password must contain at least 8 characters.
          </p>

          <input
            className="input"
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            minLength={8}
          />

          <textarea
            className="textarea"
            name="bio"
            placeholder="Tell us about yourself"
            value={form.bio}
            onChange={handleChange}
          />

          <button className="primary-btn" type="submit">
            Finish Registration
          </button>
        </form>
      </div>
    </div>
  );
}