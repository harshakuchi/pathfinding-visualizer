class MazeGenerators {
  static recursiveBacktracker(grid) {
    const steps = []

    // First, mark all cells as walls
    for (let row = 0; row < grid.rows; row++) {
      for (let col = 0; col < grid.cols; col++) {
        const node = grid.nodes[row][col]
        if (!node.isStart && !node.isEnd) {
          steps.push({ row, col, type: "wall" })
        }
      }
    }

    // Create a visited tracker
    const visited = Array(grid.rows)
      .fill(null)
      .map(() => Array(grid.cols).fill(false))

    // Start from cell (1,1)
    const stack = []
    const startRow = 1
    const startCol = 1

    visited[startRow][startCol] = true
    steps.push({ row: startRow, col: startCol, type: "carve" })
    stack.push({ row: startRow, col: startCol })

    const directions = [
      { dr: -2, dc: 0 },
      { dr: 2, dc: 0 },
      { dr: 0, dc: -2 },
      { dr: 0, dc: 2 },
    ]

    while (stack.length > 0) {
      const current = stack[stack.length - 1]

      // Get unvisited neighbors
      const neighbors = []
      for (const { dr, dc } of directions) {
        const newRow = current.row + dr
        const newCol = current.col + dc
        if (newRow > 0 && newRow < grid.rows - 1 && newCol > 0 && newCol < grid.cols - 1 && !visited[newRow][newCol]) {
          neighbors.push({ row: newRow, col: newCol, wallRow: current.row + dr / 2, wallCol: current.col + dc / 2 })
        }
      }

      if (neighbors.length > 0) {
        // Choose random neighbor
        const next = neighbors[Math.floor(Math.random() * neighbors.length)]

        // Carve wall between current and next
        steps.push({ row: next.wallRow, col: next.wallCol, type: "carve" })
        steps.push({ row: next.row, col: next.col, type: "carve" })

        visited[next.row][next.col] = true
        stack.push({ row: next.row, col: next.col })
      } else {
        stack.pop()
      }
    }

    return steps
  }

  static prims(grid) {
    const steps = []

    // First, mark all cells as walls
    for (let row = 0; row < grid.rows; row++) {
      for (let col = 0; col < grid.cols; col++) {
        const node = grid.nodes[row][col]
        if (!node.isStart && !node.isEnd) {
          steps.push({ row, col, type: "wall" })
        }
      }
    }

    const inMaze = Array(grid.rows)
      .fill(null)
      .map(() => Array(grid.cols).fill(false))
    const frontier = []

    // Start from cell (1,1)
    const startRow = 1
    const startCol = 1

    inMaze[startRow][startCol] = true
    steps.push({ row: startRow, col: startCol, type: "carve" })

    // Add frontier cells
    this.addPrimsFrontier(grid, startRow, startCol, frontier, inMaze)

    while (frontier.length > 0) {
      // Pick random frontier cell
      const randomIndex = Math.floor(Math.random() * frontier.length)
      const { row, col } = frontier[randomIndex]
      frontier.splice(randomIndex, 1)

      if (inMaze[row][col]) continue

      // Find neighbors that are in the maze
      const inMazeNeighbors = this.getPrimsInMazeNeighbors(grid, row, col, inMaze)

      if (inMazeNeighbors.length > 0) {
        // Pick random in-maze neighbor
        const neighbor = inMazeNeighbors[Math.floor(Math.random() * inMazeNeighbors.length)]

        // Carve wall between frontier cell and maze
        const wallRow = (row + neighbor.row) / 2
        const wallCol = (col + neighbor.col) / 2

        steps.push({ row: wallRow, col: wallCol, type: "carve" })
        steps.push({ row, col, type: "carve" })

        inMaze[row][col] = true
        this.addPrimsFrontier(grid, row, col, frontier, inMaze)
      }
    }

    return steps
  }

  static addPrimsFrontier(grid, row, col, frontier, inMaze) {
    const directions = [
      [-2, 0],
      [2, 0],
      [0, -2],
      [0, 2],
    ]

    for (const [dr, dc] of directions) {
      const newRow = row + dr
      const newCol = col + dc
      if (newRow > 0 && newRow < grid.rows - 1 && newCol > 0 && newCol < grid.cols - 1 && !inMaze[newRow][newCol]) {
        // Check if already in frontier
        const exists = frontier.some((f) => f.row === newRow && f.col === newCol)
        if (!exists) {
          frontier.push({ row: newRow, col: newCol })
        }
      }
    }
  }

  static getPrimsInMazeNeighbors(grid, row, col, inMaze) {
    const neighbors = []
    const directions = [
      [-2, 0],
      [2, 0],
      [0, -2],
      [0, 2],
    ]

    for (const [dr, dc] of directions) {
      const newRow = row + dr
      const newCol = col + dc
      if (newRow > 0 && newRow < grid.rows - 1 && newCol > 0 && newCol < grid.cols - 1 && inMaze[newRow][newCol]) {
        neighbors.push({ row: newRow, col: newCol })
      }
    }

    return neighbors
  }

  static kruskals(grid) {
    const steps = []

    // First, mark all cells as walls
    for (let row = 0; row < grid.rows; row++) {
      for (let col = 0; col < grid.cols; col++) {
        const node = grid.nodes[row][col]
        if (!node.isStart && !node.isEnd) {
          steps.push({ row, col, type: "wall" })
        }
      }
    }

    // Create cells (odd positions only) and their sets
    const sets = new Map()
    let setId = 0

    for (let row = 1; row < grid.rows - 1; row += 2) {
      for (let col = 1; col < grid.cols - 1; col += 2) {
        sets.set(`${row},${col}`, setId++)
        steps.push({ row, col, type: "carve" })
      }
    }

    // Create edges (walls between cells)
    const edges = []
    for (let row = 1; row < grid.rows - 1; row += 2) {
      for (let col = 1; col < grid.cols - 1; col += 2) {
        if (row + 2 < grid.rows - 1) {
          edges.push({
            cell1: { row, col },
            cell2: { row: row + 2, col },
            wallRow: row + 1,
            wallCol: col,
          })
        }
        if (col + 2 < grid.cols - 1) {
          edges.push({
            cell1: { row, col },
            cell2: { row, col: col + 2 },
            wallRow: row,
            wallCol: col + 1,
          })
        }
      }
    }

    // Shuffle edges
    for (let i = edges.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[edges[i], edges[j]] = [edges[j], edges[i]]
    }

    // Find function
    const find = (cell) => sets.get(`${cell.row},${cell.col}`)

    // Union function
    const union = (cell1, cell2) => {
      const set1 = find(cell1)
      const set2 = find(cell2)

      if (set1 !== set2) {
        for (const [key, value] of sets) {
          if (value === set2) {
            sets.set(key, set1)
          }
        }
        return true
      }
      return false
    }

    // Process edges
    for (const edge of edges) {
      const set1 = find(edge.cell1)
      const set2 = find(edge.cell2)

      if (set1 !== set2) {
        union(edge.cell1, edge.cell2)
        steps.push({ row: edge.wallRow, col: edge.wallCol, type: "carve" })
      }
    }

    return steps
  }

  static getAccessibilitySteps(grid) {
    const steps = []

    // Clear area around start
    const startRow = grid.startNode.row
    const startCol = grid.startNode.col
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const r = startRow + dr
        const c = startCol + dc
        if (r >= 0 && r < grid.rows && c >= 0 && c < grid.cols) {
          const node = grid.nodes[r][c]
          if (!node.isStart && !node.isEnd) {
            steps.push({ row: r, col: c, type: "carve" })
          }
        }
      }
    }

    // Clear area around end
    const endRow = grid.endNode.row
    const endCol = grid.endNode.col
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const r = endRow + dr
        const c = endCol + dc
        if (r >= 0 && r < grid.rows && c >= 0 && c < grid.cols) {
          const node = grid.nodes[r][c]
          if (!node.isStart && !node.isEnd) {
            steps.push({ row: r, col: c, type: "carve" })
          }
        }
      }
    }

    return steps
  }
}

window.MazeGenerators = MazeGenerators
