import axios from "axios";

const API = "https://bookclub-r1r8.onrender.com/api";

export async function getPublicUserProfile(userId) {
  const res = await axios.get(`${API_URL}/public/${userId}`);
  return res.data;
}