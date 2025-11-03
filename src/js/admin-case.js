// /src/js/admin-case.js

// Mesmo dataset do painel (para ficar standalone)
const CASES = [
  {
    id: "1",
    title: "Buraco na Rua Principal",
    status: "progress",
    protocol: "EPF-2025-001",
    category: "Buraco",
    date: "19/10/2025",
    image: "/src/assets/img/buraco.png",
    address: "Rua Principal, 123 - Centro",
    description: "Buraco grande na rua que está causando acidentes"
  },
  {
    id: "2",
    title: "Poste sem iluminação",
    status: "done",
    protocol: "EPF-2025-002",
    category: "Iluminação",
    date: "14/10/2025",
    image: "/src/assets/img/poste.png",
    address: "Av. das Flores, 58 - Centro",
    description: "Poste apagado há mais de uma semana"
  },
  {
    id: "3",
    title: "Lixo acumulado",
    status: "received",
    protocol: "EPF-2025-003",
    category: "Limpeza",
    date: "27/10/2025",
    image: "/src/assets/img/lixo.png",
    address: "Rua das Palmeiras, 210 - Centro",
    description: "Lixo não recolhido há 3 dias"
  }
];

const STATUS_LABEL = { progress:"Em andamento", received:"Recebida", done:"Concluída" };
const STATUS_CLASS = { progress:"badge-progress", received:"badge-received", done:"badge-done" };

function qs(id){ return document.getElementById(id); }

// Pega ?id= da URL
function getIdFromQuery() {
  const p = new URLSearchParams(location.search);
  return p.get("id") || "1";
}

function loadCase() {
  const id = getIdFromQuery();
  const data = CASES.find(c => c.id === id);
  if (!data) { location.href = "/admin.html"; return; }

  qs("cd-title").textContent = data.title;
  qs("cd-protocol").textContent = `Protocolo: ${data.protocol}`;
  const statusEl = qs("cd-status");
  statusEl.className = `badge ${STATUS_CLASS[data.status]}`;
  statusEl.textContent = STATUS_LABEL[data.status];

  qs("cd-image").src = data.image;
  qs("cd-category").textContent = data.category;
  qs("cd-address").textContent = data.address;
  qs("cd-description").textContent = data.description;
  qs("cd-date").textContent = data.date;

  // select default
  const sel = qs("sel-status");
  sel.value = data.status;
}

function setupActions() {
  qs("btn-notify").addEventListener("click", () => {
    const newStatus = qs("sel-status").value;
    const msg = qs("msg").value.trim();
    alert(`(Demonstração)\nStatus atualizado para: ${STATUS_LABEL[newStatus]}\nMensagem: ${msg || "—"}`);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadCase();
  setupActions();
});
