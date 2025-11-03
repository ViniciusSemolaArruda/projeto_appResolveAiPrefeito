// =========================================================
// Página: Contatos (contato.html)
// =========================================================
document.addEventListener('DOMContentLoaded', () => {
  // Botão VOLTAR (inteligente)
  const backBtn = document.getElementById('btn-back-contact');
  const goBackSmart = (e) => {
    if (e) e.preventDefault();

    // 1) histórico navegável
    if (history.length > 1) {
      history.back();
      return;
    }
    // 2) referrer mesma origem
    if (document.referrer) {
      try {
        const ref = new URL(document.referrer);
        if (ref.origin === location.origin) {
          location.href = document.referrer;
          return;
        }
      } catch {}
    }
    // 3) fallback
    location.href = '/home.html';
  };
  if (typeof window.on === 'function') on('#btn-back-contact', 'click', goBackSmart);
  else if (backBtn) backBtn.addEventListener('click', goBackSmart);

  // Mantém a sub-barra exatamente abaixo do header (sem sobreposição)
  const header = document.querySelector('.home-header');
  const updateTopbarHeight = () => {
    const h = (header && header.offsetHeight) || 100;
    document.documentElement.style.setProperty('--topbar-h', `${h}px`);
  };
  updateTopbarHeight();
  window.addEventListener('resize', updateTopbarHeight);
  if (window.ResizeObserver && header) new ResizeObserver(updateTopbarHeight).observe(header);
});
