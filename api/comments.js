let comments = [];

export default async function handler(req, res) {
  const { method } = req;
  if (method === "GET") {
    const { gameId, filter } = req.query;
    let filtered = comments;
    if (gameId) filtered = filtered.filter((c) => c.gameId === gameId);

    if (filter === "24h") {
      const since = Date.now() - 24 * 60 * 60 * 1000;
      filtered = filtered.filter((c) => c.date > since);
    }
    if (filter === "7d") {
      const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
      filtered = filtered.filter((c) => c.date > since);
    }
    return res.status(200).json(filtered);
  }

  if (method === "POST") {
    let { gameId, userId, note, text } = req.body;
    if (typeof note !== "number") note = Number(note);
    if (isNaN(note) || note < 0 || note > 5)
      return res.status(400).json({ error: "Note obligatoire entre 0 et 5" });
    if (!gameId || !userId)
      return res.status(400).json({ error: "gameId et userId requis" });

    // Un seul avis par user/game
    comments = comments.filter(
      (c) => !(c.gameId === gameId && c.userId === userId)
    );
    comments.push({
      gameId,
      userId,
      note,
      text: text || "",
      date: Date.now(),
    });
    return res.status(201).json({ success: true });
  }

  if (method === "DELETE") {
    const { gameId, userId } = req.body;
    if (!gameId || !userId)
      return res.status(400).json({ error: "gameId et userId requis" });

    const before = comments.length;
    comments = comments.filter(
      (c) => !(c.gameId === gameId && c.userId === userId)
    );
    if (comments.length === before)
      return res.status(404).json({ error: "Avis non trouvé" });

    return res.status(200).json({ success: true });
  }

  res.status(405).end();
}
