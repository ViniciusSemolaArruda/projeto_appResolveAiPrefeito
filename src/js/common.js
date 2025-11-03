// =========================================================
// Utilitários compartilhados para todo o projeto
// =========================================================

// Seleciona o primeiro elemento que corresponde ao seletor
window.$ = (sel, root = document) => root.querySelector(sel);

// Seleciona todos os elementos que correspondem ao seletor
window.$$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Adiciona listener de evento de forma prática
window.on = (sel, ev, cb, root = document) => {
  const el = $(sel, root);
  if (el) el.addEventListener(ev, cb);
};

// Lê parâmetros da URL (?key=value)
window.getParam = (k) => new URLSearchParams(location.search).get(k);

document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.querySelector('.btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // Limpa dados locais (se houver login/sessão)
      localStorage.clear();
      sessionStorage.clear();

      // Redireciona e reinicia o app
      window.location.replace('/index.html');
    });
  }
});