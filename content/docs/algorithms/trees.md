---
title: "Деревья: бинарное дерево, BFS, DFS, обходы"
description: "Структуры данных дерево и бинарное дерево на JavaScript. Обходы: inorder, preorder, postorder, BFS. Максимальная глубина, проверка BST, поиск пути."
section: algorithms
difficulty: intermediate
readTime: 15
order: 6
tags: [деревья, бинарное дерево, BST, BFS, DFS, обход дерева, inorder, preorder, postorder, алгоритмы]
---

## Что такое дерево

Дерево — это структура, где у каждого узла есть дети, а связей «вниз» нет. Один узел — корень (root), узлы без детей — листья (leaves).

```
       1
      / \
     2   3
    / \
   4   5
```

- Корень — 1
- Узел 2 — родитель 4 и 5
- Узлы 4, 5, 3 — листья

## Бинарное дерево

Бинарное дерево — у каждого узла максимум два ребёнка: `left` и `right`.

```js
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val
    this.left = left
    this.right = right
  }
}

const root = new TreeNode(1,
  new TreeNode(2,
    new TreeNode(4),
    new TreeNode(5)
  ),
  new TreeNode(3)
)
```

## Обходы в глубину (DFS)

DFS (Depth-First Search) — идём максимально глубоко по одной ветке, затем возвращаемся.

### Inorder (ЛКП) — левый, корень, правый

```js
function inorder(node) {
  if (!node) return []
  return [
    ...inorder(node.left),
    node.val,
    ...inorder(node.right),
  ]
}

inorder(root) // [4, 2, 5, 1, 3]
```

Для BST (бинарного дерева поиска) inorder даёт отсортированный массив.

### Preorder (КЛП) — корень, левый, правый

```js
function preorder(node) {
  if (!node) return []
  return [
    node.val,
    ...preorder(node.left),
    ...preorder(node.right),
  ]
}

preorder(root) // [1, 2, 4, 5, 3]
```

Полезно для сериализации дерева — по preorder можно восстановить структуру.

### Postorder (ЛПК) — левый, правый, корень

```js
function postorder(node) {
  if (!node) return []
  return [
    ...postorder(node.left),
    ...postorder(node.right),
    node.val,
  ]
}

postorder(root) // [4, 5, 2, 3, 1]
```

Используется, когда нужно обработать детей раньше родителя (например, удаление поддерева).

### Итеративный inorder

Рекурсия может переполнить стек. Итеративная версия через явный стек:

```js
function inorderIterative(root) {
  const result = []
  const stack = []
  let current = root

  while (current || stack.length > 0) {
    while (current) {
      stack.push(current)
      current = current.left
    }
    current = stack.pop()
    result.push(current.val)
    current = current.right
  }

  return result
}
```

## Обход в ширину (BFS)

BFS обходит дерево по уровням — сначала корень, потом его дети, потом внуки.

```js
function bfs(root) {
  if (!root) return []

  const result = []
  const queue = [root]

  while (queue.length > 0) {
    const node = queue.shift()
    result.push(node.val)

    if (node.left) queue.push(node.left)
    if (node.right) queue.push(node.right)
  }

  return result
}

bfs(root) // [1, 2, 3, 4, 5]
```

### BFS по уровням

Часто нужно вернуть массив массивов — по одному на каждый уровень:

```js
function levelOrder(root) {
  if (!root) return []

  const result = []
  const queue = [root]

  while (queue.length > 0) {
    const levelSize = queue.length
    const level = []

    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()
      level.push(node.val)
      if (node.left) queue.push(node.left)
      if (node.right) queue.push(node.right)
    }

    result.push(level)
  }

  return result
}

levelOrder(root) // [[1], [2, 3], [4, 5]]
```

## Максимальная глубина

```js
function maxDepth(root) {
  if (!root) return 0
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right))
}

maxDepth(root) // 3
```

На каждом уровне +1, берём максимум из двух поддеревьев.

## Симметричное дерево

Проверить, является ли дерево зеркальным относительно центра:

```js
function isSymmetric(root) {
  if (!root) return true
  return isMirror(root.left, root.right)
}

function isMirror(a, b) {
  if (!a && !b) return true
  if (!a || !b) return false
  return (
    a.val === b.val &&
    isMirror(a.left, b.right) &&
    isMirror(a.right, b.left)
  )
}
```

Левое поддерево должно быть зеркалом правого.

## Перевернуть дерево

```js
function invertTree(root) {
  if (!root) return null

  const temp = root.left
  root.left = root.right
  root.right = temp

  invertTree(root.left)
  invertTree(root.right)

  return root
}
```

Меняем местами левого и правого ребёнка на каждом узле.

## Проверить, является ли дерево BST

```js
function isValidBST(root) {
  function validate(node, min, max) {
    if (!node) return true
    if (node.val <= min || node.val >= max) return false
    return (
      validate(node.left, min, node.val) &&
      validate(node.right, node.val, max)
    )
  }

  return validate(root, -Infinity, Infinity)
}
```

Каждый узел должен быть в допустимом диапазоне. Для левого поддерева верхняя граница — значение текущего узла. Для правого — нижняя.

## Ближайший общий предок (LCA)

Найти общий узел-предок двух заданных узлов:

```js
function lowestCommonAncestor(root, p, q) {
  if (!root || root === p || root === q) return root

  const left = lowestCommonAncestor(root.left, p, q)
  const right = lowestCommonAncestor(root.right, p, q)

  if (left && right) return root
  return left || right
}
```

Если оба узла нашлись в разных поддеревьях — текущий узел и есть LCA. Если в одном — спускаемся дальше.

## Путь от корня до листа с заданной суммой

```js
function hasPathSum(root, targetSum) {
  if (!root) return false
  if (!root.left && !root.right) return root.val === targetSum
  return (
    hasPathSum(root.left, targetSum - root.val) ||
    hasPathSum(root.right, targetSum - root.val)
  )
}
```

На каждом шаге вычитаем значение узла из target. Дошли до листа — проверяем, совпала ли сумма.

## Конструирование дерева из обходов

```js
function buildTree(preorder, inorder) {
  if (preorder.length === 0) return null

  const rootVal = preorder[0]
  const rootIndex = inorder.indexOf(rootVal)

  const root = new TreeNode(rootVal)
  root.left = buildTree(
    preorder.slice(1, rootIndex + 1),
    inorder.slice(0, rootIndex)
  )
  root.right = buildTree(
    preorder.slice(rootIndex + 1),
    inorder.slice(rootIndex + 1)
  )

  return root
}
```

Первый элемент preorder — корень. В inorder ищем позицию корня — слева левое поддерево, справа правое.

## Итог

- Inorder (ЛКП) — отсортированный порядок для BST
- Preorder (КЛП) — для сериализации
- Postorder (ЛПК) — дети раньше родителя
- BFS — по уровням, нужна очередь
- Рекурсия — естественный способ работы с деревьями
- Два поддерева можно сравнивать рекурсивно
- BST: все значения слева меньше корня, справа больше
