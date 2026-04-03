import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function VerifyCode() {
  const [code, setCode] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      await axios.post("https://bookclub-1-64ys.onrender.com/api/auth/verify-code", {
        email,
        code,
      });

      alert("Code verified successfully");
      navigate("/complete-register", { state: { email } });
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Invalid code");
    }
  }

  return (
    <div className="auth-layout">
      <div className="glass-card auth-card">
        <p style={{ color: "#d4a85f", marginTop: 0, fontWeight: 700 }}>
          Verify Email
        </p>
        <h1 className="section-title">Enter your code</h1>
        <p className="section-subtitle">
          We sent a 6-digit code to your email. Enter it below to continue.
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            className="input"
            type="text"
            placeholder="6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            required
          />

          <button className="primary-btn" type="submit">
            Verify Code
          </button>
        </form>
      </div>
    </div>
  );
}