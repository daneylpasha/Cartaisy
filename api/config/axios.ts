import axios from "axios";

// Backend URL (from environment variable)
const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "";

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
