class SudokuGame {
  constructor() {
    this.board = document.getElementsByClassName("sudoku-board")[0];

    this.cells = [];
    this.cellInputs = [];
    this.selectedCell = null;

    this.autoMark = false;
    this.activeMark = 1;

    this.allowInput = true;
    this.allowMultipleMarks = true;
    this.autoValidate = true;
    this.highlightRelated = true;

    this.time = 0;

    this.initializeBoard();
    this.initializeOnscreenInput();
    document.addEventListener("keydown", (event) => this.handleKeyDown(event));
    this.board.addEventListener("mouseleave", this.clearHighlights);

    this.startTimer();
  }

  initializeBoard() {
    // Generated grid of cells
    for (let y = 0; y < 9; y++) {
      let row = document.createElement("div");
      row.className = "sudoku-row";

      for (let x = 0; x < 9; x++) {
        let cell = this.createCell(x, y);
        row.appendChild(cell);
      }

      this.board.appendChild(row);
    }

    // Default selected cell to first cell
    this.selectedCell = this.cells[0];
  }

  createCell(x, y) {
    // Cell
    let cell = document.createElement("div");
    cell.className = `sudoku-cell cell-${x}${y}`;

    // Cell input
    let input = document.createElement("input");
    input.type = "text";
    input.className = `input-${x}${y}`;
    input.maxLength = 1;
    input.setAttribute("data-x", x);
    input.setAttribute("data-y", y);
    input.addEventListener("input", () => this.handleInput(input));
    input.addEventListener("focus", () => this.handleCellFocus(input));
    input.addEventListener("mouseover", () => this.handleCellHover(input));

    cell.appendChild(input);

    // Track cell
    this.cells.push(cell);
    this.cellInputs.push(input);

    return cell;
  }

  // Adds event listeners to onscreen input buttons
  initializeOnscreenInput() {
    // Mark buttons
    let button_1 = document.querySelector(".button-1");
    let button_2 = document.querySelector(".button-2");
    let button_3 = document.querySelector(".button-3");
    let button_4 = document.querySelector(".button-4");
    let button_5 = document.querySelector(".button-5");
    let button_6 = document.querySelector(".button-6");
    let button_7 = document.querySelector(".button-7");
    let button_8 = document.querySelector(".button-8");
    let button_9 = document.querySelector(".button-9");

    button_1.addEventListener("click", () => this.handleOnscreenInput(1));
    button_2.addEventListener("click", () => this.handleOnscreenInput(2));
    button_3.addEventListener("click", () => this.handleOnscreenInput(3));
    button_4.addEventListener("click", () => this.handleOnscreenInput(4));
    button_5.addEventListener("click", () => this.handleOnscreenInput(5));
    button_6.addEventListener("click", () => this.handleOnscreenInput(6));
    button_7.addEventListener("click", () => this.handleOnscreenInput(7));
    button_8.addEventListener("click", () => this.handleOnscreenInput(8));
    button_9.addEventListener("click", () => this.handleOnscreenInput(9));

    // Control buttons
    let button_new = document.querySelector(".button-new");
    let button_validate = document.querySelector(".button-validate");
    let button_clear = document.querySelector(".button-clear");
    let button_back = document.querySelector(".button-back");

    button_new.addEventListener("click", () => this.resetGame());
    button_validate.addEventListener("click", () =>
      this.manualValidateToggle()
    );
    button_clear.addEventListener("click", () => this.clearMarks());
    button_back.addEventListener("click", () => this.removeLastMark());

    // Settings
    let settingAllowMulitpleMarks = document.querySelector(
      ".setting-allow-multiple-marks"
    );
    let settingAutoMark = document.querySelector(".setting-auto-mark");
    let settingAutoValidate = document.querySelector(".setting-auto-validate");
    let settingHighlightRelatedCells = document.querySelector(
      ".setting-highlight-related-cells"
    );
    settingAllowMulitpleMarks.addEventListener("change", () => {
      this.allowMultipleMarks = settingAllowMulitpleMarks.checked;
    });
    settingAutoMark.addEventListener("change", () => {
      this.autoMark = settingAutoMark.checked;
    });
    settingAutoValidate.addEventListener("change", () => {
      this.autoValidate = settingAutoValidate.checked;
      if (!this.autoValidate) {
        let errors = document.querySelectorAll(".error");
        for (let error of errors) {
          error.classList.remove("error");
        }
      } else {
        this.validateBoard();
      }
    });
    settingHighlightRelatedCells.addEventListener("change", () => {
      this.highlightRelated = settingHighlightRelatedCells.checked;
    });
  }

