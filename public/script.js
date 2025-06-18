const apiUrl = "/api/players";
const scoresApiUrl = "/api/games";
const teamsApiUrl = "/api/teams";
const playerList = document.getElementById("player-list");
const searchInput = document.getElementById("search-input");
const scoresSection = document.getElementById("scores");
const upcomingGamesDiv = document.getElementById("upcoming-games");
const lastGameDiv = document.getElementById("last-game");

let lastRequestTime = 0;
const REQUEST_INTERVAL = 12000; // 12 secondes entre chaque requête pour les joueurs

let cachedTeams = null;

async function fetchTeams() {
  if (cachedTeams) return cachedTeams;
  try {
    const response = await fetch(teamsApiUrl);
    const data = await response.json();
    cachedTeams = data.data;
    return cachedTeams;
  } catch (error) {
    console.error("Erreur lors de la récupération des équipes :", error);
    return [];
  }
}

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

const searchButton = document.getElementById("search-button");
if (searchButton) {
  searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query !== "") {
      fetchPlayers(query);
    }
  });
}

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
  const dateFormatted = new Date(game.date).toLocaleDateString("fr-FR", {
    weekday: "long",
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

  const statusText = isFinal ? "Terminé" : isLive ? "En cours" : "À venir";

  const isPlayoff = game.postseason;

  const scoreText = isLive
    ? `<div class="period">⏱ Quart temps actuel : ${game.period}</div>`
    : isFinal
      ? `Score final : ${game.home_team_score} - ${game.visitor_team_score}`
      : "";

  return `
  <div class="${cardClass}${isPlayoff ? " playoff" : ""}" data-id="${game.id}" data-home="${game.home_team.id}" data-visitor="${game.visitor_team.id}">
    <strong>${game.home_team.full_name}</strong> vs <strong>${game.visitor_team.full_name}</strong><br>
    ${scoreText}
    <div class="status">${statusText}</div>
    <div class="date">${dateFormatted}</div>
    ${isPlayoff ? `<div class="playoff-tag">🏆 Match de playoffs</div>` : ""}
  </div>
`;
}

fetchGames();

// Détails au clic avec infos équipes

document.addEventListener("click", async (event) => {
  const gameCard = event.target.closest(".game-score");
  if (gameCard && gameCard.dataset.id) {
    const homeId = parseInt(gameCard.dataset.home);
    const visitorId = parseInt(gameCard.dataset.visitor);
    const teams = await fetchTeams();

    const homeTeam = teams.find((t) => t.id === homeId);
    const visitorTeam = teams.find((t) => t.id === visitorId);

    const infoDiv = document.getElementById("game-info");
    if (infoDiv) {
      infoDiv.style.display = "block";
      infoDiv.innerHTML = `
        <h2>Informations sur les équipes</h2>
        <div class="team-info">
          <h3>${homeTeam.full_name}</h3>
          <p>📍 ${homeTeam.city}</p>
          <p>🅰️ Abréviation : ${homeTeam.abbreviation}</p>
          <p>🌍 Conférence : ${homeTeam.conference}</p>
          <p>🏅 Division : ${homeTeam.division}</p>
        </div>
        <div class="team-info">
          <h3>${visitorTeam.full_name}</h3>
          <p>📍 ${visitorTeam.city}</p>
          <p>🅰️ Abréviation : ${visitorTeam.abbreviation}</p>
          <p>🌍 Conférence : ${visitorTeam.conference}</p>
          <p>🏅 Division : ${visitorTeam.division}</p>
        </div>
      `;
      window.scrollTo({
        top: infoDiv.offsetTop - 20,
        behavior: "smooth",
      });
    }
  }
});
