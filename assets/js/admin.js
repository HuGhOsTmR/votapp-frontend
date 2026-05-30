import { apiFetch } from "./api.js";
import { connectWS, sendWS } from "./ws.js";

let selectedAssembly = null;
let selectedMotion = null;

// ==========================
// INIT
// ==========================
window.addEventListener("DOMContentLoaded", () => {

    console.log("🚀 Admin iniciado");

    document.getElementById("motionSelect")
        .addEventListener("change", (e) => {
            selectedMotion = e.target.value;
        });
});

// ==========================
// 🏛️ CREAR / ABRIR ASAMBLEA
// ==========================
async function createAssembly() {

    try {

        const res = await apiFetch("/assemblies/open", {
            method: "POST"
        });

        console.log("🟢 Asamblea abierta:", res);

        alert("Asamblea iniciada correctamente");

        // ⚠️ como no hay endpoint de listado,
        // pedimos ID manual
        selectAssemblyManual();

    } catch (err) {
        console.error(err);
        alert("Error al crear asamblea");
    }
}

// ==========================
// 🧠 SELECCIÓN MANUAL (CLAVE)
// ==========================
function selectAssemblyManual() {

    const id = prompt("Ingresa el assembly_id:");

    if (!id) return;

    selectedAssembly = id;

    localStorage.setItem("assembly_id", id);

    console.log("🏛️ Asamblea seleccionada:", id);

    connectWS(id, handleWS);
}

// ==========================
// 🧾 MOCIONES (NO IMPLEMENTADO)
// ==========================
async function createMotion() {
    alert("⚠️ Backend aún no tiene endpoint /motions");
}

async function loadMotions() {
    console.warn("No implementado aún");
}

function selectMotion(id) {
    selectedMotion = id;
}

// ==========================
// 🟢🔴 CONTROL
// ==========================
function startMotion() {

    if (!selectedMotion) {
        alert("Selecciona una moción");
        return;
    }

    sendWS({
        type: "start_motion",
        motion_id: selectedMotion
    });
}

function closeMotion() {

    if (!selectedMotion) {
        alert("Selecciona una moción");
        return;
    }

    sendWS({
        type: "close_motion",
        motion_id: selectedMotion
    });
}

// ==========================
// 🗳️ VOTO
// ==========================
function vote(value) {

    if (!selectedMotion) {
        alert("Selecciona una moción");
        return;
    }

    sendWS({
        type: "vote",
        motion_id: selectedMotion,
        vote: value
    });
}

// ==========================
// 📡 WS HANDLER
// ==========================
function handleWS(data) {

    console.log("📡 WS:", data);

    if (data.type === "motion_started") {
        setStatus("🟢 EN VOTACIÓN");
    }

    if (data.type === "motion_closed") {
        setStatus("🔴 CERRADA");
        updateResults(data.results);
    }

    if (data.type === "vote_update") {
        updateResults(data.results);
    }
}

// ==========================
function updateResults(results) {

    if (!document.getElementById("yes")) return;

    document.getElementById("yes").innerText = results.YES || 0;
    document.getElementById("no").innerText = results.NO || 0;
    document.getElementById("abstain").innerText = results.ABSTAIN || 0;
}

function setStatus(text) {
    document.getElementById("status").innerText = text;
}

// ==========================
// 🌐 GLOBAL
// ==========================
window.createAssembly = createAssembly;
window.selectAssemblyManual = selectAssemblyManual;
window.startMotion = startMotion;
window.closeMotion = closeMotion;
window.vote = vote;