  // Starts and updates the game timer
  startTimer() {
    setInterval(
      function () {
        if (this.allowInput) {
          this.time += 1;
          let seconds = String(this.time % 60).padStart(2, "0");
          let minutes = String(Math.floor(this.time / 60) % 60);
          minutes = minutes.padStart(2, "0");
          let hours = String(Math.floor(this.time / 3600)).padStart(2, "0");

          document.getElementById(
            "timer"
          ).textContent = `${hours}:${minutes}:${seconds}`;
        }
      }.bind(this),
      1000
    );
  }

  // Maps keyboard inputs to cell actions
  handleKeyDown(event) {
    // Map input to cell action

    switch (event.key) {
      case "Backspace":
        this.removeLastMark();
        break;
      case "Delete":
        this.clearMarks();
        break;
      case "ArrowUp":
        this.moveFocus(0, -1);
        break;
      case "ArrowDown":
        this.moveFocus(0, +1);
        break;
      case "ArrowLeft":
        this.moveFocus(-1, 0);
        break;
      case "ArrowRight":
        this.moveFocus(+1, 0);
        break;
    }
  }

  // Changes the selected cell to the given coordinates if they are valid
  moveFocus(x_offset, y_offset) {
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
    while (true) {
      x += x_offset;
      y += y_offset;
      input = document.querySelector(`.input-${x}${y}`);
      if (input === null || input.disabled === false) {
        break;
      }
    }
    if (input) input.focus();
  }

  // Determines wether mark should be added immediately or the active mark should be updated
  handleOnscreenInput(number) {
    if (this.autoMark) {
      this.activeMark = parseInt(number);
    } else {
      this.addMark(parseInt(number));
    }
  }

  // Adds toggles a mark on or off depending on the current state
  addMark(value) {
    if (!this.allowInput) return;

    // Create mark
    let mark = document.createElement("div");
    mark.className = `mark-${value}`;
    mark.classList.add("mark");
    mark.textContent = value;

    let existingMark = this.selectedCell.querySelector(`.mark-${value}`);

    if (!this.allowMultipleMarks) {
      this.clearMarks();
    }

    // Toggle the mark if it already exists
    if (existingMark) {
      // Remove existing mark
      existingMark.remove();
    } else {
      // Append new mark
      this.selectedCell.appendChild(mark);
    }

    // Validate updated board
    if (this.autoValidate) {
      this.validateBoard();
    }
  }

  // Removes the mark which was last created
  removeLastMark() {
    let marks = this.selectedCell.querySelectorAll("div");
    if (marks.length > 0) {
      marks[marks.length - 1].remove();
    }
    if (this.autoValidate) {
      this.validateBoard();
    }
  }

  // Removes all marks from the selected cell
  clearMarks() {
    let marks = this.selectedCell.querySelectorAll(".mark");
    for (let mark of marks) {
      mark.remove();
    }
    if (this.autoValidate) {
      this.validateBoard();
    }
  }

  // Adds the mark the user entered into the cell input field if it is valid and clears the field
  handleInput(input) {
    if (input.value.match(/[1-9]/)) {
      this.addMark(input.value);
    }

    input.value = "";
    return;
  }

  // Updates the selected cell and adds auto mark if specified
  handleCellFocus(input) {
    // Update selected cell location
    let x = parseInt(input.getAttribute("data-x"));
    let y = parseInt(input.getAttribute("data-y"));
    this.selectedCell = this.cells[y * 9 + x];

    // Automatically add the mark if enabled
    if (this.autoMark) {
      this.addMark(this.activeMark);
      document.activeElement.blur(); // Remove focus from input
    }
  }

  // Automatically highlights related cells if enabled
  handleCellHover(input) {
    if (this.highlightRelated) {
      this.highlightRelatedCells(input);
    }
  }

