// /src/js/cases.js
document.addEventListener('DOMContentLoaded', () => {
  /* ================================================
     MAPAS GLOBAIS DE STATUS (mesmas cores/ícones)
  ================================================= */
  const STATUS_LABEL = {
    received: 'Recebida',
    progress: 'Em andamento',
    done: 'Concluída',
  };
  const STATUS_CLASS = {
    received: 'badge-received',
    progress: 'badge-progress',
    done: 'badge-done',
  };
  const STATUS_ICON = {
    received: '📦',
    progress: '🔧',
    done: '✅',
  };

  // expõe para outras páginas (ex.: case.js)
  try {
    window.STATUS_LABEL = Object.assign({}, window.STATUS_LABEL || {}, {
      RECEIVED: 'Recebida',
      PROGRESS: 'Em andamento',
      DONE: 'Concluída',
    });
    window.STATUS_CLASS = Object.assign({}, window.STATUS_CLASS || {}, {
      RECEIVED: 'badge-received',
      PROGRESS: 'badge-progress',
      DONE: 'badge-done',
    });
    window.STATUS_ICON = Object.assign({}, window.STATUS_ICON || {}, {
      RECEIVED: '📦',
      PROGRESS: '🔧',
      DONE: '✅',
    });
  } catch {}

  // normalizador para garantir chaves coerentes
  const NORM = {
    received: 'received',
    progress: 'progress',
    done: 'done',
    RECEIVED: 'received',
    PROGRESS: 'progress',
    DONE: 'done',
  };
  const norm = (v) => NORM[String(v || '').trim()] || 'received';

  // helper: monta o badge com ícone e label (sem ::before)
  function renderStatusBadge(status) {
    const k = norm(status);
    const cls = STATUS_CLASS[k] || 'badge-received';
    const lbl = STATUS_LABEL[k] || 'Status';
    const ico = STATUS_ICON[k] || '';
    return `<span class="badge ${cls}"><span class="b-ico" aria-hidden="true">${ico}</span>${lbl}</span>`;
  }

  /* ================================================
     VOLTAR INTELIGENTE
  ================================================= */
  const backBtn = document.getElementById('btn-back-cases');
  const goBackSmart = (e) => {
    if (e) e.preventDefault();
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
    location.href = '/home.html';
  };
  backBtn?.addEventListener('click', goBackSmart);

  /* ================================================
     AJUSTE DA ALTURA DO TOPO (sub-bar)
  ================================================= */
  const header = document.querySelector('.home-header');
  const updateTopbarHeight = () => {
    const h = (header && header.offsetHeight) || 100;
    document.documentElement.style.setProperty('--topbar-h', `${h}px`);
  };
  updateTopbarHeight();
  window.addEventListener('resize', updateTopbarHeight);
  if (window.ResizeObserver && header) {
    new ResizeObserver(updateTopbarHeight).observe(header);
  }

  /* ================================================
     HELPERS
  ================================================= */
  const getCaseIdFromCard = (card, idxFallback) => {
    // 1) meta-link com href case.html?id=...
    const link = card.querySelector('.meta-link[href*="case.html?id="]');
    if (link) {
      try {
        const u = new URL(link.getAttribute('href'), location.origin);
        const got = u.searchParams.get('id');
        if (got) return got;
      } catch {}
    }
    // 2) data-case-id no article
    const dataId = card.getAttribute('data-case-id');
    if (dataId) return dataId;
    // 3) fallback por índice (mock)
    return String(idxFallback + 1);
  };

  const navigateToCase = (id) => {
    if (!id) return;
    try { localStorage.setItem('lastCaseId', id); } catch {}
    location.href = `/case.html?id=${encodeURIComponent(id)}`;
  };

  /* ================================================
     CARDS CLICÁVEIS + LINKS CONSISTENTES
     (e badges com ícone)
  ================================================= */
  document.querySelectorAll('.case-card').forEach((card, idx) => {
    const id = getCaseIdFromCard(card, idx);

    // Se o badge de status existir, injeta ícone + label
    const badgeEl = card.querySelector('.case-head .badge');
    if (badgeEl) {
      // Tenta deduzir o status pela classe existente OU por data-* no card
      const cls = badgeEl.className;
      let st = 'received';
      if (/\bbadge-progress\b/.test(cls)) st = 'progress';
      else if (/\bbadge-done\b/.test(cls)) st = 'done';
      else if (/\bbadge-received\b/.test(cls)) st = 'received';
      // Se tiver data-status no card, usa
      const dataStatus = card.getAttribute('data-status');
      if (dataStatus) st = norm(dataStatus);

      // Substitui conteúdo pelo badge com ícone (sem duplicar)
      badgeEl.outerHTML = renderStatusBadge(st);
    }

    // Clique no card inteiro (exceto interativos)
    card.addEventListener('click', (e) => {
      const t = e.target;
      if (t.closest('a, button')) return;
      navigateToCase(id);
    });

    // Acessibilidade: Enter/Espaço
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navigateToCase(id);
      }
    });

    // Link "Ver detalhes" padronizado
    const detailsLink = card.querySelector('.meta-link[href*="case.html?id="]');
    if (detailsLink) {
      detailsLink.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigateToCase(id);
      });
    }

    // Chevron/“mais”
    const moreLink = card.querySelector('.meta-more[href*="case.html?id="], .meta-more');
    if (moreLink) {
      moreLink.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        let hrefId = '';
        const href = moreLink.getAttribute('href') || '';
        if (href) {
          try {
            hrefId = new URL(href, location.origin).searchParams.get('id') || '';
          } catch {}
        }
        navigateToCase(hrefId || id);
      });
    }
  });
});
