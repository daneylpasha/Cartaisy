import { mobileConfig } from "@/api/config/mobileConfig";
import axios from "axios";

// Backend URL (from environment variable)
const BASE_URL = mobileConfig.apiBaseUrl;

// Store ID for multi-tenancy (from environment variable)
const STORE_ID = mobileConfig.storeId;

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
