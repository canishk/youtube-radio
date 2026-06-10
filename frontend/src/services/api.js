import axios from "axios";

const api = axios.create({
    baseURL: "/api",
    headers: { "Cache-Control": "no-cache" },
});


export default api;