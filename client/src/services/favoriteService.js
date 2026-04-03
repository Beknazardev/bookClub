import axios from "axios";

const API = "https://bookclub-1-64ys.onrender.com/api/favorites";

export async function toggleFavorite(email, bookId) {
  const res = await axios.post(`${API_URL}/toggle`, {
    email,
    bookId,
  });
  return res.data;
}

export async function getFavorites(email) {
  const res = await axios.get(`${API_URL}/${email}`);
  return res.data;
}