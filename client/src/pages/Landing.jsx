import { Link } from "react-router-dom";

const featuredBooks = [
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=700&q=80",
  },
  {
    title: "1984",
    author: "George Orwell",
    genre: "Classic",
    image:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=700&q=80",
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    genre: "Sci-Fi",
    image:
      "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=700&q=80",
  },
];

const features = [
  {
    title: "Discover Books",
    text: "Explore curated titles across fantasy, classics, science fiction, romance, and more.",
  },
  {
    title: "Join Discussions",
    text: "Leave comments, rate books, and share your thoughts with other readers.",
  },
  {
    title: "Build Your Shelf",
    text: "Save favorite books and create a personal reading profile inside BookClub.",
  },
];

const steps = [
  {
    number: "01",
    title: "Create an account",
    text: "Register with your email and create your own reading identity.",
  },
  {
    number: "02",
    title: "Verify your email",
    text: "Confirm your account with a secure 6-digit verification code.",
  },
  {
    number: "03",
    title: "Explore and discuss",
    text: "Browse books, rate them, comment on them, and save favorites.",
  },
];

export default function Landing() {
  return (
    <div className="page-shell">
      <section className="hero">
        <div className="container hero-grid">
          <div className="glass-card hero-panel">
            <p style={{ color: "#d4a85f", marginTop: 0, fontWeight: 700 }}>
              Welcome to BookClub
            </p>

            <h1 className="section-title">
              Discover books,
              <br />
              share thoughts,
              <br />
              build your reading space.
            </h1>

            <p className="section-subtitle">
              A premium digital book club where readers explore new stories,
              leave comments, save favorites, rate books, and create a personal
              literary profile.
            </p>

            <div className="hero-actions">
              <Link to="/register-email" className="primary-btn">
                Join Now
              </Link>
              <Link to="/books" className="secondary-btn">
                Explore Books
              </Link>
            </div>
          </div>

          <div className="hero-books">
            <div className="glass-card mini-book">
              <div>
                <h3 style={{ margin: "0 0 8px" }}>Curated collections</h3>
                <p className="section-subtitle">
                  Discover fantasy, classics, sci-fi and more.
                </p>
              </div>
            </div>

            <div className="glass-card mini-book">
              <div>
                <h3 style={{ margin: "0 0 8px" }}>Reader discussions</h3>
                <p className="section-subtitle">
                  Share opinions, leave comments, and discuss books.
                </p>
              </div>
            </div>

            <div className="glass-card mini-book">
              <div>
                <h3 style={{ margin: "0 0 8px" }}>Favorites</h3>
                <p className="section-subtitle">
                  Save your favorite titles and build your own shelf.
                </p>
              </div>
            </div>

            <div className="glass-card mini-book">
              <div>
                <h3 style={{ margin: "0 0 8px" }}>Personal profile</h3>
                <p className="section-subtitle">
                  Create your identity inside the reading community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "24px 0 40px" }}>
        <div className="container">
          <div style={{ marginBottom: "22px" }}>
            <p style={{ color: "#d4a85f", margin: "0 0 8px", fontWeight: 700 }}>
              Featured Books
            </p>
            <h2 style={{ margin: 0, fontSize: "34px" }}>
              Stories that define the community
            </h2>
          </div>

          <div className="books-grid">
            {featuredBooks.map((book) => (
              <article key={book.title} className="glass-card book-card">
                <img
                  src={book.image}
                  alt={book.title}
                  className="book-cover"
                />

                <p className="book-meta">{book.genre}</p>
                <h3 className="book-title">{book.title}</h3>
                <div className="book-author">{book.author}</div>

                <div className="book-card-footer">
                  <Link to="/books" className="secondary-btn">
                    Explore
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "20px 0 40px" }}>
        <div className="container">
          <div
            className="glass-card"
            style={{
              padding: "30px",
            }}
          >
            <p style={{ color: "#d4a85f", margin: "0 0 8px", fontWeight: 700 }}>
              Why BookClub
            </p>

            <h2 style={{ marginTop: 0, marginBottom: "24px", fontSize: "34px" }}>
              A space built for modern readers
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "18px",
              }}
            >
              {features.map((feature) => (
                <div
                  key={feature.title}
                  style={{
                    padding: "20px",
                    borderRadius: "18px",
                    border: "1px solid rgba(255,255,255,.08)",
                    background: "rgba(255,255,255,.03)",
                  }}
                >
                  <h3 style={{ marginTop: 0, marginBottom: "10px" }}>
                    {feature.title}
                  </h3>
                  <p className="section-subtitle">{feature.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ padding: "20px 0 40px" }}>
        <div className="container">
          <div style={{ marginBottom: "22px" }}>
            <p style={{ color: "#d4a85f", margin: "0 0 8px", fontWeight: 700 }}>
              How it works
            </p>
            <h2 style={{ margin: 0, fontSize: "34px" }}>
              Join the reading community in three steps
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "18px",
            }}
          >
            {steps.map((step) => (
              <div key={step.number} className="glass-card" style={{ padding: "24px" }}>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#d4a85f",
                    fontWeight: 800,
                    letterSpacing: "0.08em",
                    marginBottom: "14px",
                  }}
                >
                  {step.number}
                </div>

                <h3 style={{ marginTop: 0, marginBottom: "10px" }}>
                  {step.title}
                </h3>

                <p className="section-subtitle">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "10px 0 60px" }}>
        <div className="container">
          <div
            className="glass-card"
            style={{
              padding: "34px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <p style={{ color: "#d4a85f", margin: "0 0 8px", fontWeight: 700 }}>
                Start your journey
              </p>
              <h2 style={{ margin: 0, fontSize: "34px" }}>
                Create your BookClub account today
              </h2>
            </div>

            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <Link to="/register-email" className="primary-btn">
                Join Now
              </Link>
              <Link to="/books" className="secondary-btn">
                Browse Books
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,.08)",
          padding: "24px 0 40px",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
            color: "#a9b2d0",
          }}
        >
          <div>
            <div className="brand" style={{ marginBottom: "8px" }}>
              Book<span>Club</span>
            </div>
            <div>A modern digital book club for reading and discussion.</div>
          </div>

          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
            <Link to="/">Home</Link>
            <Link to="/books">Books</Link>
            <Link to="/login">Login</Link>
            <Link to="/register-email">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}