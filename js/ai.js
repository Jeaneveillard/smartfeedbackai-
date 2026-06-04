var AI = (function () {
  'use strict';

  /* ─── Provider catalogue ──────────────────────────────────────────────── */
  var PROVIDERS = {
    mock:    { label: 'Démonstration (sans clé)',  needsKey: false, placeholder: '' },
    claude:  { label: 'Claude — Anthropic',        needsKey: true,  placeholder: 'sk-ant-…' },
    chatgpt: { label: 'ChatGPT — OpenAI',          needsKey: true,  placeholder: 'sk-…' },
    grok:    { label: 'Grok — xAI',                needsKey: true,  placeholder: 'xai-…' },
    mistral: { label: 'Mistral AI',                needsKey: true,  placeholder: 'Votre clé Mistral' },
    gemini:  { label: 'Google Gemini',             needsKey: true,  placeholder: 'AIza…' },
    custom:  { label: 'Fournisseur personnalisé',  needsKey: true,  placeholder: 'Votre clé API' }
  };

  /* ─── Mock templates (5 ratings × 4 tones) ───────────────────────────── */
  var TEMPLATES = {
    5: {
      professional: "Chère {name}, nous vous remercions sincèrement pour cette note parfaite et pour le temps que vous avez pris pour partager votre expérience. Toute notre équipe est fière de vous avoir accueillie et de vous avoir offert un moment à la hauteur de vos attentes. C'est cette reconnaissance qui nous motive chaque jour à donner le meilleur de nous-mêmes. Nous espérons avoir le plaisir de vous retrouver très prochainement.",
      warm:         "Bonjour {name} ! Un immense merci pour ces 5 étoiles qui illuminent notre journée ! Savoir que vous avez passé un aussi beau moment chez nous nous remplit de joie. Notre équipe en cuisine comme en salle a mis tout son cœur à vous accueillir, et votre retour est la plus belle des récompenses. On vous attend avec impatience pour une prochaine fois !",
      formal:       "Madame, Monsieur {name}, nous vous adressons nos plus vifs remerciements pour l'excellence de la note que vous avez bien voulu nous attribuer. Votre satisfaction est au cœur de nos préoccupations, et nous sommes honorés que votre visite ait pleinement répondu à vos exigences. Soyez assuré(e) que l'ensemble de notre personnel demeure mobilisé pour maintenir ce niveau de qualité. Nous vous souhaitons une excellente continuation.",
      casual:       "Waouh {name}, merci pour ce 5 étoiles ! T'as vraiment fait notre journée ! L'équipe est aux anges en lisant ton avis. On met tout notre cœur dans ce qu'on fait, et c'est super de voir que ça se ressent. À très vite pour un prochain repas, on te réserve le meilleur !"
    },
    4: {
      professional: "Chère {name}, nous vous remercions pour votre avis positif et pour la confiance que vous nous accordez. Nous sommes ravis que votre expérience ait été agréable dans l'ensemble. Nous prenons bonne note de la remarque que vous avez formulée : elle nous est précieuse pour continuer à progresser et vous offrir une expérience encore plus aboutie lors de votre prochaine visite. Au plaisir de vous revoir.",
      warm:         "Bonjour {name}, merci beaucoup pour votre retour et pour vos 4 étoiles ! Nous sommes vraiment contents que vous ayez passé un bon moment chez nous. Votre remarque ne nous a pas échappé, et nous allons y travailler pour que votre prochaine visite soit tout simplement parfaite. On compte sur vous pour revenir nous voir !",
      formal:       "Madame, Monsieur {name}, nous vous remercions de l'intérêt que vous portez à notre établissement et de la note favorable que vous nous avez accordée. Nous prenons acte du point que vous avez soulevé et y prêtons toute l'attention qu'il mérite. Il nous serait agréable de vous accueillir à nouveau et de vous démontrer les progrès accomplis.",
      casual:       "Merci {name} pour les 4 étoiles ! Super content que t'aies aimé ! On a bien vu ton petit commentaire et tu as tout à fait raison — on va s'en occuper. La prochaine fois ce sera 5 étoiles, c'est promis. À bientôt !"
    },
    3: {
      professional: "Chère {name}, nous vous remercions d'avoir pris le temps de partager votre expérience. Nous sommes sincèrement désolés que votre visite n'ait pas été à la hauteur de vos attentes. Des mesures concrètes sont en cours pour fluidifier notre organisation et offrir à chacun le service qu'il mérite. Nous espérons pouvoir vous le démontrer lors d'une prochaine occasion.",
      warm:         "Bonjour {name}, merci d'avoir pris le temps de nous écrire. Nous sommes vraiment désolés que l'attente ait gâché votre expérience — ce n'est vraiment pas ce que nous voulons vous faire vivre. Sachez que nous travaillons en ce moment même pour améliorer notre organisation. Nous aimerions beaucoup vous donner une seconde chance.",
      formal:       "Madame, Monsieur {name}, nous vous remercions de nous avoir fait part de votre ressenti. Nous regrettons sincèrement que votre expérience n'ait pas correspondu au niveau d'excellence que nous nous efforçons d'atteindre. Nous espérons que vous nous accorderez l'opportunité de vous accueillir à nouveau dans de meilleures conditions.",
      casual:       "Bonjour {name} ! Merci pour ton honnêteté, même si on est un peu tristes. L'attente, on sait, c'était long — désolé pour ça. On bosse dur pour que ça ne se reproduise plus. Si tu repasses, on fera tout pour que tu repars avec le sourire. Promis !"
    },
    2: {
      professional: "Chère {name}, nous vous remercions de nous avoir fait part de votre déception. Ce que vous décrivez est inacceptable au regard de nos standards, et nous nous en excusons profondément. Nous souhaitons vivement pouvoir échanger avec vous directement afin de vous apporter une réponse à la hauteur de la situation. N'hésitez pas à nous contacter.",
      warm:         "Bonjour {name}, nous sommes profondément touchés et sincèrement peinés par votre expérience. Ce que vous décrivez ne correspond absolument pas à ce que nous voulons offrir, et nous en sommes vraiment désolés. Votre avis compte énormément pour nous. Nous aimerions vous contacter directement pour réparer cela.",
      formal:       "Madame, Monsieur {name}, nous accusons réception de votre avis et vous présentons nos excuses les plus sincères pour les manquements subis lors de votre visite. Nous vous invitons à prendre contact avec la direction afin que nous puissions examiner votre cas en détail et vous apporter satisfaction.",
      casual:       "Salut {name}, aïe... On est vraiment, vraiment désolés pour ce que tu as vécu. Franchement, c'est nul de notre part et ça ne devrait jamais arriver. On voudrait vraiment se rattraper — t'aurais une minute pour nous écrire en direct ?"
    },
    1: {
      professional: "Chère {name}, nous avons lu votre avis avec attention et vous présentons nos excuses les plus sincères. Nous prenons l'entière responsabilité des manquements que vous décrivez. La direction a été immédiatement informée et des mesures correctrices sont prises sans délai. Nous vous invitons à nous contacter directement afin de rétablir votre confiance.",
      warm:         "Bonjour {name}, votre avis nous a profondément touchés et nous en sommes sincèrement bouleversés. Ce que vous avez vécu est une erreur grave de notre part, et nous en assumons entièrement la responsabilité. Vous méritiez une expérience totalement différente. Donnez-nous cette chance de tout arranger, s'il vous plaît.",
      formal:       "Madame, Monsieur {name}, nous avons pris connaissance de votre témoignage et vous adressons nos excuses les plus profondes. Les faits que vous relatez sont d'une gravité que nous ne saurions minimiser. Des mesures immédiates ont été engagées. Nous vous invitons instamment à contacter notre direction.",
      casual:       "Bonjour {name}, on est vraiment, vraiment honteux de ce que tu as vécu. Pas d'excuses, pas de justification — on a merdé, et tu avais droit à beaucoup mieux. S'il te plaît, contacte-nous directement — on veut absolument arranger ça."
    }
  };

  /* ─── Helpers ─────────────────────────────────────────────────────────── */
  function getAISettings() {
    var s = window.Store ? window.Store.get('settings') : null;
    return (s && s.ai) ? s.ai : { provider: 'mock', apiKey: '', defaultTone: 'professional', language: 'fr' };
  }

  function buildPrompt(opts) {
    var toneMap = {
      professional: 'professionnel et courtois',
      warm:         'chaleureux et bienveillant',
      formal:       'formel et respectueux',
      casual:       'décontracté et proche'
    };
    return {
      system: 'Tu es le gérant d\'un restaurant francophone. Réponds à cet avis client en français, de façon ' +
              (toneMap[opts.tone] || toneMap.professional) + '. Note : ' + opts.rating + '/5. ' +
              'Prénom du client : ' + opts.name + '. Sois humain et sincère. Réponds directement sans guillemets.',
      user: 'Avis client : "' + opts.text + '"\n\nRédige la réponse.'
    };
  }

  /* ─── Mock ────────────────────────────────────────────────────────────── */
  function generateMock(opts) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        var key = Math.min(Math.max(Math.round(opts.rating), 1), 5);
        var tpl = (TEMPLATES[key] || TEMPLATES[5])[opts.tone] || TEMPLATES[5].professional;
        resolve(tpl.replace(/\{name\}/g, opts.name));
      }, 1200 + Math.random() * 1000);
    });
  }

  /* ─── Claude (Anthropic) ──────────────────────────────────────────────── */
  function callClaude(apiKey, opts) {
    var p = buildPrompt(opts);
    return fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: p.system,
        messages: [{ role: 'user', content: p.user }]
      })
    }).then(function (r) {
      if (!r.ok) throw new Error('Claude ' + r.status);
      return r.json();
    }).then(function (d) { return d.content[0].text; });
  }

  /* ─── ChatGPT (OpenAI) ───────────────────────────────────────────────── */
  function callChatGPT(apiKey, opts) {
    var p = buildPrompt(opts);
    return fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 400,
        messages: [
          { role: 'system', content: p.system },
          { role: 'user',   content: p.user   }
        ]
      })
    }).then(function (r) {
      if (!r.ok) throw new Error('ChatGPT ' + r.status);
      return r.json();
    }).then(function (d) { return d.choices[0].message.content; });
  }

  /* ─── Grok (xAI) — OpenAI-compatible format ──────────────────────────── */
  function callGrok(apiKey, opts) {
    var p = buildPrompt(opts);
    return fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: 'grok-3-mini',
        max_tokens: 400,
        messages: [
          { role: 'system', content: p.system },
          { role: 'user',   content: p.user   }
        ]
      })
    }).then(function (r) {
      if (!r.ok) throw new Error('Grok ' + r.status);
      return r.json();
    }).then(function (d) { return d.choices[0].message.content; });
  }

  /* ─── Mistral ─────────────────────────────────────────────────────────── */
  function callMistral(apiKey, opts) {
    var p = buildPrompt(opts);
    return fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        max_tokens: 400,
        messages: [
          { role: 'system', content: p.system },
          { role: 'user',   content: p.user   }
        ]
      })
    }).then(function (r) {
      if (!r.ok) throw new Error('Mistral ' + r.status);
      return r.json();
    }).then(function (d) { return d.choices[0].message.content; });
  }

  /* ─── Gemini ──────────────────────────────────────────────────────────── */
  function callGemini(apiKey, opts) {
    var p = buildPrompt(opts);
    var url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + encodeURIComponent(apiKey);
    return fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: p.system + '\n\n' + p.user }]
        }],
        generationConfig: { maxOutputTokens: 400 }
      })
    }).then(function (r) {
      if (!r.ok) throw new Error('Gemini ' + r.status);
      return r.json();
    }).then(function (d) {
      return d.candidates[0].content.parts[0].text;
    });
  }

  /* ─── Fournisseur personnalisé (format OpenAI-compatible) ─────────────── */
  function callCustom(apiKey, opts, custom) {
    var endpoint = (custom && custom.endpoint) ? custom.endpoint.trim() : '';
    var model    = (custom && custom.model)    ? custom.model.trim()    : 'gpt-3.5-turbo';
    if (!endpoint) return Promise.reject(new Error('Endpoint manquant'));

    var p = buildPrompt(opts);
    return fetch(endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 400,
        messages: [
          { role: 'system', content: p.system },
          { role: 'user',   content: p.user   }
        ]
      })
    }).then(function (r) {
      if (!r.ok) throw new Error('Custom API ' + r.status);
      return r.json();
    }).then(function (d) { return d.choices[0].message.content; });
  }

  /* ─── Dispatcher — maps provider key → call function ─────────────────── */
  function dispatchCall(prov, apiKey, opts) {
    var ai     = getAISettings();
    var custom = ai.customProvider || {};
    if (prov === 'claude')  return callClaude(apiKey, opts);
    if (prov === 'chatgpt') return callChatGPT(apiKey, opts);
    if (prov === 'grok')    return callGrok(apiKey, opts);
    if (prov === 'mistral') return callMistral(apiKey, opts);
    if (prov === 'gemini')  return callGemini(apiKey, opts);
    if (prov === 'custom')  return callCustom(apiKey, opts, custom);
    return null;
  }

  /* ─── testApiKey — verifies the key works for the given provider ──────── */
  function testApiKey(apiKey, provider) {
    var prov  = provider || getAISettings().provider || 'mock';
    var dummy = { rating: 5, tone: 'professional', name: 'Test', text: 'Super!' };
    var call  = dispatchCall(prov, apiKey, dummy);
    if (!call) return Promise.resolve(true); // mock always works
    return call.then(function () { return true; }).catch(function () { return false; });
  }

  /* ─── Main entry point ────────────────────────────────────────────────── */
  function generate(opts) {
    var ai   = getAISettings();
    var prov = ai.provider || 'mock';
    var key  = (ai.apiKey || '').trim();

    if (prov === 'mock' || !key) return generateMock(opts);

    var call = dispatchCall(prov, key, opts);
    if (!call) return generateMock(opts);
    return call.catch(function () { return generateMock(opts); });
  }

  return { generate: generate, testApiKey: testApiKey, PROVIDERS: PROVIDERS, TEMPLATES: TEMPLATES };
})();

window.AI = AI;
