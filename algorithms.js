class PathfindingAlgorithms {
  static async bfs(grid, speed) {
    const startNode = grid.startNode
    const endNode = grid.endNode
    const queue = [startNode]
    const visitedInOrder = []
    startNode.isVisited = true

    while (queue.length > 0) {
      const currentNode = queue.shift()
      visitedInOrder.push(currentNode)

      if (currentNode === endNode) {
        return { visitedInOrder, pathFound: true }
      }

      const neighbors = grid.getNeighbors(currentNode)
      for (const neighbor of neighbors) {
        if (!neighbor.isVisited) {
          neighbor.isVisited = true
          neighbor.previousNode = currentNode
          queue.push(neighbor)
        }
      }
    }

    return { visitedInOrder, pathFound: false }
  }

  static async dfs(grid, speed) {
    const startNode = grid.startNode
    const endNode = grid.endNode
    const stack = [{ node: startNode, parent: null }]
    const visitedInOrder = []

    while (stack.length > 0) {
      const { node: currentNode, parent } = stack.pop()

      if (currentNode.isVisited) continue

      currentNode.isVisited = true
      currentNode.previousNode = parent
      visitedInOrder.push(currentNode)

      if (currentNode === endNode) {
        return { visitedInOrder, pathFound: true }
      }

      const neighbors = grid.getNeighbors(currentNode)
      for (const neighbor of neighbors) {
        if (!neighbor.isVisited) {
          stack.push({ node: neighbor, parent: currentNode })
        }
      }
    }

    return { visitedInOrder, pathFound: false }
  }

  static async dijkstra(grid, speed) {
    const startNode = grid.startNode
    const endNode = grid.endNode
    const visitedInOrder = []
    const unvisitedNodes = grid.getAllNodes()

    startNode.distance = 0

    while (unvisitedNodes.length > 0) {
      unvisitedNodes.sort((a, b) => a.distance - b.distance)
      const closestNode = unvisitedNodes.shift()

      if (closestNode.isWall) continue
      if (closestNode.distance === Number.POSITIVE_INFINITY) {
        return { visitedInOrder, pathFound: false }
      }

      closestNode.isVisited = true
      visitedInOrder.push(closestNode)

      if (closestNode === endNode) {
        return { visitedInOrder, pathFound: true }
      }

      const neighbors = grid.getNeighbors(closestNode)
      for (const neighbor of neighbors) {
        const newDistance = closestNode.distance + 1
        if (newDistance < neighbor.distance) {
          neighbor.distance = newDistance
          neighbor.previousNode = closestNode
        }
      }
    }

    return { visitedInOrder, pathFound: false }
  }

  static async astar(grid, speed) {
    const startNode = grid.startNode
    const endNode = grid.endNode
    const visitedInOrder = []
    const openSet = [startNode]

    startNode.distance = 0
    startNode.heuristic = this.manhattanDistance(startNode, endNode)
    startNode.totalCost = startNode.heuristic

    while (openSet.length > 0) {
      openSet.sort((a, b) => a.totalCost - b.totalCost)
      const currentNode = openSet.shift()

      if (currentNode.isVisited) continue
      currentNode.isVisited = true
      visitedInOrder.push(currentNode)

      if (currentNode === endNode) {
        return { visitedInOrder, pathFound: true }
      }

      const neighbors = grid.getNeighbors(currentNode)
      for (const neighbor of neighbors) {
        if (neighbor.isVisited) continue

        const tentativeDistance = currentNode.distance + 1
        if (tentativeDistance < neighbor.distance) {
          neighbor.previousNode = currentNode
          neighbor.distance = tentativeDistance
          neighbor.heuristic = this.manhattanDistance(neighbor, endNode)
          neighbor.totalCost = neighbor.distance + neighbor.heuristic

          if (!openSet.includes(neighbor)) {
            openSet.push(neighbor)
          }
        }
      }
    }

    return { visitedInOrder, pathFound: false }
  }

  static manhattanDistance(nodeA, nodeB) {
    return Math.abs(nodeA.row - nodeB.row) + Math.abs(nodeA.col - nodeB.col)
  }

  static getPath(endNode) {
    const path = []
    let currentNode = endNode

    while (currentNode != null) {
      path.unshift(currentNode)
      currentNode = currentNode.previousNode
    }

    return path
  }
}

window.PathfindingAlgorithms = PathfindingAlgorithms
