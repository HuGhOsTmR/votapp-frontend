import { API_URL } from "./config.js";

// ==========================
// 🔹 FETCH BASE REUTILIZABLE
// ==========================
export async function apiFetch(endpoint, options = {}) {

    const token = localStorage.getItem("token");

    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                ...(options.headers || {}) // permite extender headers
            },
            ...options
        });

        // ==========================
        // ⚠️ ERROR HTTP
        // ==========================
        if (!res.ok) {

            let errorData = {};

            try {
                errorData = await res.json();
            } catch {
                // puede venir vacío
            }

            console.error("❌ API ERROR:", res.status, errorData);

            throw new Error(
                errorData.detail || 
                errorData.message || 
                `HTTP ${res.status}`
            );
        }

        // ==========================
        // ✅ RESPUESTA JSON
        // ==========================
        return await res.json();

    } catch (error) {

        console.error("🔥 FETCH FALLÓ:", error);

        throw error;
    }
}
