let board = document.getElementById("sudoku-board");
let cells = [];
let cellInputs = [];
let selectedCell = null;
let time = 0;

let autoMark = false;
let activeMark = 1;
let allowInput = true;
let allowMultipleMarks = true;
let autoValidate = true;
let highlightRelated = true;
let skipDisabled = false;

function initBoard() {
  // Create cell grid
  for (let y = 0; y < 9; y++) {
    // Create row
    let row = document.createElement("div");
    row.className = "sudoku-row";

    for (let x = 0; x < 9; x++) {
      // Create cell
      let cell = document.createElement("div");
      cell.className = "sudoku-cell";

      // Cell input
      let input = document.createElement("input");
      input.type = "text";
      input.className = `input-${x}${y}`;
      input.maxLength = 1;
      input.setAttribute("data-x", x);
      input.setAttribute("data-y", y);
      input.addEventListener("input", () => handleInput(input));
      input.addEventListener("focus", () => handleFocus(input));
      input.addEventListener("mouseover", () => handleHover(input));
      cell.appendChild(input);

      // Track cell
      cells.push(cell);
      cellInputs.push(input);

      // Add cell to row
      row.appendChild(cell);
    }

    // Add row to board
    board.appendChild(row);
  }

  // Default selected cell to first cell
  selectedCell = cells[0];
}

function initOnscreenKeyborad() {
  // Mark buttons
  let button_1 = document.getElementById("onscreen-1");
  let button_2 = document.getElementById("onscreen-2");
  let button_3 = document.getElementById("onscreen-3");
  let button_4 = document.getElementById("onscreen-4");
  let button_5 = document.getElementById("onscreen-5");
  let button_6 = document.getElementById("onscreen-6");
  let button_7 = document.getElementById("onscreen-7");
  let button_8 = document.getElementById("onscreen-8");
  let button_9 = document.getElementById("onscreen-9");

  button_1.addEventListener("click", () => onscreenMark(1));
  button_2.addEventListener("click", () => onscreenMark(2));
  button_3.addEventListener("click", () => onscreenMark(3));
  button_4.addEventListener("click", () => onscreenMark(4));
  button_5.addEventListener("click", () => onscreenMark(5));
  button_6.addEventListener("click", () => onscreenMark(6));
  button_7.addEventListener("click", () => onscreenMark(7));
  button_8.addEventListener("click", () => onscreenMark(8));
  button_9.addEventListener("click", () => onscreenMark(9));

  // Control buttons
  let button_new = document.getElementById("onscreen-new");
  let button_validate = document.getElementById("onscreen-validate");
  let button_clear = document.getElementById("onscreen-clear");
  let button_back = document.getElementById("onscreen-back");
  let button_force_win = document.getElementById("onscreen-force-win");

  button_new.addEventListener("click", () => resetGame());
  button_validate.addEventListener("click", () => manualValidate());
  button_clear.addEventListener("click", () => clearMarks());
  button_back.addEventListener("click", () => removeLastMark());
  button_force_win.addEventListener("click", () => win());
}

// Initialize Settings
function initSettings() {
  let settingAllowMulitpleMarks = document.getElementById(
    "setting-allow-multiple-marks"
  );
  settingAllowMulitpleMarks.checked = allowMultipleMarks;
  settingAllowMulitpleMarks.addEventListener("change", () => {
    allowMultipleMarks = settingAllowMulitpleMarks.checked;

    if (!allowMultipleMarks) {
      // TODO: clear multiple marks if existing
    }
  });

  let settingAutoMark = document.getElementById("setting-auto-mark");
  settingAutoMark.checked = autoMark;
  settingAutoMark.addEventListener("change", () => {
    autoMark = settingAutoMark.checked;
  });

  console.log("autoMark");
  let settingAutoValidate = document.getElementById("setting-auto-validate");
  settingAutoValidate.checked = autoValidate;
  settingAutoValidate.addEventListener("change", () => {
    autoValidate = settingAutoValidate.checked;

    let errors = document.querySelectorAll(".error");
    for (let error of errors) {
      error.classList.remove("error");
    }

    // initialize validation
    if (autoValidate) {
      validateBoard();
    }
  });

  let settingHighlightRelatedCells = document.getElementById(
    "setting-highlight-related-cells"
  );
  settingHighlightRelatedCells.checked = highlightRelated;
  settingHighlightRelatedCells.addEventListener("change", () => {
    highlightRelated = settingHighlightRelatedCells.checked;
  });

  let settingSkipDisabledCells = document.getElementById(
    "setting-skip-disabled-cells"
  );
  settingSkipDisabledCells.checked = skipDisabled;
  settingSkipDisabledCells.addEventListener("change", () => {
    skipDisabled = settingSkipDisabledCells.checked;
  });
}

