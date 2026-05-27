// ==========================
// 🌐 CONFIGURACIÓN
// ==========================

// LOCAL
//const WS_URL = "ws://127.0.0.1:8000/ws";

// PRODUCCIÓN (cuando uses Render)
const WS_URL = "wss://votapp-backend-g856.onrender.com/ws";

// ==========================
// 🔌 CONEXIÓN WS
// ==========================
function connectWS(token, assemblyId, handler) {

    if (!token) {
        console.error("❌ No hay token");
        return;
    }

    if (!assemblyId) {
        console.error("❌ No hay assembly_id");
        return;
    }

    const url = `${WS_URL}/${assemblyId}?token=${token}`;

    console.log("🔌 Conectando WS:", url);

    const ws = new WebSocket(url);

    ws.onopen = () => {
        console.log("🟢 WS conectado");
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handler(data);
    };

    ws.onerror = (err) => {
        console.error("❌ WS error:", err);
    };

    ws.onclose = () => {
        console.log("🔴 WS cerrado");
    };

    return ws;
}
