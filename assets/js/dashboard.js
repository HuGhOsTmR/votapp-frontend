const token = localStorage.getItem("token");
const assemblyId = localStorage.getItem("assembly_id");

let ws = connectWS(token, assemblyId, handleWS);
let users = [];

// =========================
// 📡 WS HANDLER
// =========================
function handleWS(data) {

    console.log("WS:", data);

    if (data.type === "presence") {
        updatePresence(data);
    }

    if (data.type === "vote_update") {
        updateVotes(data.results, data.votes_detail);
        updatePoliticalMap(data.votes_detail); // 🔥 CLAVE
    }

    if (data.type === "motion_started") {
        setStatus("🟢 EN VOTACIÓN");
    }

    if (data.type === "motion_closed") {
        setStatus("🔴 VOTACIÓN CERRADA");
    }
}

// =========================
// 👥 PRESENCIA
// =========================
function updatePresence(data) {

    users = data.users;

    document.getElementById("count").innerText = data.count;
    document.getElementById("quorum").innerText = data.quorum.connected + "/" + data.quorum.required;

    renderHemicycle();
}

// =========================
// 🏛️ HEMICICLO
// =========================
function renderHemicycle() {

    const container = document.getElementById("hemicycle");

    container.innerHTML = "";

    users.forEach((u, index) => {

        const seat = document.createElement("div");

        seat.classList.add("seat");
        seat.id = "seat-" + u.id;

        // 🔥 asignar partido
        if (u.party) {
            seat.classList.add("party-" + u.party);
        }

        container.appendChild(seat);
    });
}

// =========================
// 🗳️ VOTOS (TODO EN UNO)
// =========================
function updateVotes(results, votesDetail = []) {

    const yes = results.YES || 0;
    const no = results.NO || 0;
    const abstain = results.ABSTAIN || 0;

    const total = yes + no + abstain || 1;

    // números
    document.getElementById("yes").innerText = yes;
    document.getElementById("no").innerText = no;
    document.getElementById("abstain").innerText = abstain;

    // barras
    document.getElementById("bar-yes").style.width = (yes / total * 100) + "%";
    document.getElementById("bar-no").style.width = (no / total * 100) + "%";
    document.getElementById("bar-abstain").style.width = (abstain / total * 100) + "%";

    // 🎨 pintar hemiciclo
    votesDetail.forEach(v => {

        const seat = document.getElementById("seat-" + v.user_id);

        if (!seat) return;

        seat.classList.remove("yes", "no", "abstain");

        if (v.vote === "YES") seat.classList.add("yes");
        if (v.vote === "NO") seat.classList.add("no");
        if (v.vote === "ABSTAIN") seat.classList.add("abstain");
    });

    updatePoliticalMap(votesDetail);
}

// =========================
// 🧬 MAPA POLÍTICO
// =========================
function updatePoliticalMap(votesDetail = []) {

    const map = {};

    votesDetail.forEach(v => {

        if (!map[v.party]) {
            map[v.party] = {
                YES: 0,
                NO: 0,
                ABSTAIN: 0
            };
        }

        map[v.party][v.vote]++;
    });

    renderPoliticalMap(map);
}

// =========================
function renderPoliticalMap(map) {

    const container = document.getElementById("political-map");

    if (!container) return;

    container.innerHTML = Object.keys(map).map(party => {

        const data = map[party];

        return `
            <div class="party-box ${party}">
                <h4>${party}</h4>
                <p>YES: ${data.YES}</p>
                <p>NO: ${data.NO}</p>
                <p>ABS: ${data.ABSTAIN}</p>
            </div>
        `;
    }).join("");
}

// =========================
function setStatus(text) {
    document.getElementById("status").innerText = text;
}