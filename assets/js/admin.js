const token = localStorage.getItem("token");

let selectedAssembly = null;
let selectedMotion = null;
let ws = null;

// ==========================
// 🏛️ CREAR ASAMBLEA
// ==========================
async function createAssembly() {

    const name = document.getElementById("assemblyName").value;
    const type = document.getElementById("assemblyType").value;

    await fetch("http://127.0.0.1:8000/assemblies", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, type })
    });

    loadAssemblies();
}

// ==========================
// 📜 LISTAR ASAMBLEAS
// ==========================
async function loadAssemblies() {

    const res = await fetch("http://127.0.0.1:8000/assemblies", {
        headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await res.json();

    const list = document.getElementById("assemblies");

    list.innerHTML = data.map(a => `
        <li onclick="selectAssembly('${a.id}')">
            ${a.name}
        </li>
    `).join("");
}

// ==========================
// 🧠 SELECCIONAR ASAMBLEA
// ==========================
function selectAssembly(id) {

    selectedAssembly = id;
    localStorage.setItem("assembly_id", id);

    console.log("🏛️ Asamblea seleccionada:", id);

    connectWS();
    loadMotions();
}

// ==========================
// 🧾 CREAR MOCIÓN
// ==========================
async function createMotion() {

    const title = document.getElementById("motionTitle").value;

    await fetch("http://127.0.0.1:8000/motions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            assembly_id: selectedAssembly,
            title
        })
    });

    loadMotions();
}

// ==========================
// 📜 LISTAR MOCIONES
// ==========================
async function loadMotions() {

    const res = await fetch(
        `http://127.0.0.1:8000/motions/${selectedAssembly}`,
        {
            headers: { "Authorization": `Bearer ${token}` }
        }
    );

    const data = await res.json();

    const list = document.getElementById("motions");
    const select = document.getElementById("motionSelect");

    list.innerHTML = "";
    select.innerHTML = "";

    data.forEach(m => {

        list.innerHTML += `
            <li onclick="selectMotion('${m.id}')">
                ${m.title}
            </li>
        `;

        select.innerHTML += `
            <option value="${m.id}">
                ${m.title}
            </option>
        `;
    });
}
// ==========================
// 🎯 SELECCIONAR MOCIÓN
// ==========================
function selectMotion(id) {

    selectedMotion = id;
    localStorage.setItem("motion_id", id);
}

// ==========================
// 🔌 WS
// ==========================
function connectWS() {

    if (ws) {
        ws.close();
    }

    ws = new WebSocket(
        `ws://127.0.0.1:8000/ws/${selectedAssembly}?token=${token}`
    );

    ws.onopen = () => {
        console.log("🟢 WS conectado");
    };

    ws.onmessage = (event) => {

        const data = JSON.parse(event.data);
        console.log("WS:", data);

        if (data.type === "vote_update") {
            updateResults(data.results);
        }

        if (data.type === "motion_started") {
            setStatus("🟢 VOTACIÓN EN CURSO");
        }

        if (data.type === "motion_closed") {
            setStatus("🔴 VOTACIÓN CERRADA");
            updateResults(data.results);
        }
    };

    ws.onclose = () => {
        console.log("🔴 WS desconectado");
    };
    ws.onerror = (e) => {
    console.error("❌ WS error", e);
    };
}

// ==========================
// 🟢 INICIAR VOTACIÓN
// ==========================
function startMotion() {

    if (!ws || ws.readyState !== WebSocket.OPEN) {
        alert("WS no conectado");
        return;
    }

    if (!selectedMotion) {
        alert("Selecciona una moción");
        return;
    }

    ws.send(JSON.stringify({
        type: "start_motion",
        motion_id: selectedMotion
    }));
}

// ==========================
// 🔴 CERRAR VOTACIÓN
// ==========================
function closeMotion() {

    ws.send(JSON.stringify({
        type: "close_motion",
        motion_id: selectedMotion
    }));
}

// ==========================
// 🗳️ VOTAR (ADMIN TAMBIÉN)
// ==========================
function vote(value) {

    if (!ws || ws.readyState !== WebSocket.OPEN) {
        alert("WS no conectado");
        return;
    }

    if (!selectedMotion) {
        alert("Selecciona una moción");
        return;
    }

    ws.send(JSON.stringify({
        type: "vote",
        motion_id: selectedMotion,
        vote: value
    }));
}

// ==========================
// 📊 RESULTADOS
// ==========================
function updateResults(results) {

    document.getElementById("yes").innerText = results.YES || 0;
    document.getElementById("no").innerText = results.NO || 0;
    document.getElementById("abstain").innerText = results.ABSTAIN || 0;
}

// ==========================
function setStatus(text) {
    document.getElementById("status").innerText = text;
}

document.getElementById("motionSelect").addEventListener("change", (e) => {
    selectedMotion = e.target.value;
});

// INIT
loadAssemblies();