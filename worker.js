// Cloudflare Worker — proxy CORS para football-data.org
// A API key fica aqui no servidor, nunca no frontend público.

const API_KEY = "89a2622427a146388860dafa13768e32";

export default {
  async fetch(request) {
    const cors = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    // Pega o caminho da requisição e repassa para a football-data.org
    // Ex: /v4/competitions/WC/matches?dateFrom=...&dateTo=...
    const url = new URL(request.url);
    const target = "https://api.football-data.org" + url.pathname + url.search;

    try {
      const apiRes = await fetch(target, {
        headers: { "X-Auth-Token": API_KEY },
      });
      const body = await apiRes.text();
      return new Response(body, {
        status: apiRes.status,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 502,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
  },
};
