const token = localStorage.getItem("token");
const assemblyId = localStorage.getItem("assembly_id");

let ws = connectWS(token, assemblyId, handleWS);

const motionId = () => localStorage.getItem("motion_id");

let ws = connectWS(handleWS);

let hasVoted = false;

// ======================
// 🧠 HANDLER CENTRAL
// ======================
function handleWS(data) {

    console.log("WS:", data);

    if (data.type === "motion_started") {
        setStatus("🟢 Votación en curso");
        enableVoting();
    }

    if (data.type === "motion_closed") {
        setStatus("🔴 Votación cerrada");
        disableVoting();
        updateResults(data.results);
    }

    if (data.type === "vote_update") {
        updateResults(data.results);
    }

    if (data.type === "presence") {
        updateUsers(data.users);
    }
}

// ======================
// 🗳️ VOTAR
// ======================
function vote(value) {

    if (hasVoted) return;

    ws.send(JSON.stringify({
        type: "vote",
        motion_id: motionId(),
        vote: value
    }));

    hasVoted = true;
    disableVoting();
}

// ======================
// UI
// ======================
function updateResults(r) {
    document.getElementById("yes").innerText = r.YES || 0;
    document.getElementById("no").innerText = r.NO || 0;
    document.getElementById("abstain").innerText = r.ABSTAIN || 0;
}

function updateUsers(users) {
    const el = document.getElementById("users");
    if (!el) return;
    el.innerHTML = users.map(u => `<li>${u.name}</li>`).join("");
}

function disableVoting() {
    document.querySelectorAll(".vote-btn")
        .forEach(b => b.disabled = true);
}

function enableVoting() {
    hasVoted = false;
    document.querySelectorAll(".vote-btn")
        .forEach(b => b.disabled = false);
}

function setStatus(t) {
    document.getElementById("status").innerText = t;
}