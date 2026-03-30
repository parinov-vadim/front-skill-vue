---
title: "Графы: adjacency list, BFS, DFS, кратчайший путь"
description: "Представление графов, обходы BFS и DFS, поиск кратчайшего пути (алгоритм Дейкстры), топологическая сортировка. Примеры на JavaScript."
section: algorithms
difficulty: intermediate
readTime: 14
order: 7
tags: [графы, graph, BFS, DFS, кратчайший путь, Дейкстра, топологическая сортировка, adjacency list, алгоритмы]
---

## Что такое граф

Граф — набор вершин (узлов) и рёбер (связей) между ними. В отличие от деревьев, графы могут иметь циклы и любую структуру связей.

Примеры графов в реальной жизни: карта дорог, друзья в соцсети, зависимости между модулями.

## Представление графов

### Список смежности (Adjacency List)

Самый частый способ. Каждая вершина хранит список соседей:

```js
const graph = {
  A: ['B', 'C'],
  B: ['A', 'D', 'E'],
  C: ['A', 'F'],
  D: ['B'],
  E: ['B', 'F'],
  F: ['C', 'E'],
}
```

Для взвешенного графа:

```js
const weightedGraph = {
  A: [{ to: 'B', weight: 4 }, { to: 'C', weight: 2 }],
  B: [{ to: 'A', weight: 4 }, { to: 'D', weight: 3 }],
  C: [{ to: 'A', weight: 2 }, { to: 'D', weight: 5 }],
  D: [{ to: 'B', weight: 3 }, { to: 'C', weight: 5 }],
}
```

### Матрица смежности

Двумерный массив, где `matrix[i][j] = 1` если есть ребро:

```js
const matrix = [
//     A  B  C  D
  /*A*/[0, 1, 1, 0],
  /*B*/[1, 0, 0, 1],
  /*C*/[1, 0, 0, 1],
  /*D*/[0, 1, 1, 0],
]
```

Занимает O(V²) памяти, где V — количество вершин. Для разреженных графов (мало рёбер) список смежности экономичнее.

## Обход в глубину (DFS)

Идём по одной ветке до конца, потом возвращаемся и идём по другой.

### Рекурсивный

```js
function dfs(graph, start, visited = new Set()) {
  visited.add(start)
  console.log(start)

  for (const neighbor of graph[start]) {
    if (!visited.has(neighbor)) {
      dfs(graph, neighbor, visited)
    }
  }
}

dfs(graph, 'A') // A, B, D, E, F, C
```

### Итеративный

```js
function dfsIterative(graph, start) {
  const visited = new Set()
  const stack = [start]

  while (stack.length > 0) {
    const node = stack.pop()
    if (visited.has(node)) continue

    visited.add(node)
    console.log(node)

    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        stack.push(neighbor)
      }
    }
  }
}
```

Стек вместо рекурсии — тот же принцип, LIFO.

## Обход в ширину (BFS)

Обходим «волнами»: сначала все на расстоянии 1, потом 2 и т.д.

```js
function bfs(graph, start) {
  const visited = new Set([start])
  const queue = [start]
  const order = []

  while (queue.length > 0) {
    const node = queue.shift()
    order.push(node)

    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push(neighbor)
      }
    }
  }

  return order
}

bfs(graph, 'A') // ['A', 'B', 'C', 'D', 'E', 'F']
```

BFS находит кратчайший путь в **невзвешенном** графе.

## Кратчайший путь в невзвешенном графе

```js
function shortestPath(graph, start, end) {
  const visited = new Set([start])
  const queue = [[start]]

  while (queue.length > 0) {
    const path = queue.shift()
    const node = path[path.length - 1]

    if (node === end) return path

    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push([...path, neighbor])
      }
    }
  }

  return null
}

shortestPath(graph, 'A', 'F') // ['A', 'C', 'F']
```

Храним полный путь в очереди. Первый найденный путь до цели — кратчайший.

### Только расстояние

Если нужен только вес пути, а не сам маршрут:

```js
function shortestDistance(graph, start, end) {
  const dist = { [start]: 0 }
  const queue = [start]

  while (queue.length > 0) {
    const node = queue.shift()

    for (const neighbor of graph[node]) {
      if (dist[neighbor] === undefined) {
        dist[neighbor] = dist[node] + 1
        queue.push(neighbor)
      }
    }
  }

  return dist[end] ?? -1
}
```

## Алгоритм Дейкстры

Кратчайший путь во **взвешенном** графе с неотрицательными весами:

```js
function dijkstra(graph, start) {
  const dist = {}
  const visited = new Set()

  for (const node of Object.keys(graph)) {
    dist[node] = Infinity
  }
  dist[start] = 0

  while (true) {
    let current = null
    for (const node of Object.keys(graph)) {
      if (!visited.has(node) && (current === null || dist[node] < dist[current])) {
        current = node
      }
    }

    if (current === null || dist[current] === Infinity) break
    visited.add(current)

    for (const { to, weight } of graph[current]) {
      const newDist = dist[current] + weight
      if (newDist < dist[to]) {
        dist[to] = newDist
      }
    }
  }

  return dist
}

dijkstra(weightedGraph, 'A') // { A: 0, B: 4, C: 2, D: 7 }
```

На каждом шаге берём непосещённую вершину с минимальным расстоянием и обновляем расстояния до её соседей.

С приоритетной очередью (min-heap) сложность O((V + E) log V). Наивная реализация выше — O(V²).

## Количество островов

Классическая задача: дана двумерная сетка из '1' (земля) и '0' (вода). Посчитать количество островов:

```js
function numIslands(grid) {
  if (!grid.length) return 0

  let count = 0
  const rows = grid.length
  const cols = grid[0].length

  function dfs(r, c) {
    if (r < 0 || c < 0 || r >= rows || c >= cols || grid[r][c] !== '1') return
    grid[r][c] = '0'
    dfs(r + 1, c)
    dfs(r - 1, c)
    dfs(r, c + 1)
    dfs(r, c - 1)
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === '1') {
        count++
        dfs(r, c)
      }
    }
  }

  return count
}

numIslands([
  ['1', '1', '0', '0', '0'],
  ['1', '1', '0', '0', '0'],
  ['0', '0', '1', '0', '0'],
  ['0', '0', '0', '1', '1'],
]) // 3
```

Находим '1', запускаем DFS и «топим» весь остров (меняем на '0').

## Топологическая сортировка

Для направленного ациклического графа (DAG): упорядочить вершины так, что все рёбра идут слева направо.

```js
function topologicalSort(graph) {
  const visited = new Set()
  const order = []

  function dfs(node) {
    if (visited.has(node)) return
    visited.add(node)

    for (const neighbor of graph[node] || []) {
      dfs(neighbor)
    }

    order.push(node)
  }

  for (const node of Object.keys(graph)) {
    dfs(node)
  }

  return order.reverse()
}

const deps = {
  A: ['B', 'C'],
  B: ['D'],
  C: ['D'],
  D: [],
}

topologicalSort(deps) // ['A', 'C', 'B', 'D']
```

Добавляем узел в order после обработки всех зависимостей. Результат переворачиваем.

## Итог

- Список смежности — основной способ хранения графа
- DFS — стек или рекурсия, идёт вглубь. Для поиска путей, обнаружения циклов
- BFS — очередь, идёт вширь. Для кратчайшего пути в невзвешенном графе
- Дейкстра — кратчайший путь во взвешенном графе
- «Количество островов» — типичная задача на DFS/BFS по сетке
- Топологическая сортировка — для порядка выполнения зависимостей
