const API = "http://127.0.0.1:8000";

function authHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token")
    };
}

// =========================
// CREAR ASAMBLEA
// =========================
async function apiCreateAssembly(name) {

    const res = await fetch(`${API}/assemblies`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ name })
    });

    return res.json();
}

// =========================
// CREAR MOCIÓN
// =========================
async function apiCreateMotion(title, assemblyId) {

    const res = await fetch(`${API}/motions`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
            title,
            assembly_id: assemblyId
        })
    });

    return res.json();
}