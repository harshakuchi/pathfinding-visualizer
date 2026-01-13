class Grid {
  constructor(rows, cols, container) {
    this.rows = rows
    this.cols = cols
    this.container = container
    this.nodes = []
    this.startNode = null
    this.endNode = null
    this.isMouseDown = false
    this.isDraggingStart = false
    this.isDraggingEnd = false

    this.init()
  }

  init() {
    this.container.style.gridTemplateColumns = `repeat(${this.cols}, 25px)`
    this.container.innerHTML = ""
    this.nodes = []

    for (let row = 0; row < this.rows; row++) {
      const rowArr = []
      for (let col = 0; col < this.cols; col++) {
        const node = document.createElement("div")
        node.className = "node"
        node.dataset.row = row
        node.dataset.col = col

        this.container.appendChild(node)
        rowArr.push({
          row,
          col,
          element: node,
          isWall: false,
          isStart: false,
          isEnd: false,
          isVisited: false,
          isPath: false,
          distance: Number.POSITIVE_INFINITY,
          heuristic: 0,
          totalCost: Number.POSITIVE_INFINITY,
          previousNode: null,
        })
      }
      this.nodes.push(rowArr)
    }

    // Set default start and end positions
    const startRow = Math.floor(this.rows / 2)
    const startCol = Math.floor(this.cols / 4)
    const endRow = Math.floor(this.rows / 2)
    const endCol = Math.floor((3 * this.cols) / 4)

    this.setStart(startRow, startCol)
    this.setEnd(endRow, endCol)

    this.addEventListeners()
  }

  addEventListeners() {
    this.container.addEventListener("mousedown", (e) => this.handleMouseDown(e))
    this.container.addEventListener("mousemove", (e) => this.handleMouseMove(e))
    this.container.addEventListener("mouseup", () => this.handleMouseUp())
    this.container.addEventListener("mouseleave", () => this.handleMouseUp())

    // Touch support
    this.container.addEventListener("touchstart", (e) => this.handleTouchStart(e))
    this.container.addEventListener("touchmove", (e) => this.handleTouchMove(e))
    this.container.addEventListener("touchend", () => this.handleMouseUp())
  }

  handleMouseDown(e) {
    if (e.target.classList.contains("node")) {
      const row = Number.parseInt(e.target.dataset.row)
      const col = Number.parseInt(e.target.dataset.col)
      const node = this.nodes[row][col]

      if (node.isStart) {
        this.isDraggingStart = true
      } else if (node.isEnd) {
        this.isDraggingEnd = true
      } else {
        this.isMouseDown = true
        this.toggleWall(row, col)
      }
    }
  }

  handleMouseMove(e) {
    if (e.target.classList.contains("node")) {
      const row = Number.parseInt(e.target.dataset.row)
      const col = Number.parseInt(e.target.dataset.col)
      const node = this.nodes[row][col]

      if (this.isDraggingStart && !node.isEnd && !node.isWall) {
        this.setStart(row, col)
      } else if (this.isDraggingEnd && !node.isStart && !node.isWall) {
        this.setEnd(row, col)
      } else if (this.isMouseDown && !node.isStart && !node.isEnd) {
        this.setWall(row, col, true)
      }
    }
  }

  handleMouseUp() {
    this.isMouseDown = false
    this.isDraggingStart = false
    this.isDraggingEnd = false
  }

  handleTouchStart(e) {
    e.preventDefault()
    const touch = e.touches[0]
    const target = document.elementFromPoint(touch.clientX, touch.clientY)
    if (target && target.classList.contains("node")) {
      const row = Number.parseInt(target.dataset.row)
      const col = Number.parseInt(target.dataset.col)
      const node = this.nodes[row][col]

      if (node.isStart) {
        this.isDraggingStart = true
      } else if (node.isEnd) {
        this.isDraggingEnd = true
      } else {
        this.isMouseDown = true
        this.toggleWall(row, col)
      }
    }
  }

  handleTouchMove(e) {
    e.preventDefault()
    const touch = e.touches[0]
    const target = document.elementFromPoint(touch.clientX, touch.clientY)
    if (target && target.classList.contains("node")) {
      const row = Number.parseInt(target.dataset.row)
      const col = Number.parseInt(target.dataset.col)
      const node = this.nodes[row][col]

      if (this.isDraggingStart && !node.isEnd && !node.isWall) {
        this.setStart(row, col)
      } else if (this.isDraggingEnd && !node.isStart && !node.isWall) {
        this.setEnd(row, col)
      } else if (this.isMouseDown && !node.isStart && !node.isEnd) {
        this.setWall(row, col, true)
      }
    }
  }

  setStart(row, col) {
    if (this.startNode) {
      this.startNode.isStart = false
      this.startNode.element.classList.remove("start")
    }
    this.startNode = this.nodes[row][col]
    this.startNode.isStart = true
    this.startNode.element.classList.add("start")
  }

  setEnd(row, col) {
    if (this.endNode) {
      this.endNode.isEnd = false
      this.endNode.element.classList.remove("end")
    }
    this.endNode = this.nodes[row][col]
    this.endNode.isEnd = true
    this.endNode.element.classList.add("end")
  }

  toggleWall(row, col) {
    const node = this.nodes[row][col]
    if (!node.isStart && !node.isEnd) {
      node.isWall = !node.isWall
      node.element.classList.toggle("wall")
    }
  }

  setWall(row, col, isWall) {
    const node = this.nodes[row][col]
    if (!node.isStart && !node.isEnd) {
      node.isWall = isWall
      if (isWall) {
        node.element.classList.add("wall")
      } else {
        node.element.classList.remove("wall")
      }
    }
  }

  clearPath() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const node = this.nodes[row][col]
        node.isVisited = false
        node.isPath = false
        node.distance = Number.POSITIVE_INFINITY
        node.heuristic = 0
        node.totalCost = Number.POSITIVE_INFINITY
        node.previousNode = null
        node.element.classList.remove("visited", "path")
      }
    }
  }

  clearGrid() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const node = this.nodes[row][col]
        node.isWall = false
        node.isVisited = false
        node.isPath = false
        node.distance = Number.POSITIVE_INFINITY
        node.heuristic = 0
        node.totalCost = Number.POSITIVE_INFINITY
        node.previousNode = null
        node.element.classList.remove("wall", "visited", "path")
      }
    }
  }

  getNeighbors(node) {
    const neighbors = []
    const { row, col } = node

    if (row > 0) neighbors.push(this.nodes[row - 1][col])
    if (row < this.rows - 1) neighbors.push(this.nodes[row + 1][col])
    if (col > 0) neighbors.push(this.nodes[row][col - 1])
    if (col < this.cols - 1) neighbors.push(this.nodes[row][col + 1])

    return neighbors.filter((n) => !n.isWall)
  }

  getAllNodes() {
    const allNodes = []
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        allNodes.push(this.nodes[row][col])
      }
    }
    return allNodes
  }
}

window.Grid = Grid
