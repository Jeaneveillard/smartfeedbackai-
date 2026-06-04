const Router = (function () {
  var routes = {};
  var currentPage = null;

  function register(path, handler) {
    routes[path] = handler;
  }

  function currentHash() {
    var h = window.location.hash.replace('#', '');
    return h || '/';
  }

  function resolve() {
    var path = currentHash();
    var handler = routes[path] || routes['/'];
    if (handler) {
      currentPage = path;
      handler();
    }
  }

  function init() {
    window.addEventListener('hashchange', resolve);
    resolve();
  }

  function navigate(path) {
    window.location.hash = path;
  }

  function getCurrent() {
    return currentPage;
  }

  return { register: register, init: init, navigate: navigate, getCurrent: getCurrent };
})();

window.Router = Router;
