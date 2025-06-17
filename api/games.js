// /api/games.js
export default async function handler(req, res) {
  const date = new Date().toISOString().split("T")[0];
  const url = `https://api.balldontlie.io/v1/games?dates[]=${date}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: "Erreur API externe" });
    }
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Erreur serveur", details: error.message });
  }
}
