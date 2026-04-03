import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <Link to="/" className="brand">
          Book<span>Club</span>
        </Link>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/books">Books</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/login">Login</Link>
          <Link to="/register-email">Register</Link>
        </nav>
      </div>
    </header>
  );
}