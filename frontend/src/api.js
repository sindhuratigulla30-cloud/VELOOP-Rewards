
const API_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? "http://localhost:5000"
    : "https://veloop-rewards-backend-three.vercel.app")
).replace(/\/+$/, "");

export default API_URL;
