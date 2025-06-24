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
        loadComments(lastGame.id); // <-- Ajouté
      } else {
        lastGameDiv.innerHTML = "<p>Aucun match terminé récemment.</p>";
      }

      if (upcomingGames.length > 0) {
        upcomingGamesDiv.innerHTML = upcomingGames.map(createGameCard).join("");
        // Appelle loadComments pour chaque match à venir
        upcomingGames.forEach((game) => loadComments(game.id));
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

// Génère un userId unique si absent
function getUserId() {
  let id = localStorage.getItem("nba_user_id");
  if (!id) {
    id = "user_" + Math.random().toString(36).slice(2, 12);
    localStorage.setItem("nba_user_id", id);
  }
  return id;
}

// Affiche le formulaire d'avis sous la carte de match sélectionnée
function showCommentForm(gameId) {
  const container = document.getElementById(`comments-${gameId}`);
  if (!container) return;
  container.innerHTML = `
    <form id="comment-form-${gameId}">
      <label>Note (0-5) : <input type="number" min="0" max="5" required name="note" /></label>
      <br>
      <label>Commentaire (optionnel) :<br>
        <textarea name="text" rows="2" cols="30"></textarea>
      </label>
      <br>
      <button type="submit">Envoyer</button>
    </form>
    <div id="comment-message-${gameId}" class="comment-message"></div>
  `;
  document.getElementById(`comment-form-${gameId}`).onsubmit = async (e) => {
    e.preventDefault();
    const note = Number(e.target.note.value);
    const text = e.target.text.value;
    const userId = getUserId();
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId, userId, note, text }),
    });
    const msgDiv = document.getElementById(`comment-message-${gameId}`);
    if (res.ok) {
      msgDiv.textContent = "Avis enregistré !";
      loadComments(gameId);
    } else {
      const err = await res.json().catch(() => ({}));
      msgDiv.textContent =
        "Erreur lors de l'envoi : " + (err.error || res.statusText);
      msgDiv.classList.toggle("error", !res.ok);
    }
  };
}

// Charge et affiche les avis pour un match
async function loadComments(gameId, filter = "") {
  const res = await fetch(
    `/api/comments?gameId=${gameId}${filter ? "&filter=" + filter : ""}`
  );
  const comments = await res.json();
  const container = document.getElementById(`comments-list-${gameId}`);
  if (!container) return;
  if (comments.length === 0) {
    container.innerHTML = "<em>Aucun avis pour ce match.</em>";
    return;
  }
  // Moyenne
  const avg = (
    comments.reduce((s, c) => s + c.note, 0) / comments.length
  ).toFixed(2);
  container.innerHTML = `
    <div>Note moyenne : <strong>${avg} / 5</strong></div>
    <div>
      <button onclick="loadComments('${gameId}', '')">Tous</button>
      <button onclick="loadComments('${gameId}', '24h')">24h</button>
      <button onclick="loadComments('${gameId}', '7d')">7j</button>
    </div>
    <ul>
      ${comments.map((c) => `<li><b>Note :</b> ${c.note} ${c.text ? "— " + c.text : ""} <small>(${new Date(c.date).toLocaleString("fr-FR")})</small></li>`).join("")}
    </ul>
  `;
}

// Ajoute l'affichage des avis et du bouton sur chaque carte de match
function createGameCard(game, isLastGame = false) {
  const dateFormatted = formatDateToFrench(game.datetime || game.date);

  let cardClass = "game-score";
  let statusText = "";
  let matchState = "";
  let scoreHtml = "";

  // Détection du statut
  const status = (game.status || "").toLowerCase();
  const isFinal = status === "final";
  const isScheduled =
    status === "scheduled" ||
    status === "not started" ||
    status === "à venir" ||
    !status ||
    status.match(/^\d{4}-\d{2}-\d{2}/);

  // Un match est "en cours" si status contient quarter, qtr, halftime, OT, ou time non null et pas "Final"
  const isLive =
    !isFinal &&
    !isScheduled &&
    (status.includes("qtr") ||
      status.includes("quarter") ||
      status.includes("half") ||
      status.includes("ot") ||
      (game.time && game.time !== "Final" && game.time !== null));

  if (isFinal) {
    cardClass += " final";
    statusText = "Terminé";
  } else if (isLive) {
    cardClass += " live";
    statusText = "En cours";
    matchState = `<div class="period">${game.status}${game.time && game.time !== "Final" ? " - " + game.time : ""}</div>`;
  } else {
    statusText = "À venir";
  }

  // Affiche le score si le match est terminé ou en cours (score non nul), avec abréviation
  if (isFinal || isLive) {
    scoreHtml = `
      <div class="score">
        <span>${game.home_team.abbreviation} : <strong>${game.home_team_score}</strong></span>
        <span>${game.visitor_team.abbreviation} : <strong>${game.visitor_team_score}</strong></span>
      </div>
    `;
  }

  const gameId = game.id;
  return `
    <div class="${cardClass}" data-id="${game.id}" data-home="${game.home_team.id}" data-visitor="${game.visitor_team.id}">
      <strong>${game.home_team.full_name} vs ${game.visitor_team.full_name}</strong>
      <div class="date">${dateFormatted}</div>
      ${scoreHtml}
      <div class="status">${statusText}</div>
      ${matchState}
      ${game.postseason ? '<span class="playoff-tag">🏆 Match de playoffs</span>' : ""}
    </div>
    <div class="comments-section">
      <h3>Avis & notes des utilisateurs</h3>
      <button onclick="showCommentForm('${gameId}')">Donner mon avis</button>
      <div id="comments-${gameId}"></div>
      <div id="comments-list-${gameId}" class="comments-list"></div>
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

function formatDateToFrench(dateStr) {
  const date = new Date(dateStr);
  // Décale en heure française
  const options = {
    timeZone: "Europe/Paris",
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  };
  return date.toLocaleString("fr-FR", options);
}

fetchGames();
