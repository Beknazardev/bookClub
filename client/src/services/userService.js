import axios from "axios";

const API = "https://bookclub-1-64ys.onrender.com/api/users";

export async function getPublicUserProfile(userId) {
  const res = await axios.get(`${API_URL}/public/${userId}`);
  return res.data;
}