import fs from "fs/promises";
import path from "path";

const COMMENTS_FILE = path.resolve(process.cwd(), "comments.json");

async function readComments() {
  try {
    const data = await fs.readFile(COMMENTS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeComments(comments) {
  await fs.writeFile(COMMENTS_FILE, JSON.stringify(comments, null, 2));
}

export default async function handler(req, res) {
  const { method } = req;
  if (method === "GET") {
    // ?gameId=xxx&filter=24h|7d
    const { gameId, filter } = req.query;
    let comments = await readComments();
    if (gameId) comments = comments.filter((c) => c.gameId === gameId);

    if (filter === "24h") {
      const since = Date.now() - 24 * 60 * 60 * 1000;
      comments = comments.filter((c) => c.date > since);
    }
    if (filter === "7d") {
      const since = Date.now() - 7 * 24 * 60 * 60 * 1000;
      comments = comments.filter((c) => c.date > since);
    }
    return res.status(200).json(comments);
  }

  if (method === "POST") {
    const { gameId, userId, note, text } = req.body;
    if (typeof note !== "number" || note < 0 || note > 5)
      return res.status(400).json({ error: "Note obligatoire entre 0 et 5" });
    if (!gameId || !userId)
      return res.status(400).json({ error: "gameId et userId requis" });

    let comments = await readComments();
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
    await writeComments(comments);
    return res.status(201).json({ success: true });
  }

  res.status(405).end();
}