// Map keyboard inputs to cell actions
document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "Backspace":
      removeLastMark();
      break;
    case "Delete":
      clearMarks();
      break;
    case "ArrowUp":
      moveFocus(0, -1);
      break;
    case "ArrowDown":
      moveFocus(0, +1);
      break;
    case "ArrowLeft":
      moveFocus(-1, 0);
      break;
    case "ArrowRight":
      moveFocus(+1, 0);
      break;
  }
});

// Changes the selected cell to the given coordinates if they are valid
function moveFocus(x_offset, y_offset) {
  let active = document.activeElement;

  // Keyboard actions only apply when cell is active
  if (
    !active ||
    !active.parentElement ||
    !active.parentElement.className.includes("sudoku-cell")
  )
    return;

  let input;
  let x = parseInt(active.getAttribute("data-x"));
  let y = parseInt(active.getAttribute("data-y"));

  if (skipDisabled) {
    while (true) {
      x += x_offset;
      y += y_offset;
      input = document.querySelector(`.input-${x}${y}`);
      if (input === null || input.readOnly === false) {
        break;
      }
    }
    if (input) input.focus();
  } else {
    x += x_offset;
    y += y_offset;
    input = document.querySelector(`.input-${x}${y}`);
    if (input) input.focus();
  }
}

// Determines if mark should be added immediately or the active mark should be updated
function onscreenMark(number) {
  if (autoMark) {
    activeMark = parseInt(number);
  } else {
    addMark(parseInt(number));
  }
}

// Adds toggles a mark on or off depending on the current state
function addMark(value) {
  if (!allowInput) return;

  // Create mark
  let mark = document.createElement("div");
  mark.className = `mark-${value}`;
  mark.classList.add("mark");
  mark.textContent = value;

  let existingMark = selectedCell.querySelector(`.mark-${value}`);

  if (!allowMultipleMarks) {
    clearMarks();
  }

  // Toggle the mark if it already exists
  if (existingMark) {
    // Remove existing mark
    existingMark.remove();
  } else {
    // Append new mark
    selectedCell.appendChild(mark);
  }

  // Validate updated board
  if (autoValidate) {
    validateBoard();
  }
}

// Removes the last created mark
function removeLastMark() {
  if (selectedCell.querySelector("input").readOnly === true) return;

  let marks = selectedCell.querySelectorAll("div");
  if (marks.length > 0) {
    marks[marks.length - 1].remove();
  }
  if (autoValidate) {
    validateBoard();
  }
}

// Removes all marks from the selected cell
function clearMarks() {
  if (selectedCell.querySelector("input").readOnly === true) return;

  let marks = selectedCell.querySelectorAll(".mark");
  for (let mark of marks) {
    mark.remove();
  }
  if (autoValidate) {
    validateBoard();
  }
}

// Adds the mark the user entered into the cell input field if it is valid and clears the field
function handleInput(input) {
  if (input.value.match(/[1-9]/)) {
    addMark(input.value);
  }

  input.value = "";
  return;
}

// Updates the selected cell and adds auto mark if specified
function handleFocus(input) {
  // Update selected cell location
  let x = parseInt(input.getAttribute("data-x"));
  let y = parseInt(input.getAttribute("data-y"));
  selectedCell = cells[y * 9 + x];
  highlightRelatedCells(input);

  // Automatically add the mark if enabled
  if (autoMark) {
    addMark(activeMark);
    document.activeElement.blur(); // Remove focus from input
  }
}

// Automatically highlights related cells if enabled
function handleHover(input) {
  if (highlightRelated) {
    highlightRelatedCells(input);
  }
}

function highlightRelatedCells(input) {
  clearHighlights();

  let x = parseInt(input.getAttribute("data-x"));
  let y = parseInt(input.getAttribute("data-y"));

  // Highlight row
  document.querySelectorAll(`[data-y="${y}"]`).forEach((cell) => {
    cell.parentElement.classList.add("highlight");
  });

  // Highlight column
  document.querySelectorAll(`[data-x="${x}"]`).forEach((cell) => {
    cell.parentElement.classList.add("highlight");
  });

  // Highlight box
  let startX = Math.floor(x / 3) * 3;
  let startY = Math.floor(y / 3) * 3;
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      let cell = cells[9 * (startY + y) + startX + x];
      if (cell) cell.classList.add("highlight");
    }
  }
}

// Unhighlight all highlighted cells
function clearHighlights() {
  document.querySelectorAll(".highlight").forEach((cell) => {
    cell.classList.remove("highlight");
  });
}

board.addEventListener("mouseleave", clearHighlights);

