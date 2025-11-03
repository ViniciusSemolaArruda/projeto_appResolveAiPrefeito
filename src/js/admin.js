// /src/js/admin.js

// ===== Dados fictícios =====
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

// ===== KPIs =====
function updateKPIs() {
  const total = CASES.length;
  const recebidas = CASES.filter(c => c.status === "received").length;
  const andamento = CASES.filter(c => c.status === "progress").length;
  const concluidas = CASES.filter(c => c.status === "done").length;

  document.getElementById("kpi-total").textContent = total;
  document.getElementById("kpi-recebidas").textContent = recebidas;
  document.getElementById("kpi-andamento").textContent = andamento;
  document.getElementById("kpi-concluidas").textContent = concluidas;
}

// ===== Lista (Ocorrências) =====
function renderList() {
  const wrap = document.getElementById("admin-cases-list");
  if (!wrap) return;
  wrap.innerHTML = "";

  CASES.forEach(c => {
    const card = document.createElement("article");
    card.className = "case-card";
    card.innerHTML = `
      <div class="case-media">
        <img src="${c.image}" alt="Imagem da ocorrência" />
      </div>
      <div class="case-body">
        <div class="case-head">
          <h3 class="case-title">${c.title}</h3>
          <span class="badge ${STATUS_CLASS[c.status]}">${STATUS_LABEL[c.status]}</span>
        </div>

        <div class="meta-block">
          <div class="meta-row"><span class="meta-ico">📄</span><span>${c.protocol}</span></div>
          <div class="meta-row"><span class="meta-ico">📁</span><span>${c.category}</span></div>
          <div class="meta-row"><span class="meta-ico">📅</span><span>${c.date}</span></div>
        </div>

        <a class="meta-link mt8" href="/admin-case.html?id=${c.id}" aria-label="Ver detalhes">Ver detalhes</a>
      </div>
    `;
    card.addEventListener("click", (e) => {
      if (!e.target.closest("a")) window.location.href = `/admin-case.html?id=${c.id}`;
    });
    wrap.appendChild(card);
  });
}

// ===== Relatórios =====
let reportsRendered = false;

function renderReports() {
  if (reportsRendered) return;
  reportsRendered = true;

  const wrap = document.getElementById("reports-wrap");
  if (!wrap) return;

  // valores fictícios do seu mock
  const resolvidas = 247;
  const tempoMedio = "3.2 dias";
  const satisfacao = "92%";

  const cat = [
    { nome: "Iluminação", valor: 89, cor: "var(--blue-strong, #2468B1)" },
    { nome: "Buraco", valor: 67, cor: "var(--red-strong, #D11A2A)" },
    { nome: "Limpeza", valor: 54, cor: "var(--green-strong, #16A34A)" },
    { nome: "Saneamento", valor: 37, cor: "var(--yellow-strong, #FDB100)" }
  ];

  wrap.innerHTML = `
    <article class="report-card">
      <h3 class="report-title"><span class="rt-ico">📊</span> Relatórios e Estatísticas</h3>
      <p class="report-sub">Análise de desempenho mensal</p>

      <h4 class="report-month">Outubro 2025</h4>

      <div class="report-kpis">
        <div class="report-kpi kpi-green">
          <strong>${resolvidas}</strong>
          <small>Ocorrências Resolvidas</small>
        </div>
        <div class="report-kpi kpi-blue">
          <strong>${tempoMedio}</strong>
          <small>Tempo Médio de Resolução</small>
        </div>
        <div class="report-kpi kpi-yellow">
          <strong>${satisfacao}</strong>
          <small>Taxa de Satisfação</small>
        </div>
      </div>

      <h4 class="report-subtitle">Categorias Mais Reportadas</h4>
      <div class="bars">
        ${cat.map(c => `
          <div class="bar-row">
            <span class="bar-label">${c.nome}</span>
            <div class="bar-track"><span class="bar-fill" style="--w:${c.valor}%; background:${c.cor}"></span></div>
            <span class="bar-value">${c.valor}</span>
          </div>
        `).join("")}
      </div>
    </article>
  `;
}

// ===== Abas =====
function setupTabs() {
  const tabs = document.querySelectorAll(".admin-tab");
  const panes = document.querySelectorAll(".tab-pane");

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => { t.classList.remove("active"); t.setAttribute("aria-selected","false"); });
      tab.classList.add("active");
      tab.setAttribute("aria-selected","true");

      const targetId = tab.dataset.tab; // "tab-ocorrencias" | "tab-relatorios"
      panes.forEach(p => p.classList.toggle("active", p.id === targetId));

      if (targetId === "tab-relatorios") {
        renderReports(); // lazy render
      }
    });
  });
}

// ===== Boot =====
document.addEventListener("DOMContentLoaded", () => {
  updateKPIs();
  renderList();
  setupTabs();
});
