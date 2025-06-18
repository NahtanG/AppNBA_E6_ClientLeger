export default async function handler(req, res) {
  const { id } = req.query;
  const url = id
    ? `https://api.balldontlie.io/v1/teams/${id}`
    : `https://api.balldontlie.io/v1/teams`;

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.BALLDONTLIE_API_KEY}`,
      },
    });

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
