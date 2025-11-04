// /src/js/admin-case.js

// ===== Dataset (standalone, igual ao painel) =====
const CASES = [
  { id: "1", title: "Buraco na Rua Principal", status: "progress", protocol: "EPF-2025-001", category: "Buraco", date: "19/10/2025", image: "/src/assets/img/buraco.png", address: "Rua Principal, 123 - Centro", description: "Buraco grande na rua que está causando acidentes" },
  { id: "2", title: "Poste sem iluminação",   status: "done",     protocol: "EPF-2025-002", category: "Iluminação", date: "14/10/2025", image: "/src/assets/img/poste.png",  address: "Av. das Flores, 58 - Centro",   description: "Poste apagado há mais de uma semana" },
  { id: "3", title: "Lixo acumulado",          status: "received", protocol: "EPF-2025-003", category: "Limpeza",    date: "27/10/2025", image: "/src/assets/img/lixo.png",   address: "Rua das Palmeiras, 210 - Centro", description: "Lixo não recolhido há 3 dias" }
];

const STATUS_LABEL = { progress: "Em andamento", received: "Recebida", done: "Concluída" };
const STATUS_CLASS = { progress: "badge-progress", received: "badge-received", done: "badge-done" };

const $id = (id) => document.getElementById(id);

/* =========================================================
   TOPO IGUAL AO REFERENCIAL:
   - Header sticky (top: 0, z-index: 30)
   - Sub-barra sticky abaixo do header (top: var(--topbar-h))
   ========================================================= */
function syncTopbarHeight() {
  const header = document.querySelector(".home-header");
  const root = document.documentElement;
  if (!header || !root) return;

  const setVar = () => {
    // altura exata do header atual
    const h = Math.ceil(header.getBoundingClientRect().height || 100);
    root.style.setProperty("--topbar-h", `${h}px`);
  };

  setVar();
  // Ajusta em redimensionamentos e quando o header mudar de altura
  window.addEventListener("resize", setVar, { passive: true });
  if (window.ResizeObserver) {
    const ro = new ResizeObserver(setVar);
    ro.observe(header);
  }
}

/* =========================================================
   Back inteligente
   ========================================================= */
function setupBackLink() {
  const back = document.querySelector(".back-link");
  if (!back) return;
  back.addEventListener("click", (ev) => {
    ev.preventDefault();
    if (history.length > 1) return history.back();

    if (document.referrer) {
      try {
        const ref = new URL(document.referrer);
        if (ref.origin === location.origin) {
          location.href = document.referrer;
          return;
        }
      } catch {}
    }
    location.href = "/admin.html";
  });
}

/* =========================================================
   Obter ID e carregar dados
   ========================================================= */
function getIdFromQuery() {
  const p = new URLSearchParams(location.search);
  let id = p.get("id") || sessionStorage.getItem("selectedCaseId") || "";
  if (!CASES.some((c) => c.id === id)) id = CASES[0].id;
  return id;
}

function loadCase() {
  const id = getIdFromQuery();
  const data = CASES.find((c) => c.id === id);
  if (!data) return (location.href = "/admin.html");

  try { sessionStorage.setItem("selectedCaseId", id); } catch {}

  const img = $id("cd-image");       if (img) img.src = data.image;
  const t = $id("cd-title");         if (t) t.textContent = data.title;
  const prot = $id("cd-protocol");   if (prot) prot.textContent = `Protocolo: ${data.protocol}`;
  const cat = $id("cd-category");    if (cat) cat.textContent = data.category;
  const addr = $id("cd-address");    if (addr) addr.textContent = data.address;
  const desc = $id("cd-description");if (desc) desc.textContent = data.description;
  const dt = $id("cd-date");         if (dt) dt.textContent = data.date;

  const statusEl = $id("cd-status");
  if (statusEl) {
    statusEl.className = `badge ${STATUS_CLASS[data.status]}`;
    statusEl.textContent = STATUS_LABEL[data.status];
  }

  const sel = $id("sel-status");
  if (sel) sel.value = data.status;
}

/* =========================================================
   Ações (demo)
   ========================================================= */
function setupActions() {
  const btn = $id("btn-notify");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const sel = $id("sel-status");
    const newStatus = sel ? sel.value : "received";
    const msg = ($id("msg")?.value || "").trim();
    alert(`(Demonstração)
Status atualizado para: ${STATUS_LABEL[newStatus] || newStatus}
Mensagem: ${msg || "—"}`);
  });
}

/* =========================================================
   Boot
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  syncTopbarHeight();     // calcula --topbar-h
  setupBackLink();
  loadCase();
  setupActions();
});
