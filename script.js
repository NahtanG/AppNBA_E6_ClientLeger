const apiUrl = "/api/players";
const playerList = document.getElementById("player-list");
const searchInput = document.getElementById("search-input");

async function fetchPlayers(query = "") {
  try {
    const response = await fetch(
      `${apiUrl}?search=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    displayPlayers(data.data);
  } catch (error) {
    console.error("Erreur lors de la récupération des joueurs :", error);
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

fetchPlayers(); // facultatif pour affichage initial
