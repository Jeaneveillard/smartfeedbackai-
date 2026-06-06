var API = (function() {
  'use strict';
  var BASE = 'https://smartfeedbackai-api.onrender.com';
  var LOCAL = 'http://localhost:3001';
  var _reloading = false;

  function base() {
    if (window.API_BASE) return window.API_BASE;
    var h = window.location.hostname;
    if (h === 'localhost' || h === '127.0.0.1') return LOCAL;
    return BASE;
  }
  function token() { return localStorage.getItem('sfai_jwt'); }
  function headers() {
    return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token() };
  }

  function handle(res) {
    if (res.status === 401) {
      if (_reloading) return Promise.reject(new Error('Non autorisé'));
      _reloading = true;
      // If an admin was previewing a client and the preview token expired,
      // restore the admin session instead of logging everyone out.
      var adminJwt = localStorage.getItem('sfai_jwt_admin');
      if (adminJwt) {
        localStorage.setItem('sfai_jwt', adminJwt);
        localStorage.removeItem('sfai_jwt_admin');
        localStorage.removeItem('sfai_preview_name');
      } else {
        localStorage.removeItem('sfai_jwt');
      }
      // Reload — boot() shows the landing/login page when there's no valid JWT.
      window.location.reload();
      return Promise.reject(new Error('Non autorisé'));
    }
    return res.json();
  }

  return {
    base:   base,
    get:    function(path)       { return fetch(base() + path, { headers: headers() }).then(handle); },
    post:   function(path, body) { return fetch(base() + path, { method: 'POST',   headers: headers(), body: JSON.stringify(body) }).then(handle); },
    put:    function(path, body) { return fetch(base() + path, { method: 'PUT',    headers: headers(), body: JSON.stringify(body) }).then(handle); },
    patch:  function(path, body) { return fetch(base() + path, { method: 'PATCH',  headers: headers(), body: JSON.stringify(body) }).then(handle); },
    delete: function(path)       { return fetch(base() + path, { method: 'DELETE', headers: headers() }).then(handle); }
  };
})();
window.API = API;
