// /src/js/admin-case.js

// ===== Dataset (standalone, igual ao painel) =====
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

// ===== UI: fixa a sub-barra "Voltar" logo abaixo do header =====
function setDynamicTopbarHeight() {
  const header = document.querySelector(".home-header");
  if (!header) return;
  const h = Math.ceil(header.getBoundingClientRect().height);
  document.documentElement.style.setProperty("--topbar-h", h + "px");
}

// ===== Navegação: Back com fallback =====
function setupBackLink() {
  const back = document.querySelector(".back-link");
  if (!back) return;

  back.addEventListener("click", (ev) => {
    ev.preventDefault();
    if (history.length > 1) {
      history.back();
    } else {
      window.location.href = "/admin.html";
    }
  });
}

// ===== ID da ocorrência: querystring -> sessionStorage -> fallback =====
function getIdFromQuery() {
  const p = new URLSearchParams(window.location.search);
  let id = p.get("id") || sessionStorage.getItem("selectedCaseId") || "";
  if (!CASES.some(c => c.id === id)) id = CASES[0].id;
  return id;
}

// ===== Carrega dados no detalhe =====
function loadCase() {
  const id = getIdFromQuery();
  const data = CASES.find(c => c.id === id);
  if (!data) { window.location.href = "/admin.html"; return; }

  // Mantém id selecionado para refresh/volta
  try { sessionStorage.setItem("selectedCaseId", id); } catch {}

  // Texto e mídia
  const img = qs("cd-image");
  if (img) img.src = data.image;

  const t = qs("cd-title");
  if (t) t.textContent = data.title;

  const prot = qs("cd-protocol");
  if (prot) prot.textContent = `Protocolo: ${data.protocol}`;

  const cat = qs("cd-category");
  if (cat) cat.textContent = data.category;

  const addr = qs("cd-address");
  if (addr) addr.textContent = data.address;

  const desc = qs("cd-description");
  if (desc) desc.textContent = data.description;

  const dt = qs("cd-date");
  if (dt) dt.textContent = data.date;

  // Badge de status
  const statusEl = qs("cd-status");
  if (statusEl) {
    statusEl.className = `badge ${STATUS_CLASS[data.status]}`;
    statusEl.textContent = STATUS_LABEL[data.status];
  }

  // Select de status espelhando o atual
  const sel = qs("sel-status");
  if (sel) sel.value = data.status;
}

// ===== Ações (demo de notificação) =====
function setupActions() {
  const btn = qs("btn-notify");
  if (!btn) return;

  btn.addEventListener("click", () => {
    const sel = qs("sel-status");
    const newStatus = sel ? sel.value : "received";
    const msg = (qs("msg")?.value || "").trim();

    alert(`(Demonstração)
Status atualizado para: ${STATUS_LABEL[newStatus] || newStatus}
Mensagem: ${msg || "—"}`);
  });
}

// ===== Boot =====
document.addEventListener("DOMContentLoaded", () => {
  setDynamicTopbarHeight();
  window.addEventListener("resize", setDynamicTopbarHeight);

  setupBackLink();
  loadCase();
  setupActions();
});
