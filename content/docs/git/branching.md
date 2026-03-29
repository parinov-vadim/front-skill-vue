---
title: Ветвление в Git
description: Ветки позволяют работать над разными функциями параллельно, не затрагивая основной код. Изучите стратегии создания и слияния веток.
section: git
difficulty: beginner
readTime: 7
order: 2
tags: [git, branches, merge, workflow]
---

## Что такое ветка?

Ветка — это просто **именованный указатель** на коммит. Создание ветки не копирует файлы — это почти бесплатная операция.

```
main:    A ─── B ─── C
                      ↑
              feature: D ─── E
```

`HEAD` — специальный указатель на текущую ветку/коммит.

## Работа с ветками

```bash
# Просмотр
git branch              # Локальные ветки
git branch -a           # Все ветки (включая remote)
git branch -v           # С последним коммитом

# Создание
git branch feature/login
git checkout -b feature/login    # Создать + переключиться
git switch -c feature/login      # Современный синтаксис

# Переключение
git checkout main
git switch main

# Переименование
git branch -m old-name new-name  # Текущая ветка
git branch -m feature/old feature/new

# Удаление
git branch -d feature/login      # Только если слита
git branch -D feature/login      # Принудительно
git push origin -d feature/login # Удалить на remote
```

## Merge — слияние

### Fast-forward merge

Если ветка можно просто «перемотать» вперёд:

```
До:
  main: A ─── B
               ↑ main, feature

После git merge feature (fast-forward):
  main: A ─── B ─── C
                     ↑ main, feature
```

```bash
git checkout main
git merge feature/login
# Fast-forward: no merge commit created
```

### 3-way merge

Когда ветки разошлись — создаётся merge commit:

```
До:
  main:    A ─── B ─── C
                        ↑ main
  feature: A ─── B ─── D ─── E
                               ↑ feature

После git merge feature:
  main: A ─── B ─── C ─── M (merge commit)
                     \   /
                      D─E
```

```bash
git checkout main
git merge feature/auth
# Automatic merge commit: "Merge branch 'feature/auth'"
```

### No-fast-forward

```bash
# Всегда создавать merge commit (для истории)
git merge --no-ff feature/auth -m "feat: merge auth feature"
```

## Разрешение конфликтов

```
<<<<<<< HEAD (текущая ветка)
const greeting = 'Привет'
=======
const greeting = 'Hello'
>>>>>>> feature/i18n (входящая ветка)
```

1. Отредактировать файл вручную — оставить нужный вариант
2. `git add file.txt` — отметить как разрешённый
3. `git commit` — завершить слияние

```bash
# Инструменты для разрешения
git mergetool       # Открыть графический редактор конфликтов
git merge --abort   # Отменить слияние
```

## Полезные паттерны

### Обновление ветки до актуального main

```bash
git checkout feature/my-feature
git merge main          # Слить main в feature
# или
git rebase main         # Перебазировать на main (чище история)
```

### Просмотр разницы между ветками

```bash
git log main..feature   # Коммиты в feature, которых нет в main
git diff main...feature # Изменения с момента расхождения
```

### Cherry-pick — взять один коммит

```bash
git cherry-pick abc1234  # Применить коммит к текущей ветке
git cherry-pick a1..b2   # Диапазон коммитов
```

## Соглашения по именованию веток

```
feature/user-authentication    # Новая функциональность
fix/login-redirect-bug         # Исправление бага
hotfix/critical-security-issue # Срочный фикс в продакшн
chore/update-dependencies      # Обслуживание
docs/add-api-documentation     # Документация
refactor/extract-auth-service  # Рефакторинг
release/v2.1.0                 # Релизная ветка
```
