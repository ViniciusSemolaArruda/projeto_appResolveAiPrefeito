// /src/js/case.js
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);

  /* ================================================
     MAPAS DE STATUS (herda do window se houver)
  ================================================= */
  const LABEL = Object.assign(
    { received: "Recebida", progress: "Em andamento", done: "Concluída" },
    window.STATUS_LABEL || {}
  );
  const CLASSNAME = Object.assign(
    { received: "badge-received", progress: "badge-progress", done: "badge-done" },
    window.STATUS_CLASS || {}
  );
  const ICON = Object.assign(
    { received: "📦", progress: "🔧", done: "✅" },
    // Suporta também DOT_EMOJI antigo como fallback
    window.STATUS_ICON || window.DOT_EMOJI || {}
  );

  /* ================================================
     NORMALIZAÇÃO (aceita variações)
  ================================================= */
  const ALIAS = {
    RECEBIDA: "received",
    RECEIVED: "received",
    "EM ANDAMENTO": "progress",
    ANDAMENTO: "progress",
    IN_PROGRESS: "progress",
    PROGRESS: "progress",
    WORKING: "progress",
    CONCLUIDA: "done",
    CONCLUÍDA: "done",
    CONCLUIDO: "done",
    CONCLUÍDO: "done",
    DONE: "done",
    COMPLETED: "done",
  };
  function normStatus(v) {
    const k = String(v || "").trim().toUpperCase();
    return ALIAS[k] || String(v || "received").toLowerCase();
  }

  /* ================================================
     UTIL: datas BR (para timeline)
  ================================================= */
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

  /* ================================================
     OBTÉM CASES E ID
  ================================================= */
  function getIdFromUrlOrStorage() {
    const qp = new URLSearchParams(location.search);
    const idQ = qp.get("id");
    if (idQ) return idQ;

    const parts = location.pathname.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (last && /^\d+$/.test(last)) return last;

    try {
      const saved = localStorage.getItem("lastCaseId");
      if (saved) return saved;
    } catch {}
    return null;
  }

  function resolveCases() {
    const c = window.CASES;
    if (!c) return null;
    if (Array.isArray(c)) return c; // [{ id, ... }]
    if (typeof c === "object") {
      // transforma objeto em array, preservando id
      return Object.keys(c).map(id => ({ id, ...(c[id] || {}) }));
    }
    return null;
  }

  function findCaseById(casesArr, id) {
    if (!casesArr || !id) return null;
    return casesArr.find(c => String(c.id) === String(id)) || null;
  }

  /* ================================================
     TIMELINE: normaliza e preenche faltas
  ================================================= */
  function normalizeTimeline(data) {
    const list = Array.isArray(data.timeline) ? data.timeline : [];
    let TL = list.map(ev => ({
      ...ev,
      type: normStatus(ev.type || ev.status || "received"),
      date: ev.date || "",
      desc: ev.desc || ev.message || "",
    }));

    const statusNorm = normStatus(data.status);
    const hasRec = TL.some(e => e.type === "received");
    const hasProg = TL.some(e => e.type === "progress");
    const hasDone = TL.some(e => e.type === "done");

    // Se concluída e não há "done", cria um evento DONE
    if (statusNorm === "done" && !hasDone) {
      const lastWithDate = [...TL].reverse().find(e => parseBrDate(e.date));
      const base = lastWithDate ? parseBrDate(lastWithDate.date) : new Date();
      TL.push({ type: "done", date: formatBrDate(base || new Date()), desc: "Serviço concluído" });
    }

    // Se há DONE mas não há PROGRESS, cria progresso entre RECEIVED e DONE
    if (TL.some(e => e.type === "done") && !hasProg) {
      const rec  = TL.find(e => e.type === "received");
      const done = TL.find(e => e.type === "done");
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
      TL.push({ type: "progress", date: formatBrDate(d), desc: "Ocorrência em atendimento" });
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

    // Se concluída e datas iguais, força ordem lógica
    const isConcluded = statusNorm === "done" || TL.some(e => e.type === "done");
    if (isConcluded) {
      const order = { received: 0, progress: 1, done: 2 };
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

  /* ================================================
     UI: BADGE (ícone + label + classe)
  ================================================= */
  function applyStatusBadge(el, statusRaw) {
    if (!el) return;
    const s = normStatus(statusRaw);
    const cls = CLASSNAME[s] || CLASSNAME.received;
    const ico = ICON[s] || ICON.received;
    const txt = LABEL[s] || LABEL.received;
    el.className = `badge ${cls}`;
    el.innerHTML = `<span class="st-ico" aria-hidden="true">${ico}</span>${txt}`;
    el.setAttribute("data-status", s);
  }

  /* ================================================
     TIMELINE (usa mesmos ícones/cores/labels)
  ================================================= */
  function renderTimeline(tlEl, data) {
    if (!tlEl) return;
    const timeline = normalizeTimeline(data);

    tlEl.innerHTML = timeline.map(ev => {
      const s = normStatus(ev.type || ev.status || "received");
      const ico = ICON[s] || "•";
      const cls = CLASSNAME[s] || CLASSNAME.received;
      const lbl = LABEL[s] || "";
      const date = ev.date ? `<span class="tl-date">📅 ${ev.date}</span>` : "";
      const desc = ev.desc || "";

      return `
        <li class="tl-item">
          <span class="tl-dot">${ico}</span>
          <div class="tl-content">
            <div class="tl-row">
              <span class="badge ${cls}">${lbl}</span>
              ${date}
            </div>
            <p class="tl-desc">${desc}</p>
          </div>
        </li>`;
    }).join("");

    // Se não concluiu, adiciona “Aguardando atualização”
    const hasDone = timeline.some(e => normStatus(e.type) === "done");
    if (!hasDone) {
      tlEl.insertAdjacentHTML("beforeend", `
        <li class="tl-item tl-awaiting">
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
              <span class="badge ${CLASSNAME.progress}">
                <span class="st-ico" aria-hidden="true"></span>
                Aguardando atualização
              </span>
              <span class="tl-date">🕓 em breve</span>
            </div>
            <p class="tl-desc">Aguarde, sua solicitação está em fila de processamento.</p>
          </div>
        </li>
      `);
    }
  }

  /* ================================================
     RENDER DETALHE
  ================================================= */
  function renderCase(data) {
    $("#cd-title").textContent = data.title || "—";
    $("#cd-protocol").textContent = `Protocolo: ${data.protocol || "—"}`;

    applyStatusBadge($("#cd-status"), data.status);

    const img = $("#cd-image");
    if (img) img.src = data.image || "/src/assets/img/placeholder.png";

    $("#cd-category").textContent = data.category || "—";
    $("#cd-description").textContent = data.description || "—";
    $("#cd-address").textContent = data.address || "—";

    renderTimeline($("#cd-timeline"), data);
  }

  /* ================================================
     VOLTAR INTELIGENTE
  ================================================= */
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

  /* ================================================
     AJUSTA VAR --topbar-h (para sub-bar sticky)
  ================================================= */
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

  /* ================================================
     BOOT
  ================================================= */
  document.addEventListener("DOMContentLoaded", () => {
    bindBack();
    adjustTopbar();

    const id = getIdFromUrlOrStorage();
    const cases = resolveCases();

    if (!id || !cases || !cases.length) {
      console.warn("Caso/dados não encontrados. Indo para /cases.html");
      location.href = "/cases.html";
      return;
    }

    const data = findCaseById(cases, id) || cases[0];
    try { localStorage.setItem("lastCaseId", String(data.id)); } catch {}

    renderCase(data);
  });

  // Redundância leve para garantir --topbar-h após load
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
