// =========================================================
// Página: Registrar Nova Ocorrência (report.html)
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById('btn-back-report');

  const goBackSmart = (e) => {
    if (e) e.preventDefault();

    // 1) Se existir histórico navegável, volta
    if (history.length > 1) {
      history.back();
      return;
    }

    // 2) Se entrou via link (referrer) e é mesma origem, volta pra lá
    if (document.referrer) {
      try {
        const ref = new URL(document.referrer);
        if (ref.origin === location.origin) {
          location.href = document.referrer;
          return;
        }
      } catch (_) { /* ignore */ }
    }

    // 3) Fallback: manda pra home
    location.href = 'home.html';
  };

  // Liga o evento usando o helper "on" se ele existir; senão usa nativo
  if (typeof window.on === 'function') {
    on('#btn-back-report', 'click', goBackSmart);
  } else if (backBtn) {
    backBtn.addEventListener('click', goBackSmart);
  }

  // Acessibilidade: ativa com Enter/Espaço se for <button>
  if (backBtn) {
    backBtn.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        goBackSmart(ev);
      }
    });
  }

  // ===== Botões de demonstração =====
  const geo = document.getElementById('btn-geolocate');
  if (geo) geo.addEventListener('click', () => alert('Mostruário: geolocalização simulada.'));

  const enviar = document.getElementById('btn-enviar-oc');
  if (enviar) enviar.addEventListener('click', () => alert('Mostruário: ocorrência enviada (simulação).'));

  // ===== Ajuste dinâmico da altura do header p/ posicionar a sub-barra =====
  const header = document.querySelector('.home-header');
  const updateTopbarHeight = () => {
    if (!header) return;
    const h = header.offsetHeight || 56;
    document.documentElement.style.setProperty('--topbar-h', `${h}px`);
  };
  updateTopbarHeight();
  window.addEventListener('resize', updateTopbarHeight);
  if (window.ResizeObserver) new ResizeObserver(updateTopbarHeight).observe(header);
});
