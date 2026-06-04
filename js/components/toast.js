const Toast = (() => {
  let el = null;

  function ensure() { if (!el) el = document.getElementById('toast'); }

  function show(message, type) {
    ensure();
    if (!el) return;
    const msg = el.querySelector('#toastMsg');
    const ico = el.querySelector('.toast-ico');
    if (msg) msg.textContent = message;
    const colors = { success: '#10B981', error: '#EF4444', info: '#4F46E5' };
    if (ico) ico.style.background = colors[type] || '#10B981';
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(function() { el.classList.remove('show'); }, 3600);
  }

  return { show };
})();

window.Toast = Toast;
