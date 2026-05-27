import { WS_URL } from "./config.js";

let socket = null;

export function connectWS(assemblyId, handler) {

    const token = localStorage.getItem("token");

    if (socket) {
        socket.close();
    }

    socket = new WebSocket(
        `${WS_URL}/ws/${assemblyId}?token=${token}`
    );

    socket.onopen = () => {
        console.log("🟢 WS conectado");
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handler(data);
    };

    socket.onclose = () => {
        console.log("🔴 WS cerrado");
    };

    socket.onerror = (e) => {
        console.error("❌ WS error", e);
    };

    return socket;
}

export function sendWS(data) {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(data));
    } else {
        console.warn("WS no conectado");
    }
}
