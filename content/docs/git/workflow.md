---
title: Git Flow и рабочие процессы
description: Git Flow, GitHub Flow и Trunk-based development — популярные модели ветвления для командной работы. Выбор зависит от размера команды и частоты деплоя.
section: git
difficulty: intermediate
readTime: 8
order: 4
tags: [git, workflow, git flow, github flow, branching model]
---

## GitHub Flow

Простая модель, подходит для большинства команд:

```
main  ─────────────────────────────── (всегда деплоится)
          \           /  \       /
    feature/A ─────       feature/B ─
                ↑               ↑
               PR + review      PR + review
```

**Принципы:**
1. `main` всегда готова к деплою
2. Разработка идёт в feature-ветках
3. PR → Code review → Merge в main
4. Деплой после каждого мержа

```bash
# Типичный цикл
git checkout -b feature/user-search
# ... разработка ...
git push -u origin feature/user-search
# Открыть PR на GitHub/GitLab
# После аппрува — merge в main
```

## Git Flow

Строгая модель для больших проектов с релизным циклом:

```
main    ──●──────────────────────●──
          ↑                     ↑
         v1.0                  v1.1
          |                     |
develop  ─●──●──●──●──●──●──●──●──
              \     /   \     /
           feat/A      feat/B
               release/1.1
               hotfix/critical-bug
```

### Основные ветки

| Ветка | Описание |
|-------|----------|
| `main` | Стабильные релизы с тегами версий |
| `develop` | Ветка разработки, отражает следующий релиз |

### Вспомогательные ветки

| Ветка | От | В | Описание |
|-------|----|---|----------|
| `feature/*` | develop | develop | Новая функциональность |
| `release/*` | develop | main + develop | Подготовка релиза |
| `hotfix/*` | main | main + develop | Срочный фикс в продакшн |

```bash
# Новая функция
git checkout -b feature/payment develop
# ... разработка ...
git checkout develop
git merge --no-ff feature/payment
git branch -d feature/payment

# Подготовка релиза
git checkout -b release/1.2 develop
# Только баг-фиксы в этой ветке
git checkout main && git merge --no-ff release/1.2
git tag -a v1.2 -m "Version 1.2"
git checkout develop && git merge --no-ff release/1.2

# Срочный фикс
git checkout -b hotfix/fix-payment main
# ... фикс ...
git checkout main && git merge --no-ff hotfix/fix-payment
git tag -a v1.1.1
git checkout develop && git merge --no-ff hotfix/fix-payment
```

## Trunk-Based Development

Все разработчики коммитят прямо в `main` (trunk) несколько раз в день:

```
main ──●──●──●──●──●──●──●──●──
         \       /
     short-lived (< 1 день)
```

**Для этого нужны:**
- Feature flags (переключение функций без деплоя)
- Мощный CI/CD с быстрыми тестами
- Высокая культура ревью

## Commit Convention

Структурированные сообщения коммитов упрощают генерацию changelog:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Типы (Conventional Commits)

```
feat:     Новая функциональность
fix:      Исправление бага
docs:     Документация
style:    Форматирование (не влияет на логику)
refactor: Рефакторинг без новых функций/фиксов
test:     Добавление/исправление тестов
chore:    Обновление зависимостей, настройки
perf:     Улучшение производительности
ci:       Изменения CI/CD
```

```bash
# Примеры хороших сообщений
git commit -m "feat(auth): add Google OAuth login"
git commit -m "fix(editor): prevent code loss on tab switch"
git commit -m "refactor(tasks): extract TaskCard component"
git commit -m "chore: update @nuxt/ui to v4.5.0"

# Ломающее изменение
git commit -m "feat!: remove deprecated API endpoints

BREAKING CHANGE: /api/v1/* endpoints removed, use /api/v2/*"
```

## Теги и релизы

```bash
# Лёгкий тег (просто метка)
git tag v1.0.0

# Аннотированный тег (с сообщением и автором)
git tag -a v1.0.0 -m "Release version 1.0.0"

# Просмотр тегов
git tag
git tag -l "v1.*"

# Отправить тег на remote
git push origin v1.0.0
git push origin --tags  # Все теги
```

## Полезные алиасы

```bash
# ~/.gitconfig
[alias]
  st = status
  co = checkout
  br = branch
  lg = log --oneline --graph --all --decorate
  undo = reset HEAD~1
  save = stash push -m
  aliases = config --get-regexp alias
```

```bash
git lg  # Граф всей истории в одну строку
```
