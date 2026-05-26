let ws = null;

function connectWS(token, assemblyId, handler) {

    const ws = new WebSocket(
        `ws://127.0.0.1:8000/ws/${assemblyId}?token=${token}`
    );

    ws.onopen = () => {
        console.log("🟢 WS conectado");
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handler(data);
    };

    ws.onclose = () => {
        console.log("🔴 WS cerrado");
    };

    return ws;
}

function sendWS(message) {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
    }
}