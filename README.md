# 🧠 AI Pathfinding Algorithm Visualizer

A web-based interactive visualization tool that demonstrates how pathfinding algorithms work under the hood. Built entirely with Vanilla JavaScript, HTML, and CSS.

This project was created to deepen my understanding of Data Structures and Artificial Intelligence search algorithms by translating theoretical concepts into interactive, visual web components.

## 🚀 Live Demo
> **[Click here to view the Live Demo](https://YOUR-USERNAME.github.io/ai-algorithm-visualizer)** > *(Note: Replace the link above with your actual GitHub Pages link)*

## ✨ Features
* **Interactive Grid:** Users can draw custom obstacles (walls) by clicking and dragging on the grid.
* **Algorithm Selection:** Dynamically switch between different search algorithms to compare their behavior and efficiency.
* **Real-time Visualization:** Step-by-step animation using `async/await` to visually track the algorithm's exploration process.
* **Clear Board Utility:** Quickly reset the visualizer paths while maintaining the custom-drawn walls for direct algorithm comparison.

## 🛠️ Tech Stack
* **Frontend Structure:** HTML5
* **Styling:** CSS3 (Custom Grid Layouts & Animations)
* **Logic & DOM Manipulation:** Vanilla JavaScript (ES6+)

## 🔍 Algorithms Implemented

### 1. A* Search (A-Star)
The A* algorithm is one of the best and most popular pathfinding techniques. It guarantees the shortest path by calculating both the distance from the start node ($g(cost)$) and the estimated distance to the target ($h(cost)$ using Manhattan distance).
* **Behavior:** Smart, balanced, and always finds the optimal path.

### 2. Greedy Best-First Search
This algorithm evaluates nodes based solely on their heuristic cost ($h(cost)$), making it "greedy." It always picks the path that appears closest to the goal at the current moment.
* **Behavior:** Faster than A* in open spaces but can easily get trapped by obstacles and does not guarantee the shortest path.

## 💻 How to Run Locally
1. Clone the repository:
   ```bash
   git clone [https://github.com/YOUR-USERNAME/ai-algorithm-visualizer.git](https://github.com/YOUR-USERNAME/ai-algorithm-visualizer.git)
