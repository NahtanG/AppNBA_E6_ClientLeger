const apiUrl = "/api/players";
const scoresApiUrl = "/api/games";
const playerList = document.getElementById("player-list");
const searchInput = document.getElementById("search-input");
const scoresSection = document.getElementById("scores");
const upcomingGamesDiv = document.getElementById("upcoming-games");
const lastGameDiv = document.getElementById("last-game");

let lastRequestTime = 0;
const REQUEST_INTERVAL = 12000; // 12 secondes entre chaque requête pour les joueurs

async function fetchPlayers(query = "") {
  const now = Date.now();
  if (now - lastRequestTime < REQUEST_INTERVAL) {
    console.warn("Limite atteinte. Patientez avant une nouvelle recherche.");
    return;
  }
  lastRequestTime = now;
  playerList.innerHTML = "<li>Chargement...</li>";
  try {
    const response = await fetch(
      `${apiUrl}?search=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    console.log("Réponse API :", data);

    if (!data || !data.data) {
      playerList.innerHTML = "<li>Erreur : format de données inattendu</li>";
      return;
    }

    displayPlayers(data.data);
  } catch (error) {
    console.error("Erreur lors de la récupération des joueurs :", error);
    playerList.innerHTML =
      "<li>Erreur de connexion à l'API ou données non disponibles</li>";
  }
}

function displayPlayers(players) {
  playerList.innerHTML = "";
  if (players.length === 0) {
    playerList.innerHTML = "<li>Aucun joueur trouvé</li>";
    return;
  }

  players.forEach((player) => {
    const li = document.createElement("li");
    li.textContent = `${player.first_name} ${player.last_name} - ${player.team.full_name}`;
    li.addEventListener("click", () => {
      document.getElementById("player-details").style.display = "block";
      document.getElementById("player-name").textContent =
        `${player.first_name} ${player.last_name}`;
      document.getElementById("player-team").textContent =
        `Équipe : ${player.team.full_name}`;
      document.getElementById("player-position").textContent =
        `Poste : ${player.position || "Non spécifié"}`;
    });
    playerList.appendChild(li);
  });
}

// Écoute sur le bouton de recherche
const searchButton = document.getElementById("search-button");
if (searchButton) {
  searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query !== "") {
      fetchPlayers(query);
    }
  });
}

// --- Partie affichage des scores ---
async function fetchGames() {
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 6);

  const lastWeek = new Date();
  lastWeek.setDate(today.getDate() - 6);
  const lastDate = lastWeek.toISOString().split("T")[0];

  const startDate = today.toISOString().split("T")[0];
  const endDate = nextWeek.toISOString().split("T")[0];

  try {
    const response = await fetch(
      `${scoresApiUrl}?start_date=${lastDate}&end_date=${endDate}`
    );
    const data = await response.json();
    console.log("Matchs de la semaine :", data);

    if (data.data && data.data.length > 0) {
      const games = data.data;

      const upcomingGames = games
        .filter((g) => g.status !== "Final")
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 4);

      const finishedGames = games
        .filter((g) => g.status === "Final")
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      const lastGame = finishedGames.length > 0 ? finishedGames[0] : null;

      if (lastGame) {
        lastGameDiv.innerHTML = createGameCard(lastGame, true);
      } else {
        lastGameDiv.innerHTML = "<p>Aucun match terminé récemment.</p>";
      }

      if (upcomingGames.length > 0) {
        upcomingGamesDiv.innerHTML = upcomingGames
          .map((game) => createGameCard(game))
          .join("");
      } else {
        upcomingGamesDiv.innerHTML = "<p>Aucun match à venir.</p>";
      }
    } else {
      upcomingGamesDiv.innerHTML = "<p>Aucun match trouvé cette semaine.</p>";
      lastGameDiv.innerHTML = "";
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des matchs :", error);
    upcomingGamesDiv.innerHTML = "<p>Erreur de récupération des scores.</p>";
  }
}

function createGameCard(game, isLastGame = false) {
  const date = new Date(game.date).toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isLive = game.status.toLowerCase().includes("in progress");
  const isFinal = game.status === "Final";
  const cardClass = isLive
    ? "game-score live"
    : isFinal
      ? "game-score final"
      : "game-score";
  const statusText = isFinal ? "Terminé" : game.status;
  const isPlayoff = game.postseason;

  return `
    <div class="${cardClass}${isPlayoff ? " playoff" : ""}">
      <strong>${game.home_team.full_name}</strong> vs <strong>${game.visitor_team.full_name}</strong><br>
      ${isLastGame ? `Score final` : `Score`} : ${game.home_team_score} - ${game.visitor_team_score}<br>
      ${statusText}<br>
      <div class="date">${date}</div>
      <div class="details">
        ${isPlayoff ? "Match de playoffs" : ""}
        ${isLive ? `<br>Période actuelle : ${game.period}` : ""}
      </div>
    </div>
  `;
}

fetchGames();
