var API = (function() {
  'use strict';
  var BASE = 'https://smartfeedbackai-api.onrender.com';
  var LOCAL = 'http://localhost:3001';

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
      localStorage.removeItem('sfai_jwt');
      window.location.href = window.location.pathname + '#/login';
      return Promise.reject(new Error('Non autorisé'));
    }
    return res.json();
  }

  return {
    get:    function(path) { return fetch(base() + path, { headers: headers() }).then(handle); },
    post:   function(path, body) { return fetch(base() + path, { method: 'POST',   headers: headers(), body: JSON.stringify(body) }).then(handle); },
    put:    function(path, body) { return fetch(base() + path, { method: 'PUT',    headers: headers(), body: JSON.stringify(body) }).then(handle); },
    delete: function(path)       { return fetch(base() + path, { method: 'DELETE', headers: headers() }).then(handle); }
  };
})();
window.API = API;
