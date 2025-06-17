const apiUrl = "/api/players";
const scoresApiUrl = "/api/games";
const playerList = document.getElementById("player-list");
const searchInput = document.getElementById("search-input");
const scoresSection = document.getElementById("scores");

let lastRequestTime = 0;
const REQUEST_INTERVAL = 12000; // 12 secondes entre chaque requête pour les joueurs
let gameFetchIntervalId = null; // ID de l'intervalle d'appel pour les matchs

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

searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();
  fetchPlayers(query);
});

fetchPlayers();

// --- Partie affichage des scores ---
async function fetchGames() {
  const today = new Date().toISOString().split("T")[0];
  try {
    const response = await fetch(
      `${scoresApiUrl}?start_date=${today}&end_date=${today}`
    );
    const data = await response.json();
    console.log("Matchs du jour :", data);

    if (data.data && data.data.length > 0) {
      displayGames(data.data);

      // Arrêter les appels automatiques une fois qu'on a des matchs
      if (gameFetchIntervalId !== null) {
        clearInterval(gameFetchIntervalId);
        gameFetchIntervalId = null;
        console.log("Matchs récupérés. Arrêt des requêtes périodiques.");
      }
      return;
    }

    scoresSection.innerHTML = "<p>Aucun match prévu aujourd'hui.</p>";
  } catch (error) {
    console.error("Erreur lors de la récupération des matchs :", error);
    if (scoresSection) {
      scoresSection.innerHTML = "<p>Erreur de récupération des scores.</p>";
    }
  }
}

function displayGames(games) {
  scoresSection.innerHTML = "";
  if (games.length === 0) {
    scoresSection.innerHTML = "<p>Aucun match aujourd'hui.</p>";
    return;
  }

  games.forEach((game) => {
    const div = document.createElement("div");
    div.classList.add("game-score");
    div.innerHTML = `
      <strong>${game.home_team.full_name}</strong> vs <strong>${game.visitor_team.full_name}</strong><br>
      Score : ${game.home_team_score} - ${game.visitor_team_score}<br>
      ${game.status}
    `;
    scoresSection.appendChild(div);
  });
}

// Lancer la récupération des scores toutes les 20 secondes jusqu'à obtention
fetchGames();
gameFetchIntervalId = setInterval(fetchGames, 20000);
