const COLUMNS = 25;
const mappedSurfaceElement = document.getElementById('mapped');
const robotSurfaceElement = document.getElementById('surface');
const clearButton = document.getElementById('btn-clear');

const htmlSurfaceCells = Array(COLUMNS).fill().map(() => Array(COLUMNS));

document.querySelector(':root').style.setProperty('--columns', COLUMNS);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class Surface {
    constructor(parent) {
        this.matrix = Array(COLUMNS).fill().map(() => Array(COLUMNS).fill('.'));
        this.htmlCells = Array(COLUMNS).fill().map(() => Array(COLUMNS));
        this.dictinary = {
            '.': 'empty',
            '#': 'obstacle',
            'x': 'mapped',
            'o': 'robot',
        };
        this.createCells(parent)
    }

    createCells(parent) {
        this.matrix.forEach((row, i) => {
            row.forEach((cell, j) => {
                const cell_element = document.createElement('div');
                cell_element.classList.add('cell');
                cell_element.addEventListener('click', (e) => {
                    if (this.matrix[i][j] === 'o') return;
        
                    this.set(i, j, this.matrix[i][j] === '#' ? '.' : '#');
                    this.printMatrix();
                });
                parent.appendChild(cell_element);
                this.htmlCells[i][j] = cell_element;
            });
        });
    }

    set(x, y, value) {
        this.matrix[x][y] = value;
        this.updateHtml();
    }

    updateHtml() {
        this.matrix.forEach((row, i) => {
            row.forEach((value, j) => {
                this.htmlCells[i][j].classList = this.dictinary[value];
            });
        });
    }

    printMatrix() {
        console.clear();
        this.matrix.forEach(row => {
            console.log(row.join(' '));
            console.log();
        });
    }

    clear() {
        this.matrix.forEach(row => row.fill('.'));
        this.updateHtml();
    }
}

class Robot extends Surface {
    constructor(parent, map) {
        super(parent);
        this.x = Math.floor(COLUMNS / 2);
        this.y = Math.floor(COLUMNS / 2);
        this.map = map;
        this.robotSize = 3;
        this.halfSize = Math.floor(this.robotSize / 2);
        this.direction = 'up';
        this.fillAround(this.x, this.y, 'o');
    }

    clear() {
        super.clear();
        this.x = Math.floor(COLUMNS / 2);
        this.y = Math.floor(COLUMNS / 2);
        this.fillAround(this.x, this.y, 'o');
    }

    move(direction) {
        const prevX = this.x;
        const prevY = this.y;

        switch (direction) {
            case 'up':
                this.moveUp();
                break;
            case 'down':
                this.moveDown();
                break;
            case 'right':
                this.moveRight();
                break;
            case 'left':
                this.moveLeft();
                break;
        }

        if (this.x === prevX && this.y === prevY) return;

        this.fillAround(prevX, prevY, '.');
        this.fillAround(this.x, this.y, 'o');

        const out = this.halfSize + 1;

        for (let i = 0; i < this.robotSize; i++) {
            let x, y;

            x = this.x - out;
            y = this.y - this.halfSize + i;
            if (this.matrix[x]?.[y] === '#')
                this.map.set(x, y, 'x');

            x = this.x + out;
            y = this.y - this.halfSize + i;
            if (this.matrix[x]?.[y] === '#')
                this.map.set(x, y, 'x');

            x = this.x - this.halfSize + i;
            y = this.y - out;
            if (this.matrix[x]?.[y] === '#')
                this.map.set(x, y, 'x');

            x = this.x - this.halfSize + i;
            y = this.y + out;
            if (this.matrix[x]?.[y] === '#')
                this.map.set(x, y, 'x');
        }
    }

    moveUp() {
        this.x--;
        if (this.x - 1 < 0) {
            this.x++;
            return;
        }
        
        for (let i = 0; i < this.robotSize; i++) {
            if (this.matrix[this.x - this.halfSize][this.y - this.halfSize + i] === '#') {
                this.x++;
                return;
            };
        }
    }

    moveDown() {
        this.x++;
        if (this.x + 1 >= COLUMNS) {
            this.x--;
            return;
        }
        
        for (let i = 0; i < this.robotSize; i++) {
            if (this.matrix[this.x + this.halfSize][this.y - this.halfSize + i] === '#') {
                this.x--;
                return;
            };
        }
    }

    moveRight() {
        this.y++;
        if (this.y + 1 >= COLUMNS) {
            this.y--;
            return;
        }
        
        for (let i = 0; i < this.robotSize; i++) {
            if (this.matrix[this.x - this.halfSize + i][this.y + this.halfSize] === '#') {
                this.y--;
                return;
            };
        }
    }

    moveLeft() {
        this.y--;
        if (this.y - 1 < 0) {
            this.y++;
            return;
        }
        
        for (let i = 0; i < this.robotSize; i++) {
            if (this.matrix[this.x - this.halfSize + i][this.y - this.halfSize] === '#') {
                this.y++;
                return;
            };
        }
    }

    fillAround(x, y, marker) {
        for (let i = 0; i < this.robotSize; i++) {
            for (let j = 0; j < this.robotSize; j++) {
                this.matrix[x - this.halfSize + i][y - this.halfSize + j] = marker;
            }
        }
        this.updateHtml();
    }
}

const surface = new Surface(mappedSurfaceElement);
const robot = new Robot(robotSurfaceElement, surface);

clearButton.addEventListener('click', (e) => {
    surface.clear();
    robot.clear();
});

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp':
            robot.move('up');
            break;
        case 'ArrowDown':
            robot.move('down');
            break;
        case 'ArrowLeft':
            robot.move('left');
            break;
        case 'ArrowRight':
            robot.move('right');
            break;
    }
});