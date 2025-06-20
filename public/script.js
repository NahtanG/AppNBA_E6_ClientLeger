const apiUrl = "/api/players";
const scoresApiUrl = "/api/games";
const teamsApiUrl = "/api/teams";

const playerList = document.getElementById("player-list");
const searchInput = document.getElementById("search-input");
const scoresSection = document.getElementById("scores");
const upcomingGamesDiv = document.getElementById("upcoming-games");
const lastGameDiv = document.getElementById("last-game");

const searchButton = document.getElementById("search-button");
const teamSearchInput = document.getElementById("team-search-input");
const teamSearchButton = document.getElementById("team-search-button");
const teamSearchResults = document.getElementById("team-search-results");

let lastRequestTime = 0;
const REQUEST_INTERVAL = 12000;

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
      const details = document.getElementById("player-details");
      details.style.display = "block";
      details.innerHTML = `
        <h2>Détails du joueur</h2>
        <div class="team-info">
          <strong>Nom :</strong> ${player.first_name} ${player.last_name}<br>
          <strong>Équipe :</strong> ${player.team.full_name}<br>
          <strong>Poste :</strong> ${player.position || "Non spécifié"}
        </div>
      `;
    });
    playerList.appendChild(li);
  });
}

if (searchButton) {
  searchButton.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query !== "") {
      fetchPlayers(query);
    }
  });
}

if (teamSearchButton) {
  teamSearchButton.addEventListener("click", async () => {
    const query = teamSearchInput.value.trim().toLowerCase();
    if (!query) return;

    const teams = await fetchTeams();
    const filtered = teams.filter((team) =>
      team.full_name.toLowerCase().includes(query)
    );

    teamSearchResults.innerHTML = "";
    if (filtered.length === 0) {
      teamSearchResults.innerHTML = "<li>Aucune équipe trouvée</li>";
      return;
    }

    filtered.forEach((team) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${team.full_name}</strong><br>
        📍 ${team.city} | 🅰️ ${team.abbreviation} | 🌍 ${team.conference} | 🏅 ${team.division}
      `;
      li.classList.add("team-info");
      li.addEventListener("click", () => {
        teamSearchResults.innerHTML = `
          <div id="team-result-details">
            <h2>Détails de l'équipe</h2>
            <div class="team-details-list">
              <p><strong>Nom :</strong> ${team.full_name}</p>
              <p><strong>Ville :</strong> ${team.city}</p>
              <p><strong>Abréviation :</strong> ${team.abbreviation}</p>
              <p><strong>Conférence :</strong> ${team.conference}</p>
              <p><strong>Division :</strong> ${team.division}</p>
            </div>
          </div>
        `;
      });
      teamSearchResults.appendChild(li);
    });
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
        upcomingGamesDiv.innerHTML = upcomingGames.map(createGameCard).join("");
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
  const dateFormatted = new Date(game.date).toLocaleString("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  let cardClass = "game-score";
  let statusText = "";

  if (game.postseason) cardClass += " playoff";
  if (game.status === "Final") {
    cardClass += " final";
    statusText = "Terminé";
  } else if (game.status === "In Progress") {
    cardClass += " live";
    statusText = "En cours";
  } else {
    statusText = "À venir";
  }

  return `
    <div class="${cardClass}" data-id="${game.id}" data-home="${game.home_team.id}" data-visitor="${game.visitor_team.id}">
      <strong>${game.home_team.full_name} vs ${game.visitor_team.full_name}</strong>
      <div class="date">${dateFormatted}</div>
      <div class="status">${statusText}</div>
      ${game.postseason ? '<span class="playoff-tag">🏆 Match de playoffs</span>' : ""}
    </div>
  `;
}

document.addEventListener("click", async (event) => {
  const gameCard = event.target.closest(".game-score");
  if (gameCard && gameCard.dataset.id) {
    const infoDiv = document.getElementById("game-info");

    if (
      infoDiv.style.display === "block" &&
      infoDiv.dataset.gameId === gameCard.dataset.id
    ) {
      infoDiv.style.display = "none";
      infoDiv.dataset.gameId = "";
      return;
    }

    const homeId = parseInt(gameCard.dataset.home);
    const visitorId = parseInt(gameCard.dataset.visitor);
    const teams = await fetchTeams();

    const homeTeam = teams.find((t) => t.id === homeId);
    const visitorTeam = teams.find((t) => t.id === visitorId);

    infoDiv.style.display = "block";
    infoDiv.dataset.gameId = gameCard.dataset.id;
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
    window.scrollTo({ top: infoDiv.offsetTop - 20, behavior: "smooth" });
  }
});

fetchGames();
