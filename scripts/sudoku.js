class SudokuGame {
  constructor() {
    this.cellContents = [];
    this.cellInputs = [];
    this.selectedCell = null;
    this.allowInput = true;

    this.initializeBoard();
    document.addEventListener("keydown", (event) => this.handleKeyDown(event));
    this.initializeOnscreenInput();
  }

  initializeBoard() {
    const sudokuBoard = document.querySelector(".sudoku-board");

    for (let y = 0; y < 9; y++) {
      const row = document.createElement("tr");
      row.className = "sudoku-row";

      for (let x = 0; x < 9; x++) {
        const cell = this.createCell(x, y);
        row.appendChild(cell);
      }

      sudokuBoard.appendChild(row);
    }

    this.selectedCell = this.cellContents[0];
  }

  createCell(x, y) {
    const cell = document.createElement("td");
    cell.className = `sudoku-cell cell-${x}${y}`;

    const content = document.createElement("div");
    content.className = "sudoku-cell-content";

    const input = document.createElement("input");
    input.type = "text";
    input.className = `input-${x}${y}`;
    input.maxLength = 1;
    input.setAttribute("data-x", x);
    input.setAttribute("data-y", y);
    input.addEventListener("input", () => this.handleInput(y * 9 + x));
    input.addEventListener("focus", () => this.handleCellFocus(input));

    cell.appendChild(input);
    cell.appendChild(content);

    this.cellInputs.push(input);
    this.cellContents.push(content);

    return cell;
  }

  addMark(value) {
    if (!this.allowInput) return;

    const mark = document.createElement("div");
    mark.className = `mark-${value}`;
    mark.textContent = value;

    const existingMark = this.selectedCell.querySelector(`.${mark.className}`);

    if (existingMark) {
      existingMark.remove();
    } else {
      this.selectedCell.appendChild(mark);
    }
  }

  clearLastMark(x, y) {
    const marks = this.selectedCell.querySelectorAll("div");
    if (marks.length > 0) {
      marks[marks.length - 1].remove();
    }
  }

  clearCell() {
    this.selectedCell.innerHTML = "";
  }

  moveFocus(x, y) {
    if (x >= 0 && x < 9 && y >= 0 && y < 9) {
      const input = document.querySelector(`.input-${x}${y}`);
      if (input) input.focus();
    }
  }

  // Input handling
  handleKeyDown(event) {
    const active = document.activeElement;
    if (
      !(
        active &&
        active.parentElement &&
        active.parentElement.className.includes("sudoku-cell")
      )
    )
      return;

    const x = parseInt(active.getAttribute("data-x"));
    const y = parseInt(active.getAttribute("data-y"));

    switch (event.key) {
      case "Backspace":
        this.clearLastMark(x, y);
        break;
      case "Delete":
        this.clearCell(x, y);
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

  handleInput(index) {
    const input = this.cellInputs[index];

    if (input.value.match(/[1-9]/)) {
      this.addMark(input.value);
    }

    input.value = "";
    return;
  }

  initializeOnscreenInput() {
    const button_1 = document.querySelector(".button-1");
    const button_2 = document.querySelector(".button-2");
    const button_3 = document.querySelector(".button-3");
    const button_4 = document.querySelector(".button-4");
    const button_5 = document.querySelector(".button-5");
    const button_6 = document.querySelector(".button-6");
    const button_7 = document.querySelector(".button-7");
    const button_8 = document.querySelector(".button-8");
    const button_9 = document.querySelector(".button-9");
    const button_new = document.querySelector(".button-new");
    const button_validate = document.querySelector(".button-validate");
    const button_clear = document.querySelector(".button-clear");
    const button_back = document.querySelector(".button-back");

    button_1.addEventListener("click", () => this.addMark(1));
    button_2.addEventListener("click", () => this.addMark(2));
    button_3.addEventListener("click", () => this.addMark(3));
    button_4.addEventListener("click", () => this.addMark(4));
    button_5.addEventListener("click", () => this.addMark(5));
    button_6.addEventListener("click", () => this.addMark(6));
    button_7.addEventListener("click", () => this.addMark(7));
    button_8.addEventListener("click", () => this.addMark(8));
    button_9.addEventListener("click", () => this.addMark(9));
    button_new.addEventListener("click", () => this.clearBoard());
    button_validate.addEventListener("click", () => this.validateBoard());
    button_clear.addEventListener("click", () => this.clearCell());
    button_back.addEventListener("click", () => this.clearLastMark());
  }

  handleCellFocus(input) {
    const x = parseInt(input.getAttribute("data-x"));
    const y = parseInt(input.getAttribute("data-y"));

    this.selectedCell = this.cellContents[y * 9 + x];
    this.highlightRelatedCells(input);
  }

  highlightRelatedCells(input) {
    document.querySelectorAll(".highlight").forEach((cell) => {
      cell.classList.remove("highlight");
    });

    console.log("highlighting related cells");

    const x = parseInt(input.getAttribute("data-x"));
    const y = parseInt(input.getAttribute("data-y"));

    // Row
    document.querySelectorAll(`[data-y="${y}"]`).forEach((cell) => {
      cell.parentElement.classList.add("highlight");
    });

    // Column
    document.querySelectorAll(`[data-x="${x}"]`).forEach((cell) => {
      cell.parentElement.classList.add("highlight");
    });

    // Box
    const boxStartX = Math.floor(x / 3) * 3;
    const boxStartY = Math.floor(y / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const cell = document.querySelector(
          `.cell-${boxStartX + i}${boxStartY + j}`
        );
        if (cell) cell.classList.add("highlight");
      }
    }
  }

  clearBoard() {
    this.cellContents.forEach((cell) => (cell.innerHTML = ""));
    this.board = Array(9)
      .fill()
      .map(() => Array(9).fill(0));
  }

  validateBoard() {
    this.allowInput = false;

    // build board representation
    const board = [];
    for (let y = 0; y < 9; y++) {
      const row = [];
      for (let x = 0; x < 9; x++) {
        let marks = this.cellContents[y * 9 + x].querySelectorAll("div");

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
      const numbers = new Set(board[y]);
      if (numbers.size !== 9) {
        document.querySelectorAll(`[data-y="${y}"]`).forEach((cell) => {
          cell.parentElement.classList.add("error");
        });
      }
    }

    // Validate columns
    for (let x = 0; x < 9; x++) {
      const numbers = new Set();
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

        const box = new Set();
        for (let y = 0; y < 3; y++) {
          for (let x = 0; x < 3; x++) {
            box.add(this.board[boxY + y][boxX + x]);
          }
        }

        if (numbers.size !== 9) {
          console.log("error");
          for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
              document
                .querySelector(`[data-x="${x}"][data-y="${y}"]`)
                .parentElement.classList.add("error");
            }
          }
        }
      }
    }

    return true;
  }
}

const game = new SudokuGame();

function generateGame() {
  game.addMark(1);
  game.addMark(2);
  game.addMark(3);
}

generateGame();
