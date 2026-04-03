const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const PendingUser = require("./models/PendingUser");
const User = require("./models/User");
const Book = require("./models/Book");
const Comment = require("./models/Comment");
const booksData = require("./data/books");
const sendVerificationEmail = require("./utils/sendEmail");

const app = express();

const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "avatar-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only jpg, jpeg, png, webp files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.log("MongoDB error:", error);
  });

async function updateBookRating(bookId) {
  const comments = await Comment.find({ book: bookId });

  if (comments.length === 0) {
    await Book.findByIdAndUpdate(bookId, {
      averageRating: 0,
      ratingsCount: 0,
    });
    return;
  }

  const total = comments.reduce((sum, comment) => sum + comment.rating, 0);
  const average = total / comments.length;

  await Book.findByIdAndUpdate(bookId, {
    averageRating: Number(average.toFixed(1)),
    ratingsCount: comments.length,
  });
}

app.get("/", (req, res) => {
  res.json({ message: "Server is working" });
});

//auth

app.post("/api/auth/send-verification", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15);

    const existingPendingUser = await PendingUser.findOne({ email });

    if (existingPendingUser) {
      existingPendingUser.code = code;
      existingPendingUser.isVerified = false;
      existingPendingUser.expiresAt = expiresAt;
      await existingPendingUser.save();
    } else {
      await PendingUser.create({
        email,
        code,
        expiresAt,
      });
    }

    await sendVerificationEmail(email, code);

    res.json({
      message: "Verification code sent successfully",
      email,
    });
  } catch (error) {
    console.log("Send verification error:", error);
    res.status(500).json({
      message: "Failed to send verification code",
      error: error.message,
    });
  }
});

app.post("/api/auth/verify-code", async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const pendingUser = await PendingUser.findOne({ email });

    if (!pendingUser) {
      return res.status(400).json({ message: "Pending user not found" });
    }

    if (pendingUser.expiresAt < new Date()) {
      return res.status(400).json({ message: "Code expired" });
    }

    if (pendingUser.code !== code) {
      return res.status(400).json({ message: "Invalid code" });
    }

    pendingUser.isVerified = true;
    await pendingUser.save();

    res.json({
      message: "Code verified successfully",
      email: pendingUser.email,
    });
  } catch (error) {
    console.log("Verify code error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/auth/complete-register", async (req, res) => {
  try {
    const { email, firstName, lastName, username, password, bio } = req.body;

    if (!email || !firstName || !lastName || !username || !password) {
      return res.status(400).json({
        message:
          "Email, first name, last name, username and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    const pendingUser = await PendingUser.findOne({ email });

    if (!pendingUser) {
      return res.status(400).json({ message: "Pending user not found" });
    }

    if (!pendingUser.isVerified) {
      return res.status(400).json({ message: "Email is not verified" });
    }

    if (pendingUser.expiresAt < new Date()) {
      return res.status(400).json({ message: "Code expired" });
    }

    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      bio: bio || "",
      isVerified: true,
    });

    await PendingUser.deleteOne({ _id: pendingUser._id });

    res.status(201).json({
      message: "Registration completed successfully",
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        username: newUser.username,
        email: newUser.email,
        bio: newUser.bio,
        avatar: newUser.avatar,
      },
    });
  } catch (error) {
    console.log("Complete register error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.log("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//книги

app.get("/api/books", async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    console.log("Get books error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/books/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    console.log("Get one book error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/books/seed", async (req, res) => {
  try {
    const existingBooks = await Book.countDocuments();

    if (existingBooks > 0) {
      return res
        .status(400)
        .json({ message: "Books already exist in database" });
    }

    const insertedBooks = await Book.insertMany(booksData);

    res.status(201).json({
      message: "Books seeded successfully",
      count: insertedBooks.length,
    });
  } catch (error) {
    console.log("Seed books error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//комментарии

app.get("/api/comments/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    const comments = await Comment.find({ book: bookId })
      .populate("user", "firstName lastName username avatar email")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    console.log("Get comments error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/comments", async (req, res) => {
  try {
    const { email, bookId, text, rating } = req.body;

    if (!email || !bookId || !text || !rating) {
      return res.status(400).json({
        message: "Email, bookId, text and rating are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be from 1 to 5" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const comment = await Comment.create({
      text,
      rating,
      user: user._id,
      book: bookId,
    });

    await updateBookRating(bookId);

    const populatedComment = await Comment.findById(comment._id).populate(
      "user",
      "firstName lastName username avatar email"
    );

    const updatedBook = await Book.findById(bookId);

    res.status(201).json({
      message: "Comment added successfully",
      comment: populatedComment,
      book: updatedBook,
    });
  } catch (error) {
    console.log("Add comment error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/api/comments/:commentId", async (req, res) => {
  try {
    const { commentId } = req.params;
    const { email } = req.body;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid comment id" });
    }

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "You can delete only your own comments" });
    }

    const bookId = comment.book;

    await Comment.findByIdAndDelete(commentId);
    await updateBookRating(bookId);

    const updatedBook = await Book.findById(bookId);

    res.json({
      message: "Comment deleted successfully",
      book: updatedBook,
    });
  } catch (error) {
    console.log("Delete comment error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//избранные

app.post("/api/favorites/toggle", async (req, res) => {
  try {
    const { email, bookId } = req.body;

    if (!email || !bookId) {
      return res
        .status(400)
        .json({ message: "Email and bookId are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "Invalid book id" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const book = await Book.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    const isFavorite = user.favorites.some(
      (favoriteId) => favoriteId.toString() === bookId
    );

    if (isFavorite) {
      user.favorites = user.favorites.filter(
        (favoriteId) => favoriteId.toString() !== bookId
      );
    } else {
      user.favorites.push(bookId);
    }

    await user.save();

    res.json({
      message: isFavorite
        ? "Book removed from favorites"
        : "Book added to favorites",
      favorites: user.favorites,
    });
  } catch (error) {
    console.log("Toggle favorite error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/favorites/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email }).populate("favorites");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.favorites);
  } catch (error) {
    console.log("Get favorites error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

//профиль

app.get("/api/users/profile/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.log("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/users/profile", async (req, res) => {
  try {
    const { email, firstName, lastName, username, bio, avatar } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });

      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
    }

    user.firstName = firstName ?? user.firstName;
    user.lastName = lastName ?? user.lastName;
    user.username = username ?? user.username;
    user.bio = bio ?? user.bio;
    user.avatar = avatar ?? user.avatar;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.log("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/users/upload-avatar", upload.single("avatar"), async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Avatar file is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

const avatarPath = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    user.avatar = avatarPath;
    await user.save();

    res.json({
      message: "Avatar uploaded successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.log("Upload avatar error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
app.get("/api/users/public/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const user = await User.findById(id).select(
      "firstName lastName username bio avatar createdAt"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.log("Get public profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
});