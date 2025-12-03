import axios from "axios";

const BASE_URL = "https://cartaisy-backend-production.up.railway.app/api/v1";

// Store ID for multi-tenancy (from environment variable)
const STORE_ID = process.env.EXPO_PUBLIC_STORE_ID || "";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    "X-Store-ID": STORE_ID,
  },
});



export default axiosInstance;
export { BASE_URL };
