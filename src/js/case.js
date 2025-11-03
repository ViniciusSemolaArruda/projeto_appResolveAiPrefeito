// /src/js/case.js
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);

  // ===== Label/ícone padrão (PT) — robusto =====
  const DEFAULT_LABEL = { RECEIVED: "Recebida", PROGRESS: "Em andamento", DONE: "Concluída" };
  const DEFAULT_DOT   = { RECEIVED: "📦",      PROGRESS: "🔧",          DONE: "✅" };

  // Se existir um mapa global, mescla (sem quebrar)
  const LABEL_MAP = Object.assign({}, DEFAULT_LABEL, (window.STATUS_LABEL || {}));
  const DOT_MAP   = Object.assign({}, DEFAULT_DOT,   (window.DOT_EMOJI    || {}));

  // ===== ID/NAV =====
  function getIdFromUrlOrStorage() {
    const qp = new URLSearchParams(location.search);
    const idQ = qp.get("id");
    if (idQ) return idQ;

    const parts = location.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (last && /^\d+$/.test(last)) return last;

    const saved = localStorage.getItem("lastCaseId");
    if (saved) return saved;
    return null;
  }

  function waitForCases(maxWaitMs = 5000, intervalMs = 50) {
    return new Promise((resolve) => {
      const t0 = performance.now();
      const tick = () => {
        if (window.CASES && typeof window.CASES === "object") return resolve(true);
        if (performance.now() - t0 >= maxWaitMs) return resolve(false);
        setTimeout(tick, intervalMs);
      };
      tick();
    });
  }

  // ===== Datas BR =====
  function parseBrDate(s) {
    const [d, m, y] = String(s || "").split("/").map(n => parseInt(n, 10));
    if (!d || !m || !y) return null;
    return new Date(y, m - 1, d);
  }
  function formatBrDate(d) {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = d.getFullYear();
    return `${dd}/${mm}/${yy}`;
  }

  // ===== Normalização de tipos =====
  const TYPE_ALIASES = {
    RECEBIDA: "RECEIVED",
    RECEIVED: "RECEIVED",
    "EM ANDAMENTO": "PROGRESS",
    ANDAMENTO: "PROGRESS",
    PROGRESS: "PROGRESS",
    WORKING: "PROGRESS",
    CONCLUIDA: "DONE",
    CONCLUÍDA: "DONE",
    CONCLUIDO: "DONE",
    CONCLUÍDO: "DONE",
    DONE: "DONE",
    COMPLETED: "DONE",
  };
  function normType(t) {
    const k = String(t || "").trim().toUpperCase();
    return TYPE_ALIASES[k] || "RECEIVED";
  }

  // ===== Regras da linha do tempo =====
  function normalizeTimeline(data) {
    const raw = Array.isArray(data.timeline) ? data.timeline : [];
    let TL = raw.map(ev => ({
      ...ev,
      type: normType(ev.type),
      date: ev.date || "",
      desc: ev.desc || "",
    }));

    const statusNorm = normType(data.status);
    const hasRec = TL.some(e => e.type === "RECEIVED");
    const hasProg = TL.some(e => e.type === "PROGRESS");
    const hasDone = TL.some(e => e.type === "DONE");

    // Se status é DONE e não há DONE no histórico, cria
    if (statusNorm === "DONE" && !hasDone) {
      const lastWithDate = [...TL].reverse().find(e => parseBrDate(e.date));
      const base = lastWithDate ? parseBrDate(lastWithDate.date) : new Date();
      TL.push({ type: "DONE", date: formatBrDate(base || new Date()), desc: "Serviço concluído" });
    }

    // Se há DONE mas não há PROGRESS, cria PROGRESS entre RECEIVED e DONE
    if (TL.some(e => e.type === "DONE") && !hasProg) {
      const rec  = TL.find(e => e.type === "RECEIVED");
      const done = TL.find(e => e.type === "DONE");
      let d = done && parseBrDate(done.date);
      if (!d) d = new Date();
      if (rec && rec.date) {
        const r = parseBrDate(rec.date);
        if (r && d && d - r > 24 * 60 * 60 * 1000) {
          d = new Date(r.getTime() + Math.floor((d - r) / 2));
        } else {
          d = new Date(d.getTime() - 24 * 60 * 60 * 1000);
        }
      } else {
        d = new Date(d.getTime() - 24 * 60 * 60 * 1000);
      }
      TL.push({ type: "PROGRESS", date: formatBrDate(d), desc: "Ocorrência em atendimento" });
    }

    // Ordena por data (sem data vai pro fim)
    TL.sort((a, b) => {
      const da = parseBrDate(a.date);
      const db = parseBrDate(b.date);
      if (da && db) return da - db;
      if (da && !db) return -1;
      if (!da && db) return 1;
      return 0;
    });

    // Se concluída e datas iguais, força ordem lógica: RECEIVED -> PROGRESS -> DONE
    const isConcluded = statusNorm === "DONE" || TL.some(e => e.type === "DONE");
    if (isConcluded) {
      const order = { RECEIVED: 0, PROGRESS: 1, DONE: 2 };
      TL.sort((a, b) => {
        const da = parseBrDate(a.date), db = parseBrDate(b.date);
        if (da && db && da.getTime() === db.getTime()) {
          return order[a.type] - order[b.type];
        }
        return 0;
      });
    }

    return TL;
  }

  // ===== Render =====
  function renderCase(data) {
    $("#cd-title").textContent = data.title;
    $("#cd-protocol").textContent = `Protocolo: ${data.protocol}`;

    const statusNorm = normType(data.status);
    const st = $("#cd-status");
    const stClass = (window.STATUS_CLASS && window.STATUS_CLASS[statusNorm]) || "badge-received";
    const stLabel = LABEL_MAP[statusNorm] || DEFAULT_LABEL[statusNorm] || "Status";
    st.className = `badge ${stClass}`;
    st.textContent = stLabel;

    $("#cd-image").src = data.image;
    $("#cd-category").textContent = data.category;
    $("#cd-description").textContent = data.description;
    $("#cd-address").textContent = data.address;

    const tl = $("#cd-timeline");
    tl.innerHTML = "";

    const timeline = normalizeTimeline(data);

    timeline.forEach((ev) => {
      const t = normType(ev.type);
      const dotSymbol = DOT_MAP[t] || "•";
      const evCls = (window.STATUS_CLASS && window.STATUS_CLASS[t]) || "badge-received";
      const evLbl = LABEL_MAP[t] || DEFAULT_LABEL[t] || "";
      const li = document.createElement("li");
      li.className = "tl-item";
      li.innerHTML = `
        <span class="tl-dot">${dotSymbol}</span>
        <div class="tl-content">
          <div class="tl-row">
            <span class="badge ${evCls}">${evLbl}</span>
            <span class="tl-date">📅 ${ev.date || ""}</span>
          </div>
          <p class="tl-desc">${ev.desc || ""}</p>
        </div>`;
      tl.appendChild(li);
    });

    // "Aguardando atualização" — somente se NÃO houver concluída
    const hasDone = timeline.some(e => normType(e.type) === "DONE");
    if (!hasDone) {
      const li = document.createElement("li");
      li.className = "tl-item tl-awaiting";
      li.innerHTML = `
        <span class="tl-dot">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-opacity="0.25" stroke-width="3" fill="none"/>
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" stroke-linecap="round" fill="none">
              <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
            </path>
          </svg>
        </span>
        <div class="tl-content">
          <div class="tl-row">
            <span class="badge badge-progress">Aguardando atualização</span>
            <span class="tl-date">🕓 em breve</span>
          </div>
          <p class="tl-desc">Aguarde, sua solicitação está em fila de processamento.</p>
        </div>`;
      tl.appendChild(li);
    }
  }

  // ===== Voltar inteligente =====
  function bindBack() {
    const btn = document.getElementById("btn-back-case");
    if (!btn) return;
    btn.addEventListener("click", (e) => {
      e.preventDefault();
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
      location.href = "/cases.html";
    });
  }

  // ===== Ajuste topo =====
  function adjustTopbar() {
    const header = document.querySelector(".home-header");
    const update = () => {
      const h = (header && header.offsetHeight) || 100;
      document.documentElement.style.setProperty("--topbar-h", `${h}px`);
    };
    update();
    window.addEventListener("resize", update);
    if (window.ResizeObserver && header) new ResizeObserver(update).observe(header);
  }

  // ===== Boot =====
  document.addEventListener("DOMContentLoaded", async () => {
    bindBack();
    adjustTopbar();

    const ok = await waitForCases();
    const id = getIdFromUrlOrStorage();

    if (!ok || !id || !window.CASES?.[id]) {
      location.href = "/cases.html";
      return;
    }
    renderCase(window.CASES[id]);
  });

  (function () {
    function setTopbarVar() {
      const header = document.querySelector(".home-header");
      if (!header) return;
      const h = Math.ceil(header.getBoundingClientRect().height);
      document.documentElement.style.setProperty("--topbar-h", h + "px");
    }
    window.addEventListener("load", setTopbarVar);
    window.addEventListener("resize", setTopbarVar);
  })();
})();
