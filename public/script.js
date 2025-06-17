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

// Nouvelle écoute sur le bouton de recherche
document.getElementById("search-button").addEventListener("click", () => {
  const query = searchInput.value.trim();
  if (query !== "") {
    fetchPlayers(query);
  }
});

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
      // Filtrer les matchs à venir (non terminés)
      const upcomingGames = data.data.filter((g) => g.status !== "Final");

      // Trier les matchs par date et heure (si disponible)
      const sortedGames = upcomingGames.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      // Trouver le dernier match terminé (status Final)
      const finishedGames = data.data.filter((g) => g.status === "Final");
      const lastGame = finishedGames.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      )[0];

      // Limiter à 4 matchs
      const gamesToDisplay = sortedGames.slice(0, 4);

      if (gamesToDisplay.length === 0 && !lastGame) {
        scoresSection.innerHTML =
          "<p>Aucun match récent ou à venir n’a été trouvé sur cette période.</p>";
        return;
      }

      if (lastGame) {
        const div = document.createElement("div");
        div.classList.add("game-score");
        div.innerHTML = `
          <strong>${lastGame.home_team.full_name}</strong> vs <strong>${lastGame.visitor_team.full_name}</strong><br>
          Score final : ${lastGame.home_team_score} - ${lastGame.visitor_team_score}<br>
          ${lastGame.status}
        `;
        scoresSection.appendChild(div);
      }

      displayGames(gamesToDisplay);
    } else {
      scoresSection.innerHTML = "<p>Aucun match à venir cette semaine.</p>";
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des matchs :", error);
    if (scoresSection) {
      scoresSection.innerHTML = "<p>Erreur de récupération des scores.</p>";
    }
  }
}

function displayGames(games) {
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

// Lancer la récupération des scores une seule fois au chargement
fetchGames();
