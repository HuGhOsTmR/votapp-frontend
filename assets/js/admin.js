import { apiFetch } from "./api.js";
import { connectWS, sendWS } from "./ws.js";

let selectedAssembly = null;
let selectedMotion = null;

// ==========================
// INIT
// ==========================
window.addEventListener("DOMContentLoaded", () => {
    loadAssemblies();

    document.getElementById("motionSelect")
        .addEventListener("change", (e) => {
            selectedMotion = e.target.value;
        });
});

// ==========================
// 🏛️ ASAMBLEA
// ==========================
async function createAssembly() {

    const name = document.getElementById("assemblyName").value;
    const type = document.getElementById("assemblyType").value;

    await apiFetch("/assemblies", {
        method: "POST",
        body: JSON.stringify({ name, type })
    });

    loadAssemblies();
}

async function loadAssemblies() {

    const data = await apiFetch("/assemblies");

    const list = document.getElementById("assemblies");

    list.innerHTML = data.map(a => `
        <li onclick="selectAssembly('${a.id}')">
            ${a.name}
        </li>
    `).join("");
}

function selectAssembly(id) {

    selectedAssembly = id;
    localStorage.setItem("assembly_id", id);

    connectWS(id, handleWS);
    loadMotions();
}

// ==========================
// 🧾 MOCIONES
// ==========================
async function createMotion() {

    const title = document.getElementById("motionTitle").value;

    await apiFetch("/motions", {
        method: "POST",
        body: JSON.stringify({
            assembly_id: selectedAssembly,
            title
        })
    });

    loadMotions();
}

async function loadMotions() {

    const data = await apiFetch(`/motions/${selectedAssembly}`);

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

function selectMotion(id) {
    selectedMotion = id;
}

// ==========================
// 🟢🔴 CONTROL
// ==========================
function startMotion() {

    sendWS({
        type: "start_motion",
        motion_id: selectedMotion
    });
}

function closeMotion() {

    sendWS({
        type: "close_motion",
        motion_id: selectedMotion
    });
}

// ==========================
// 🗳️ VOTO
// ==========================
function vote(value) {

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

    console.log("WS:", data);

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
// 🌐 GLOBAL (IMPORTANTE)
// ==========================
window.createAssembly = createAssembly;
window.createMotion = createMotion;
window.selectAssembly = selectAssembly;
window.selectMotion = selectMotion;
window.startMotion = startMotion;
window.closeMotion = closeMotion;
window.vote = vote;
