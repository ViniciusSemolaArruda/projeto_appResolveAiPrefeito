// /src/js/cases.js
document.addEventListener('DOMContentLoaded', () => {
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
  // Extrai o ID do case a partir de um card
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
    // 3) fallback por índice (evite em produção, mas útil pra mock)
    return String(idxFallback + 1);
  };

  const navigateToCase = (id) => {
    if (!id) return;
    localStorage.setItem('lastCaseId', id);
    location.href = `/case.html?id=${encodeURIComponent(id)}`;
  };

  /* ================================================
     CARDS CLICÁVEIS + LINKS CONSISTENTES
  ================================================= */
  document.querySelectorAll('.case-card').forEach((card, idx) => {
    const id = getCaseIdFromCard(card, idx);

    // Clique no card inteiro (exceto cliques em elementos interativos)
    card.addEventListener('click', (e) => {
      const t = e.target;
      if (t.closest('a, button')) return; // não intercepta cliques em links/botões
      navigateToCase(id);
    });

    // Acessibilidade: Enter ou Espaço em cards com role="link"
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        // Evita scroll do Espaço
        e.preventDefault();
        navigateToCase(id);
      }
    });

    // Link "Ver detalhes" deve salvar o id e navegar padronizado
    const detailsLink = card.querySelector('.meta-link[href*="case.html?id="]');
    if (detailsLink) {
      detailsLink.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigateToCase(id);
      });
    }

    // Seta (chevron) à direita: mesmo comportamento do link
    const moreLink = card.querySelector('.meta-more[href*="case.html?id="], .meta-more');
    if (moreLink) {
      moreLink.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        // tenta extrair do próprio href primeiro
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
