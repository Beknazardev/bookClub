import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
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

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", form);

      localStorage.setItem("bookclubUser", JSON.stringify(res.data.user));

      alert("Login successful");
      navigate("/profile");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Login failed");
    }
  }

  return (
    <div className="auth-layout">
      <div className="glass-card auth-card">
        <p style={{ color: "#d4a85f", marginTop: 0, fontWeight: 700 }}>
          Welcome Back
        </p>
        <h1 className="section-title">Sign in to BookClub</h1>
        <p className="section-subtitle">
          Continue exploring books, comments, and your personal collection.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            className="input"
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            className="input"
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button className="primary-btn" type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}