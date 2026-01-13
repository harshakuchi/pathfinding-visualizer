document.addEventListener("DOMContentLoaded", () => {
  // Import necessary modules
  const Grid = window.Grid // Assuming Grid is a global variable or imported from another script
  const PathfindingAlgorithms = window.PathfindingAlgorithms // Assuming PathfindingAlgorithms is a global variable or imported from another script
  const MazeGenerators = window.MazeGenerators // Assuming MazeGenerators is a global variable or imported from another script

  // Calculate grid dimensions based on viewport
  const gridContainer = document.getElementById("grid")
  const containerWidth = Math.min(window.innerWidth - 80, 1000)
  const containerHeight = Math.min(window.innerHeight - 400, 500)
  const nodeSize = 26 // 25px + 1px gap

  const cols = Math.floor(containerWidth / nodeSize)
  const rows = Math.floor(containerHeight / nodeSize)

  const grid = new Grid(rows, cols, gridContainer)

  // DOM Elements
  const algorithmSelect = document.getElementById("algorithm")
  const mazeSelect = document.getElementById("maze")
  const speedSelect = document.getElementById("speed")
  const visualizeBtn = document.getElementById("visualize-btn")
  const clearPathBtn = document.getElementById("clear-path-btn")
  const clearGridBtn = document.getElementById("clear-grid-btn")
  const themeToggle = document.getElementById("theme-toggle")
  const generateMazeBtn = document.getElementById("generate-maze-btn")

  // State
  let isRunning = false
  let animationTimeouts = []

  // Speed mapping (delay in ms)
  const speedMap = {
    slow: 50,
    medium: 20,
    fast: 5,
  }

  // Theme toggle
  const savedTheme = localStorage.getItem("theme") || "light"
  document.documentElement.setAttribute("data-theme", savedTheme)

  themeToggle.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme")
    const newTheme = currentTheme === "dark" ? "light" : "dark"
    document.documentElement.setAttribute("data-theme", newTheme)
    localStorage.setItem("theme", newTheme)
  })

  // Clear all animation timeouts
  const clearAnimations = () => {
    animationTimeouts.forEach((timeout) => clearTimeout(timeout))
    animationTimeouts = []
  }

  // Set buttons state
  const setButtonsState = (disabled) => {
    isRunning = disabled
    visualizeBtn.disabled = disabled
    clearPathBtn.disabled = disabled
    clearGridBtn.disabled = disabled
    mazeSelect.disabled = disabled
  }

  // Animate visited nodes
  const animateVisited = (visitedNodes, speed) => {
    return new Promise((resolve) => {
      const delay = speedMap[speed]

      visitedNodes.forEach((node, index) => {
        const timeout = setTimeout(() => {
          if (!node.isStart && !node.isEnd) {
            node.element.classList.add("visited")
          }

          if (index === visitedNodes.length - 1) {
            resolve()
          }
        }, index * delay)

        animationTimeouts.push(timeout)
      })

      if (visitedNodes.length === 0) {
        resolve()
      }
    })
  }

  // Animate path
  const animatePath = (path, speed) => {
    return new Promise((resolve) => {
      const delay = speedMap[speed] * 2

      path.forEach((node, index) => {
        const timeout = setTimeout(() => {
          if (!node.isStart && !node.isEnd) {
            node.element.classList.remove("visited")
            node.element.classList.add("path")
          }

          if (index === path.length - 1) {
            resolve()
          }
        }, index * delay)

        animationTimeouts.push(timeout)
      })

      if (path.length === 0) {
        resolve()
      }
    })
  }

  // Run visualization
  const runVisualization = async () => {
    // Reset if already running
    clearAnimations()
    grid.clearPath()

    setButtonsState(true)

    const algorithm = algorithmSelect.value
    const speed = speedSelect.value

    let result

    switch (algorithm) {
      case "bfs":
        result = await PathfindingAlgorithms.bfs(grid, speed)
        break
      case "dfs":
        result = await PathfindingAlgorithms.dfs(grid, speed)
        break
      case "dijkstra":
        result = await PathfindingAlgorithms.dijkstra(grid, speed)
        break
      case "astar":
        result = await PathfindingAlgorithms.astar(grid, speed)
        break
    }

    await animateVisited(result.visitedInOrder, speed)

    if (result.pathFound) {
      const path = PathfindingAlgorithms.getPath(grid.endNode)
      await animatePath(path, speed)
    }

    setButtonsState(false)
  }

  const animateMaze = (steps, speed) => {
    return new Promise((resolve) => {
      const delay = speedMap[speed]

      steps.forEach((step, index) => {
        const timeout = setTimeout(() => {
          const node = grid.nodes[step.row][step.col]

          if (!node.isStart && !node.isEnd) {
            if (step.type === "wall") {
              grid.setWall(step.row, step.col, true)
              node.element.classList.add("wall-animate")
            } else if (step.type === "carve") {
              grid.setWall(step.row, step.col, false)
              node.element.classList.add("carve-animate")
            }
          }

          if (index === steps.length - 1) {
            // Clean up animation classes
            setTimeout(() => {
              for (let r = 0; r < grid.rows; r++) {
                for (let c = 0; c < grid.cols; c++) {
                  grid.nodes[r][c].element.classList.remove("wall-animate", "carve-animate")
                }
              }
              resolve()
            }, 300)
          }
        }, index * delay)

        animationTimeouts.push(timeout)
      })

      if (steps.length === 0) {
        resolve()
      }
    })
  }

  const generateMaze = async () => {
    const type = mazeSelect.value
    if (!type) return

    clearAnimations()
    grid.clearGrid()
    setButtonsState(true)

    let steps = []

    switch (type) {
      case "recursive":
        steps = MazeGenerators.recursiveBacktracker(grid)
        break
      case "prims":
        steps = MazeGenerators.prims(grid)
        break
      case "kruskals":
        steps = MazeGenerators.kruskals(grid)
        break
    }

    // Add accessibility steps to ensure start/end are reachable
    const accessSteps = MazeGenerators.getAccessibilitySteps(grid)
    steps = steps.concat(accessSteps)

    const speed = speedSelect.value
    await animateMaze(steps, speed)

    setButtonsState(false)
  }

  // Event listeners
  visualizeBtn.addEventListener("click", runVisualization)

  clearPathBtn.addEventListener("click", () => {
    clearAnimations()
    grid.clearPath()
  })

  clearGridBtn.addEventListener("click", () => {
    clearAnimations()
    grid.clearGrid()
  })

  generateMazeBtn.addEventListener("click", generateMaze)

  // Reset when algorithm changes
  algorithmSelect.addEventListener("change", () => {
    if (isRunning) {
      clearAnimations()
      grid.clearPath()
      setButtonsState(false)
    }
  })

  // Handle window resize
  let resizeTimeout
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
      const newContainerWidth = Math.min(window.innerWidth - 80, 1000)
      const newContainerHeight = Math.min(window.innerHeight - 400, 500)
      const newCols = Math.floor(newContainerWidth / nodeSize)
      const newRows = Math.floor(newContainerHeight / nodeSize)

      if (newCols !== grid.cols || newRows !== grid.rows) {
        clearAnimations()
        grid.rows = newRows
        grid.cols = newCols
        grid.init()
      }
    }, 250)
  })
})