  highlightRelatedCells(input) {
    this.clearHighlights();

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
        let cell = this.cells[9 * (startY + y) + startX + x];
        if (cell) cell.classList.add("highlight");
      }
    }
  }

  // Unhighlight all highlighted cells
  clearHighlights() {
    document.querySelectorAll(".highlight").forEach((cell) => {
      cell.classList.remove("highlight");
    });
  }

  // Alternative validation type currently not used
  // Highlights all cells contained within invalid zones
  lazyValidateBoard() {
    // Clear old error marks
    let errors = document.querySelectorAll(".error");
    for (let error of errors) {
      error.classList.remove("error");
    }

    // build board representation
    let board = [];
    for (let y = 0; y < 9; y++) {
      let row = [];
      for (let x = 0; x < 9; x++) {
        let marks = this.cells[y * 9 + x].querySelectorAll("div");

        if (marks.length !== 1) {
          row.push(-1);
        } else {
          row.push(parseInt(marks[0].textContent));
        }
      }
      board.push(row);
    }

    let valid = true;

    // Validate rows
    for (let y = 0; y < 9; y++) {
      let numbers = new Set(board[y]);

      if (numbers.size !== 9 && !numbers.has(-1)) {
        valid = false;
        document.querySelectorAll(`[data-y="${y}"]`).forEach((cell) => {
          cell.parentElement.classList.add("error");
        });
      }
    }

    // Validate columns
    for (let x = 0; x < 9; x++) {
      let numbers = new Set();
      for (let y = 0; y < 9; y++) {
        numbers.add(board[y][x]);
      }

      if (numbers.size !== 9 && !numbers.has(-1)) {
        document.querySelectorAll(`[data-x="${x}"]`).forEach((cell) => {
          cell.parentElement.classList.add("error");
        });
      }
    }

    // Validate boxes
    for (let boxY = 0; boxY < 9; boxY += 3) {
      for (let boxX = 0; boxX < 9; boxX += 3) {
        valid = this.validateBox(boxX, boxY, board) && valid;
      }
    }
  }

  lazyValidateBox(boxX, boxY, board) {
    let numbers = new Set();
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        numbers.add(board[boxY + y][boxX + x]);
      }
    }

    let valid = true;

    if (numbers.size !== 9 && !numbers.has(-1)) {
      valid = false;
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          document
            .querySelector(`[data-x="${boxX + x}"][data-y="${boxY + y}"]`)
            .parentElement.classList.add("error");
        }
      }
    }

    return valid;
  }

  validateBoard() {
    // Clear old error marks
    document
      .querySelectorAll(".error")
      .forEach((cell) => cell.classList.remove("error"));

    let board = [];
    for (let y = 0; y < 9; y++) {
      let row = [];
      for (let x = 0; x < 9; x++) {
        let marks = this.cells[y * 9 + x].querySelectorAll("div");
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
        this.validateBox(boxX, boxY, board);
      }
    }
  }

  validateBox(boxX, boxY, board) {
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

  manualValidateToggle() {
    if (this.allowInput == false) {
      document.querySelector(".button-validate").innerHTML = "validate";

      this.allowInput = true;

      document.querySelectorAll(".error").forEach((cell) => {
        cell.classList.remove("error");
      });

      document.querySelectorAll(".invalid").forEach((cell) => {
        cell.classList.remove("invalid");
      });

      return;
    }

    this.allowInput = false;
    let valid = this.validateBoard();

    if (!valid) {
      document.querySelector(".sudoku-board").classList.add("invalid");
    } else {
      this.win();
    }

    document.querySelector(".button-validate").innerHTML = "continue";
  }

  // Removes all marks from the board
  clearBoard() {
    for (let cell of this.cells) {
      let marks = cell.querySelectorAll(".mark");
      for (let mark of marks) {
        mark.remove();
      }
    }

    if (this.allowInput == false) {
      this.manualValidateToggle();
    }
  }

  // Reset the game to its initial state
  resetGame() {
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
    this.clearBoard();

    for (let y = 0; y < 9; y++) {
      for (let x = 0; x < 9; x++) {
        if (game[y][x] !== 0) {
          this.setCell(x, y, game[y][x]);
        }
      }
    }
    this.time = 0;
  }

  setCell(x, y, value) {
    this.selectedCell = this.cells[y * 9 + x];
    this.addMark(value);
    this.cellInputs[y * 9 + x].disabled = true;
  }

  win() {
    for (let cell of this.cells) {
      cell.classList.add("win");
    }
  }
}

let game = new SudokuGame();
game.resetGame();
