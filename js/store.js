const Store = (function () {
  var state = {
    reviews: [],
    settings: {},
    publishedResponses: {}
  };

  function get(key) {
    return state[key];
  }

  function set(key, value) {
    state[key] = value;
    if (key === 'settings' || key === 'publishedResponses') {
      try { localStorage.setItem('sfai_' + key, JSON.stringify(value)); } catch (e) {}
    }
  }

  function init(reviews, settings) {
    var savedSettings = null, savedResponses = null;
    try {
      savedSettings = JSON.parse(localStorage.getItem('sfai_settings'));
      savedResponses = JSON.parse(localStorage.getItem('sfai_publishedResponses'));
    } catch (e) {}

    state.reviews = reviews;

    if (savedSettings) {
      state.settings = Object.assign({}, settings, savedSettings, {
        business: Object.assign({}, settings.business, savedSettings.business),
        ai: Object.assign({}, settings.ai, savedSettings.ai),
        integrations: Object.assign({}, settings.integrations, savedSettings.integrations)
      });
    } else {
      state.settings = settings;
    }

    state.publishedResponses = savedResponses || {};

    // Re-apply persisted published responses over the in-memory review list
    Object.keys(state.publishedResponses).forEach(function (id) {
      var review = state.reviews.find(function (r) { return r.id === id; });
      if (review) {
        review.status = 'responded';
        review.response = state.publishedResponses[id];
      }
    });
  }

  function publishResponse(reviewId, responseText) {
    var review = state.reviews.find(function (r) { return r.id === reviewId; });
    if (review) {
      review.status = 'responded';
      review.response = responseText;
    }
    state.publishedResponses[reviewId] = responseText;
    try { localStorage.setItem('sfai_publishedResponses', JSON.stringify(state.publishedResponses)); } catch (e) {}
  }

  return { get: get, set: set, init: init, publishResponse: publishResponse };
})();

window.Store = Store;
