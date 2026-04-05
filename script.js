const gridContainer = document.getElementById('grid-container');

// ตั้งค่าขนาดตาราง
const ROWS = 20;
const COLS = 50;

// จุดเริ่มต้นและจุดหมายเริ่มต้น
let startNode = { row: 10, col: 10 };
let endNode = { row: 10, col: 40 };

// ตัวแปรเช็กว่าเมาส์ถูกกดค้างอยู่หรือไม่ (เพื่อใช้วาดกำแพงแบบลากยาวๆ)
let isMouseDown = false;

// ฟังก์ชันสร้าง Grid
function createGrid() {
    gridContainer.style.display = 'grid';
    gridContainer.style.gridTemplateColumns = `repeat(${COLS}, 25px)`;

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const node = document.createElement('div');
            node.id = `node-${r}-${c}`;
            node.classList.add('node');

            // กำหนดจุด Start และ End
            if (r === startNode.row && c === startNode.col) {
                node.classList.add('start');
            } else if (r === endNode.row && c === endNode.col) {
                node.classList.add('end');
            }

            // เพิ่ม Event Listeners สำหรับวาดกำแพง
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

// ฟังก์ชันเปลี่ยนสถานะให้เป็นกำแพง
function toggleWall(node, row, col) {
    // ห้ามวาดทับจุดเริ่มและจุดหมาย
    if ((row === startNode.row && col === startNode.col) || 
        (row === endNode.row && col === endNode.col)) {
        return;
    }
    
    // สลับคลาส wall (มีอยู่แล้วลบออก, ไม่มีให้เพิ่มเข้า)
    node.classList.toggle('wall');
}

// หยุดวาดกำแพงเมื่อปล่อยเมาส์นอกตาราง
document.body.addEventListener('mouseup', () => {
    isMouseDown = false;
});

// รันฟังก์ชันสร้างตารางเมื่อเปิดหน้าเว็บ
createGrid();

// ฟังก์ชันหน่วงเวลาเพื่อให้ตาเรามองเห็นภาพเคลื่อนไหว (ความลับของการทำ Visualizer)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ฟังก์ชันคำนวณระยะทางแบบ Manhattan Distance (สำหรับ h-cost)
function heuristic(nodeA, nodeB) {
    return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col);
}

// ฟังก์ชันดึงสถานะล่าสุดของตารางมาคำนวณ
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
                parent: null, // ไว้จำว่าเดินมาจากช่องไหน จะได้วาดทางกลับถูก
                isWall: element.classList.contains('wall')
            });
        }
        gridData.push(rowArray);
    }
    return gridData;
}

// ฟังก์ชันหาช่องรอบๆ 4 ทิศทาง (บน, ล่าง, ซ้าย, ขวา)
function getNeighbors(grid, node) {
    let neighbors = [];
    const { row, col } = node;
    
    if (row > 0) neighbors.push(grid[row - 1][col]); // บน
    if (row < ROWS - 1) neighbors.push(grid[row + 1][col]); // ล่าง
    if (col > 0) neighbors.push(grid[row][col - 1]); // ซ้าย
    if (col < COLS - 1) neighbors.push(grid[row][col + 1]); // ขวา
    
    // คัดเอาเฉพาะช่องที่ไม่ใช่กำแพง
    return neighbors.filter(n => !n.isWall);
}

// ==========================================
// ลอจิกของ A* Search Algorithm
// ==========================================
async function visualizeAStar() {
    let grid = getGridData();
    let start = grid[startNode.row][startNode.col];
    let end = grid[endNode.row][endNode.col];

    start.g = 0;
    start.f = heuristic(start, end);

    let openSet = [start]; // แถวคอยที่รอตรวจสอบ
    let closedSet = new Set(); // ช่องที่ตรวจเสร็จแล้ว

    while (openSet.length > 0) {
        // หาช่องที่มีค่า f ต่ำที่สุดในแถวคอย
        openSet.sort((a, b) => a.f - b.f);
        let current = openSet.shift(); // ดึงตัวหน้าสุดออกมา

        // ถ้าเดินมาถึงจุดหมายแล้ว
        if (current.row === end.row && current.col === end.col) {
            await drawPath(current);
            return; 
        }

        closedSet.add(`${current.row}-${current.col}`);

        // ระบายสีช่องที่กำลังตรวจสอบ (ข้ามสีทับจุดเริ่มและจุดจบ)
        if (current !== start && current !== end) {
            document.getElementById(`node-${current.row}-${current.col}`).classList.add('visited');
            await sleep(15); // หน่วงเวลา 15 มิลลิวินาที ให้เกิดอนิเมชัน
        }

        let neighbors = getNeighbors(grid, current);
        
        for (let neighbor of neighbors) {
            if (closedSet.has(`${neighbor.row}-${neighbor.col}`)) continue;

            let tentativeG = current.g + 1; // ระยะทางเดินขยับ 1 ช่อง
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

// ฟังก์ชันวาดเส้นทางที่สั้นที่สุด (ย้อนรอยจากเป้าหมายกลับไปจุดเริ่มต้น)
async function drawPath(node) {
    let current = node.parent;
    while (current.parent) { 
        document.getElementById(`node-${current.row}-${current.col}`).classList.remove('visited');
        document.getElementById(`node-${current.row}-${current.col}`).classList.add('path');
        await sleep(30);
        current = current.parent;
    }
}

// เชื่อมปุ่ม Visualize ให้เลือกทำงานตาม Dropdown
document.getElementById('visualize-btn').addEventListener('click', () => {
    // ล้างเส้นทางเก่าออกก่อนรันใหม่เสมอ
    clearPathOnly(); 
    
    const selectedAlgo = document.getElementById('algorithm-select').value;
    if (selectedAlgo === 'astar') {
        visualizeAStar();
    } else if (selectedAlgo === 'greedy') {
        visualizeGreedy();
    }
});

// เชื่อมปุ่ม Clear Board ให้ล้างทุกอย่างรวมถึงกำแพงแบบไม่ต้อง Refresh หน้าเว็บ
document.getElementById('clear-board-btn').addEventListener('click', () => {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            let node = document.getElementById(`node-${r}-${c}`);
            node.classList.remove('visited');
            node.classList.remove('path');
            node.classList.remove('wall'); // ลบกำแพงด้วย
        }
    }
});
// ==========================================
// ลอจิกของ Greedy Best-First Search
// ==========================================
async function visualizeGreedy() {
    let grid = getGridData();
    let start = grid[startNode.row][startNode.col];
    let end = grid[endNode.row][endNode.col];

    start.h = heuristic(start, end);

    let openSet = [start];
    let closedSet = new Set();

    while (openSet.length > 0) {
        // Greedy สนใจแค่ค่า h (ระยะห่างจากเป้าหมาย) ไม่สนระยะทางที่ผ่านมา
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

            // ตรวจสอบว่าเพื่อนบ้านคนนี้อยู่ในคิวรอตรวจหรือยัง
            let inOpenSet = openSet.some(n => n.row === neighbor.row && n.col === neighbor.col);

            if (!inOpenSet) {
                neighbor.parent = current;
                neighbor.h = heuristic(neighbor, end);
                openSet.push(neighbor); // จับใส่คิว
            }
        }
    }
    alert("ไม่พบเส้นทาง! (No path found)");
}
// ฟังก์ชันล้างเฉพาะเส้นทาง (เก็บกำแพงไว้เปรียบเทียบ Algorithm)
function clearPathOnly() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            let node = document.getElementById(`node-${r}-${c}`);
            node.classList.remove('visited');
            node.classList.remove('path');
        }
    }
}