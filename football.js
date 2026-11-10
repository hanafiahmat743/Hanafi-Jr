// Petit relais : le site demande les données ici, et ce script les récupère
// chez API-Football avec ta clé secrète (stockée dans Netlify, jamais dans la page).
const BASE = "https://v3.football.api-sports.io";
const LEAGUES = [61, 39, 140]; // Ligue 1, Premier League, Liga

exports.handler = async (event) => {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) return { statusCode: 500, body: JSON.stringify({ error: "Clé API manquante" }) };

  const q = event.queryStringParameters || {};
  let path;

  if (q.type === "fixtures") {
    const date = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Paris" });
    path = `/fixtures?date=${date}&timezone=Europe/Paris`;
  } else if (q.type === "standings") {
    const league = parseInt(q.league, 10);
    if (!LEAGUES.includes(league)) return { statusCode: 400, body: "{}" };
    const d = new Date();
    const season = d.getMonth() >= 6 ? d.getFullYear() : d.getFullYear() - 1;
    path = `/standings?league=${league}&season=${season}`;
  } else if (q.type === "stats") {
    const id = parseInt(q.fixture, 10);
    if (!id) return { statusCode: 400, body: "{}" };
    path = `/fixtures/statistics?fixture=${id}`;
  } else {
    return { statusCode: 400, body: "{}" };
  }

  try {
    const r = await fetch(BASE + path, { headers: { "x-apisports-key": key } });
    return {
      statusCode: r.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60",
        "Netlify-CDN-Cache-Control": "public, s-maxage=60"
      },
      body: await r.text()
    };
  } catch (e) {
    return { statusCode: 502, body: JSON.stringify({ error: "API injoignable" }) };
  }
};
