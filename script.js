const gridContainer = document.getElementById('grid-container');

const ROWS = 20;
const COLS = 50;


let startNode = { row: 10, col: 10 };
let endNode = { row: 10, col: 40 };


let isMouseDown = false;


function createGrid() {
    gridContainer.style.display = 'grid';
    gridContainer.style.gridTemplateColumns = `repeat(${COLS}, 25px)`;

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const node = document.createElement('div');
            node.id = `node-${r}-${c}`;
            node.classList.add('node');

         
            if (r === startNode.row && c === startNode.col) {
                node.classList.add('start');
            } else if (r === endNode.row && c === endNode.col) {
                node.classList.add('end');
            }

            
            node.addEventListener('mousedown', () => {
                isMouseDown = true;
                toggleWall(node, r, c);
            });

            node.addEventListener('mouseenter', () => {
                if (isMouseDown) {
                    toggleWall(node, r, c);
                }
            });

            node.addEventListener('mouseup', () => {
                isMouseDown = false;
            });
            

            gridContainer.appendChild(node);
        }
    }
}


function toggleWall(node, row, col) {

    if ((row === startNode.row && col === startNode.col) || 
        (row === endNode.row && col === endNode.col)) {
        return;
    }
    
    
    node.classList.toggle('wall');
}


document.body.addEventListener('mouseup', () => {
    isMouseDown = false;
});


createGrid();


const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));


function heuristic(nodeA, nodeB) {
    return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
}


function getGridData() {
    let gridData = [];
    for (let r = 0; r < ROWS; r++) {
        let rowArray = [];
        for (let c = 0; c < COLS; c++) {
            let element = document.getElementById(`node-${r}-${c}`);
            rowArray.push({
                row: r,
                col: c,
                g: Infinity,
                h: 0,
                f: Infinity,
                parent: null, 
                isWall: element.classList.contains('wall')
            });
        }
        gridData.push(rowArray);
    }
    return gridData;
}


function getNeighbors(grid, node) {
    let neighbors = [];
    const { row, col } = node;
    
    if (row > 0) neighbors.push(grid[row - 1][col]); // บน
    if (row < ROWS - 1) neighbors.push(grid[row + 1][col]); // ล่าง
    if (col > 0) neighbors.push(grid[row][col - 1]); // ซ้าย
    if (col < COLS - 1) neighbors.push(grid[row][col + 1]); // ขวา
    

    return neighbors.filter(n => !n.isWall);
}


async function visualizeAStar() {
    let grid = getGridData();
    let start = grid[startNode.row][startNode.col];
    let end = grid[endNode.row][endNode.col];

    start.g = 0;
    start.f = heuristic(start, end);

    let openSet = [start]; 
    let closedSet = new Set(); 

    while (openSet.length > 0) {
       
        openSet.sort((a, b) => a.f - b.f);
        let current = openSet.shift(); 

     
        if (current.row === end.row && current.col === end.col) {
            await drawPath(current);
            return; 
        }

        closedSet.add(`${current.row}-${current.col}`);

        
        if (current !== start && current !== end) {
            document.getElementById(`node-${current.row}-${current.col}`).classList.add('visited');
            await sleep(15); 
        }

        let neighbors = getNeighbors(grid, current);
        
        for (let neighbor of neighbors) {
            if (closedSet.has(`${neighbor.row}-${neighbor.col}`)) continue;

            let tentativeG = current.g + 1; 
            let inOpenSet = openSet.some(n => n.row === neighbor.row && n.col === neighbor.col);

            if (tentativeG < neighbor.g) {
                neighbor.parent = current;
                neighbor.g = tentativeG;
                neighbor.h = heuristic(neighbor, end);
                neighbor.f = neighbor.g + neighbor.h;

                if (!inOpenSet) {
                    openSet.push(neighbor);
                }
            }
        }
    }
    alert("ไม่พบเส้นทาง! (No path found)");
}


async function drawPath(node) {
    let current = node.parent;
    while (current.parent) { 
        document.getElementById(`node-${current.row}-${current.col}`).classList.remove('visited');
        document.getElementById(`node-${current.row}-${current.col}`).classList.add('path');
        await sleep(30);
        current = current.parent;
    }
}


document.getElementById('visualize-btn').addEventListener('click', () => {

    clearPathOnly(); 
    
    const selectedAlgo = document.getElementById('algorithm-select').value;
    if (selectedAlgo === 'astar') {
        visualizeAStar();
    } else if (selectedAlgo === 'greedy') {
        visualizeGreedy();
    }
});


document.getElementById('clear-board-btn').addEventListener('click', () => {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            let node = document.getElementById(`node-${r}-${c}`);
            node.classList.remove('visited');
            node.classList.remove('path');
            node.classList.remove('wall'); 
        }
    }
});

async function visualizeGreedy() {
    let grid = getGridData();
    let start = grid[startNode.row][startNode.col];
    let end = grid[endNode.row][endNode.col];

    start.h = heuristic(start, end);

    let openSet = [start];
    let closedSet = new Set();

    while (openSet.length > 0) {
       
        openSet.sort((a, b) => a.h - b.h);
        let current = openSet.shift();

        if (current.row === end.row && current.col === end.col) {
            await drawPath(current);
            return;
        }

        closedSet.add(`${current.row}-${current.col}`);

        if (current !== start && current !== end) {
            document.getElementById(`node-${current.row}-${current.col}`).classList.add('visited');
            await sleep(15);
        }

        let neighbors = getNeighbors(grid, current);
        
        for (let neighbor of neighbors) {
            if (closedSet.has(`${neighbor.row}-${neighbor.col}`)) continue;

         
            let inOpenSet = openSet.some(n => n.row === neighbor.row && n.col === neighbor.col);

            if (!inOpenSet) {
                neighbor.parent = current;
                neighbor.h = heuristic(neighbor, end);
                openSet.push(neighbor); 
            }
        }
    }
    alert("ไม่พบเส้นทาง! (No path found)");
}

function clearPathOnly() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            let node = document.getElementById(`node-${r}-${c}`);
            node.classList.remove('visited');
            node.classList.remove('path');
        }
    }
}