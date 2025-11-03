document.addEventListener('DOMContentLoaded', () => {
  // ===== Splash =====
  const DISPLAY_TIME_MS = 3000;
  document.documentElement.classList.add('splash-mounted');
  const splash = $('#splash');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const closeSplash = () => {
    if (prefersReduced) {
      splash?.remove();
      return;
    }
    document.documentElement.classList.add('splash-leaving');
    setTimeout(() => splash?.remove(), 500);
  };

  splash?.addEventListener('click', closeSplash);
  setTimeout(closeSplash, DISPLAY_TIME_MS);

  // ===== Tabs Login/Registro =====
  const setTab = (tab) => {
    const isLogin = tab === 'login';
    $('#tab-login')?.classList.toggle('active', isLogin);
    $('#tab-login')?.setAttribute('aria-selected', isLogin);
    $('#tab-register')?.classList.toggle('active', !isLogin);
    $('#tab-register')?.setAttribute('aria-selected', !isLogin);
    $('#form-login')?.classList.toggle('hidden', !isLogin);
    $('#form-register')?.classList.toggle('hidden', isLogin);
  };

  on('#tab-login', 'click', () => setTab('login'));
  on('#tab-register', 'click', () => setTab('register'));

  // ===== Login → Home.html =====
  on('#btn-entrar', 'click', (e) => {
    e.preventDefault();
    // Aqui você validaria o login; no demo, apenas redireciona:
    location.href = 'home.html';
  });

  document.getElementById("btn-admin")?.addEventListener("click", () => {
    // redireciona para a página do painel admin
    window.location.href = "./admin.html";
  });
});
