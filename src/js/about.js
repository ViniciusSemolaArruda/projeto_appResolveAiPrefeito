// =============================================
// Página: Sobre a Prefeitura (sobre.html)
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  // Botão VOLTAR (robusto)
  const back = document.getElementById('btn-back-about');
  const goBackSmart = (e) => {
    if (e) e.preventDefault();
    if (history.length > 1) { history.back(); return; }
    if (document.referrer) {
      try {
        const r = new URL(document.referrer);
        if (r.origin === location.origin) { location.href = document.referrer; return; }
      } catch {}
    }
    location.href = '/home.html';
  };
  back?.addEventListener('click', goBackSmart);

  // Ajusta a sub-barra para não sobrepor o header
  const header = document.querySelector('.home-header');
  const updateTop = () => {
    const h = (header?.offsetHeight) || 100;
    document.documentElement.style.setProperty('--topbar-h', `${h}px`);
  };
  updateTop();
  window.addEventListener('resize', updateTop);
  if (window.ResizeObserver && header) new ResizeObserver(updateTop).observe(header);
});
