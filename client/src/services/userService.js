import axios from "axios";

const API_URL = "http://localhost:5000/api/users";

export async function getPublicUserProfile(userId) {
  const res = await axios.get(`${API_URL}/public/${userId}`);
  return res.data;
}