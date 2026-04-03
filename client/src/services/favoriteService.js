import axios from "axios";

const API_URL = "https://bookclub-1-64ys.onrender.com/api/favorites";

export const toggleFavorite = async (bookId, email) => {
  const res = await axios.post(`${API_URL}/toggle`, { bookId, email });
  return res.data;
};

export const checkFavorite = async (bookId, email) => {
  const res = await axios.get(`${API_URL}/check`, {
    params: { bookId, email },
  });
  return res.data;
};

export const getFavorites = async (email) => {
  const res = await axios.get(`${API_URL}/${email}`);
  return res.data;
};