let highScores = [];
if (localStorage.getItem("highScores")) {
  highScores = JSON.parse(localStorage.getItem("highScores"));
}

let highScoresTable = document.querySelector(".highscore-board > tbody");

for (let score of highScores) {
  let row = document.createElement("tr");

  let seconds = String(score.duration % 60).padStart(2, "0");
  let minutes = Math.floor(score.duration / 60) % 60;

  row.innerHTML = `
    <td>${score.date.replaceAll("-", "/")}</td>
    <td>${minutes}:${seconds}</td>
  `;
  highScoresTable.appendChild(row);
}

// Handle navbar burger
document.addEventListener("DOMContentLoaded", () => {
  const $navbarBurgers = Array.prototype.slice.call(
    document.querySelectorAll(".navbar-burger"),
    0
  );

  $navbarBurgers.forEach((el) => {
    el.addEventListener("click", () => {
      const target = el.dataset.target;
      const $target = document.getElementById(target);

      el.classList.toggle("is-active");
      $target.classList.toggle("is-active");
    });
  });
});
