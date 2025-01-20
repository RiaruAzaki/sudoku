class SudokuGame {
  constructor() {
    this.board = document.getElementsByClassName("sudoku-board")[0];
    this.cells = [];
    this.cellInputs = [];
    this.selectedCell = null;
    this.activeMark = 0;

    this.allowInput = true;

    this.initializeBoard();
    this.initializeOnscreenInput();

    document.addEventListener("keydown", (event) => this.handleKeyDown(event));
    this.board.addEventListener("mouseleave", this.clearHighlights);
  }

  initializeBoard() {
    for (let y = 0; y < 9; y++) {
      let row = document.createElement("div");
      row.className = "sudoku-row";

      for (let x = 0; x < 9; x++) {
        let cell = this.createCell(x, y);
        row.appendChild(cell);
      }

      this.board.appendChild(row);
    }

    this.selectedCell = this.cells[0];
  }

  createCell(x, y) {
    let cell = document.createElement("div");
    cell.className = `sudoku-cell cell-${x}${y}`;

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

    this.cells.push(cell);
    this.cellInputs.push(input);

    return cell;
  }

  initializeOnscreenInput() {
    let button_1 = document.querySelector(".button-1");
    let button_2 = document.querySelector(".button-2");
    let button_3 = document.querySelector(".button-3");
    let button_4 = document.querySelector(".button-4");
    let button_5 = document.querySelector(".button-5");
    let button_6 = document.querySelector(".button-6");
    let button_7 = document.querySelector(".button-7");
    let button_8 = document.querySelector(".button-8");
    let button_9 = document.querySelector(".button-9");
    let button_new = document.querySelector(".button-new");
    let button_validate = document.querySelector(".button-validate");
    let button_clear = document.querySelector(".button-clear");
    let button_back = document.querySelector(".button-back");

    button_1.addEventListener("click", () => this.addMark(1));
    button_2.addEventListener("click", () => this.addMark(2));
    button_3.addEventListener("click", () => this.addMark(3));
    button_4.addEventListener("click", () => this.addMark(4));
    button_5.addEventListener("click", () => this.addMark(5));
    button_6.addEventListener("click", () => this.addMark(6));
    button_7.addEventListener("click", () => this.addMark(7));
    button_8.addEventListener("click", () => this.addMark(8));
    button_9.addEventListener("click", () => this.addMark(9));
    button_new.addEventListener("click", () => this.generateGame());
    button_validate.addEventListener("click", () => this.validateBoard());
    button_clear.addEventListener("click", () => this.clearMarks());
    button_back.addEventListener("click", () => this.removeLastMark());
  }

  handleKeyDown(event) {
    let active = document.activeElement;
    if (
      !(
        active &&
        active.parentElement &&
        active.parentElement.className.includes("sudoku-cell")
      )
    )
      return;

    let x = parseInt(active.getAttribute("data-x"));
    let y = parseInt(active.getAttribute("data-y"));

    switch (event.key) {
      case "Backspace":
        this.removeLastMark();
        break;
      case "Delete":
        this.clearMarks();
        break;
      case "ArrowUp":
        this.moveFocus(x, y - 1);
        break;
      case "ArrowDown":
        this.moveFocus(x, y + 1);
        break;
      case "ArrowLeft":
        this.moveFocus(x - 1, y);
        break;
      case "ArrowRight":
        this.moveFocus(x + 1, y);
        break;
    }
  }

  moveFocus(x, y) {
    if (x >= 0 && x < 9 && y >= 0 && y < 9) {
      let input = document.querySelector(`.input-${x}${y}`);
      if (input) input.focus();
    }
  }

  addMark(value) {
    if (!this.allowInput) return;

    let mark = document.createElement("div");
    mark.className = `mark-${value}`;
    mark.classList.add("mark");
    mark.textContent = value;

    let existingMark = this.selectedCell.querySelector(`.mark-${value}`);

    if (existingMark) {
      existingMark.remove();
    } else {
      this.selectedCell.appendChild(mark);
    }
  }

  removeLastMark() {
    let marks = this.selectedCell.querySelectorAll("div");
    if (marks.length > 0) {
      marks[marks.length - 1].remove();
    }
  }

  clearMarks() {
    let marks = this.selectedCell.querySelectorAll(".mark");
    console.log(marks);
    for (let mark of marks) {
      console.log(mark);
      mark.remove();
    }
  }

  clearBoard() {
    this.cells.forEach((cell) => {
      let marks = cell.querySelectorAll(".mark");
      console.log(marks);
      for (let mark of marks) {
        console.log(mark);
        mark.remove();
      }
    });
  }

  handleInput(input) {
    if (input.value.match(/[1-9]/)) {
      this.addMark(input.value);
    }

    input.value = "";
    return;
  }

  handleCellFocus(input) {
    if (this.autoMark) {
      this.addMark(input.value);
    }

    let x = parseInt(input.getAttribute("data-x"));
    let y = parseInt(input.getAttribute("data-y"));

    this.selectedCell = this.cells[y * 9 + x];
    this.highlightRelatedCells(input);
  }

  handleCellHover(input) {
    this.highlightRelatedCells(input);
  }

  clearHighlights() {
    document.querySelectorAll(".highlight").forEach((cell) => {
      cell.classList.remove("highlight");
    });
  }

  highlightRelatedCells(input) {
    this.clearHighlights();

    let x = parseInt(input.getAttribute("data-x"));
    let y = parseInt(input.getAttribute("data-y"));

    // Row
    document.querySelectorAll(`[data-y="${y}"]`).forEach((cell) => {
      cell.parentElement.classList.add("highlight");
    });

    // Column
    document.querySelectorAll(`[data-x="${x}"]`).forEach((cell) => {
      cell.parentElement.classList.add("highlight");
    });

    // Box
    let boxStartX = Math.floor(x / 3) * 3;
    let boxStartY = Math.floor(y / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        let cell = document.querySelector(
          `.cell-${boxStartX + i}${boxStartY + j}`
        );
        if (cell) cell.classList.add("highlight");
      }
    }
  }



  validateBoard() {
    if (this.allowInput == false) {
      this.allowInput = true;
      document.querySelectorAll(".error").forEach((cell) => {
        cell.classList.remove("error");
      });

      return;
    }

    this.allowInput = false;

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

    console.log(board);

    // Validate rows
    for (let y = 0; y < 9; y++) {
      let numbers = new Set(board[y]);
      if (numbers.size !== 9) {
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

      console.log("Column");
      console.log(numbers);

      if (numbers.size !== 9) {
        console.log("error");
        document.querySelectorAll(`[data-x="${x}"]`).forEach((cell) => {
          cell.parentElement.classList.add("error");
        });
      }
    }

    // Validate boxes
    for (let boxY = 0; boxY < 9; boxY += 3) {
      for (let boxX = 0; boxX < 9; boxX += 3) {
        this.validateBox(boxX, boxY, board);
      }
    }

  }

  validateBox(boxX, boxY, board) {
    let box = new Set();
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        box.add(board[boxX + x][boxY + y]);
      }
    }

    if (numbers.size !== 9) {
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          document
            .querySelector(`[data-x="${x}"][data-y="${y}"]`)
            .parentElement.classList.add("error");
        }
      }
    }
  }

  generateGame() {
    this.clearBoard();
  }
}

let game = new SudokuGame();
game.generateGame();