function validateBoard() {
  // Clear old error marks
  document
    .querySelectorAll(".error")
    .forEach((cell) => cell.classList.remove("error"));

  let board = [];
  for (let y = 0; y < 9; y++) {
    let row = [];
    for (let x = 0; x < 9; x++) {
      let marks = cells[y * 9 + x].querySelectorAll("div");
      row.push(marks.length !== 1 ? -1 : parseInt(marks[0].textContent));
    }
    board.push(row);
  }

  // Validate rows
  for (let y = 0; y < 9; y++) {
    let seen = new Map();
    for (let x = 0; x < 9; x++) {
      let num = board[y][x];
      if (num !== -1) {
        if (seen.has(num)) {
          seen.get(num).forEach((cell) => cell.classList.add("error"));
          document
            .querySelector(`[data-x="${x}"][data-y="${y}"]`)
            .parentElement.classList.add("error");
        } else {
          seen.set(num, [
            document.querySelector(`[data-x="${x}"][data-y="${y}"]`)
              .parentElement,
          ]);
        }
      }
    }
  }

  // Validate columns
  for (let x = 0; x < 9; x++) {
    let seen = new Map();
    for (let y = 0; y < 9; y++) {
      let num = board[y][x];
      if (num !== -1) {
        if (seen.has(num)) {
          seen.get(num).forEach((cell) => cell.classList.add("error"));
          document
            .querySelector(`[data-x="${x}"][data-y="${y}"]`)
            .parentElement.classList.add("error");
        } else {
          seen.set(num, [
            document.querySelector(`[data-x="${x}"][data-y="${y}"]`)
              .parentElement,
          ]);
        }
      }
    }
  }

  // Validate 3x3 boxes
  for (let boxY = 0; boxY < 9; boxY += 3) {
    for (let boxX = 0; boxX < 9; boxX += 3) {
      validateBox(boxX, boxY, board);
    }
  }
}

function validateBox(boxX, boxY, board) {
  let seen = new Map();
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      let cellX = boxX + x;
      let cellY = boxY + y;
      let num = board[cellY][cellX];
      if (num !== -1) {
        if (seen.has(num)) {
          seen.get(num).forEach((cell) => cell.classList.add("error"));
          document
            .querySelector(`[data-x="${cellX}"][data-y="${cellY}"]`)
            .parentElement.classList.add("error");
        } else {
          seen.set(num, [
            document.querySelector(`[data-x="${cellX}"][data-y="${cellY}"]`)
              .parentElement,
          ]);
        }
      }
    }
  }
}

function manualValidate() {
  if (allowInput == false) {
    document.querySelector("#onscreen-validate").innerHTML = "validate";

    allowInput = true;

    document.querySelectorAll(".error").forEach((cell) => {
      cell.classList.remove("error");
    });

    return;
  }

  allowInput = false;
  let valid = validateBoard();

  if (!valid) {
    board.classList.add("error");
  } else {
    win();
  }

  document.querySelector("#onscreen-validate").innerHTML = "continue";
}

// Reset the game to its initial state
function resetGame() {
  let game = [
    [0, 1, 0, 0, 0, 0, 0, 9, 0],
    [0, 0, 4, 0, 0, 0, 2, 0, 0],
    [0, 0, 8, 0, 0, 5, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 3, 0],
    [2, 0, 0, 0, 4, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 8, 0, 0, 6, 0, 0],
    [0, 3, 0, 0, 0, 0, 0, 8, 0],
    [0, 0, 6, 0, 0, 0, 0, 0, 0],
  ];
  clearBoard();

  let winCells = document.querySelectorAll(".win");
  for (let cell of winCells) {
    cell.classList.remove("win");
  }

  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      if (game[y][x] !== 0) {
        setCell(x, y, game[y][x]);
      }
    }
  }
  time = 0;

  selectedCell = cells[0];
}

function setCell(x, y, value) {
  selectedCell = cells[y * 9 + x];
  addMark(value);
  cellInputs[y * 9 + x].readOnly = true;
}

// Removes all marks from the board
function clearBoard() {
  for (let cell of cells) {
    let marks = cell.querySelectorAll(".mark");
    for (let mark of marks) {
      mark.remove();
    }
  }

  if (allowInput == false) {
    manualValidate();
  }
}

function win() {
  allowInput = false;

  for (let cell of cells) {
    cell.classList.add("win");
  }

  let highScores = [];
  if (localStorage.getItem("highScores")) {
    highScores = JSON.parse(localStorage.getItem("highScores"));
  }

  highScores.push({
    date: new Date().toLocaleDateString(),
    duration: time,
  });

  localStorage.setItem("highScores", JSON.stringify(highScores));
}

// Start game timer
setInterval(function () {
  if (allowInput) {
    time += 1;
  }

  let seconds = String(time % 60).padStart(2, "0");
  let minutes = String(Math.floor(time / 60) % 60).padStart(2, "0");
  let hours = String(Math.floor(time / 3600)).padStart(2, "0");
  document.getElementById(
    "sudoku-timer"
  ).textContent = `${hours}:${minutes}:${seconds}`;
}, 1000);

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

initBoard();
initOnscreenKeyborad();
initSettings();
resetGame();
