---
title: Основные команды Git
description: Git — система контроля версий. Здесь собраны самые необходимые команды для ежедневной работы с репозиторием.
section: git
difficulty: beginner
readTime: 8
order: 1
tags: [git, commands, version control, basics]
---

## Настройка

```bash
# Установить имя и email (один раз глобально)
git config --global user.name "Иван Иванов"
git config --global user.email "ivan@example.com"

# Просмотр настроек
git config --list
```

## Инициализация и клонирование

```bash
# Создать новый репозиторий в текущей папке
git init

# Клонировать существующий репозиторий
git clone https://github.com/user/repo.git

# Клонировать в папку с другим именем
git clone https://github.com/user/repo.git my-project
```

## Рабочий процесс

### Три состояния файла

```
Untracked / Modified
       ↓  git add
     Staged (Index)
       ↓  git commit
    Committed (HEAD)
```

### Просмотр статуса

```bash
git status               # Статус рабочей директории
git status -s            # Краткий вывод
git diff                 # Что изменилось (не staged)
git diff --staged        # Что изменилось (staged)
```

### Добавление файлов

```bash
git add file.txt         # Добавить конкретный файл
git add .                # Добавить все изменения в текущей папке
git add -p               # Интерактивный выбор изменений (hunks)
```

### Коммит

```bash
git commit -m "feat: add user authentication"
git commit               # Откроет редактор для сообщения
git commit -am "msg"     # add + commit для отслеживаемых файлов
```

## Просмотр истории

```bash
git log                  # Полная история
git log --oneline        # Краткая (хэш + сообщение)
git log --oneline --graph --all  # Граф всех веток
git log -n 5             # Последние 5 коммитов
git log --author="Иван"  # Фильтр по автору
git log --since="2024-01-01"

# Просмотр конкретного коммита
git show abc1234
```

## Ветки

```bash
git branch               # Список веток
git branch feature/auth  # Создать ветку
git checkout feature/auth # Переключиться
git checkout -b feature/auth # Создать и переключиться
git switch -c feature/auth   # То же (современный синтаксис)

git branch -d feature/auth   # Удалить ветку (только если слита)
git branch -D feature/auth   # Принудительно удалить
```

## Слияние и перебазирование

```bash
# Слить ветку в текущую
git merge feature/auth

# Перебазировать текущую ветку на main
git rebase main
```

## Удалённые репозитории

```bash
git remote -v                     # Список remote
git remote add origin <url>       # Добавить remote
git fetch origin                  # Получить изменения (не сливая)
git pull                          # fetch + merge
git pull --rebase                 # fetch + rebase
git push origin feature/auth      # Отправить ветку
git push -u origin feature/auth   # Отправить и установить upstream
```

## Отмена изменений

```bash
# Отменить изменения в рабочей директории (до git add)
git restore file.txt      # Современный синтаксис
git checkout -- file.txt  # Старый синтаксис

# Убрать файл из staged (не удаляя изменения)
git restore --staged file.txt
git reset HEAD file.txt

# Отменить последний коммит, оставив изменения staged
git reset --soft HEAD~1

# Отменить последний коммит, оставив изменения unstaged
git reset HEAD~1

# Отменить последний коммит, потеряв изменения (!осторожно!)
git reset --hard HEAD~1

# Создать новый коммит, отменяющий указанный (безопасно для published)
git revert abc1234
```

## Stash — временное сохранение

```bash
git stash              # Сохранить все изменения
git stash push -m "WIP: форма авторизации"
git stash list         # Список сохранённых
git stash pop          # Восстановить последнее
git stash apply stash@{1} # Восстановить конкретное
git stash drop         # Удалить последнее
git stash clear        # Удалить все
```

## .gitignore

```bash
# .gitignore
node_modules/
.env
.env.local
dist/
build/
*.log
.DS_Store
.vscode/settings.json

# Добавить в gitignore уже отслеживаемый файл:
git rm --cached .env
echo ".env" >> .gitignore
git commit -m "chore: remove .env from tracking"
```
