export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },

  // Keep-alive : Render free s'endort après 15 min d'inactivité (~50 s de
  // réveil). Ping /health toutes les 10 min, 7h-minuit heure du Québec,
  // pour rester sous les 750 h/mois du tier gratuit Render.
  async scheduled(event, env, ctx) {
    ctx.waitUntil(
      fetch('https://smartfeedbackai-api.onrender.com/health').catch(() => {})
    );
  },
};
