import axios from "axios";

const BASE_URL = "https://cartaisy-backend-production.up.railway.app/api/v1";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});



export default axiosInstance;
export { BASE_URL };
