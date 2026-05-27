import { API_URL } from "./config.js";

export async function apiFetch(endpoint, options = {}) {

    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}${endpoint}`, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        ...options
    });

    if (!res.ok) {
        console.error("API ERROR:", res.status);
    }

    return res.json();
}
