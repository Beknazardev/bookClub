import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function EmailStep() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await axios.post("https://bookclub-1-64ys.onrender.com/api/auth/send-verification", {
        email,
      });

      alert("Verification code sent to your email");
      navigate("/verify-code", { state: { email } });
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to send code");
    }
  }

  return (
    <div className="auth-layout">
      <div className="glass-card auth-card">
        <p style={{ color: "#d4a85f", marginTop: 0, fontWeight: 700 }}>
          BookClub Access
        </p>
        <h1 className="section-title">Create your account</h1>
        <p className="section-subtitle">
          Enter your email and we will send you a 6-digit verification code.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            className="input"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button className="primary-btn" type="submit">
            Send Code
          </button>
        </form>

        <p className="auth-note">Continue your reading journey with BookClub.</p>
      </div>
    </div>
  );
}