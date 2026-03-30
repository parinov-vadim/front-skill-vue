---
title: "Терминал: основные команды Unix, Zsh, Oh My Zsh"
description: "Работа с терминалом для фронтенд-разработчика: навигация, файловые команды,_pipe, перенаправления, Zsh, Oh My Zsh и настройка productive окружения."
section: tools
difficulty: beginner
readTime: 14
order: 10
tags: [terminal, unix, zsh, oh-my-zsh, cli, bash]
---

## Зачем фронтендеру терминал

Терминал (командная строка) — основной инструмент для:
- Запуска dev-серверов (`npm run dev`, `vite`)
- Работы с Git (`git commit`, `git push`)
- Установки пакетов (`pnpm install`)
- Сборки и деплоя (`npm run build`)
- Работы с Docker, SSH, CI/CD

В macOS используется Terminal.app или iTerm2. В Windows — PowerShell или Git Bash (рекомендуется WSL2 с Ubuntu).

## Навигация по файловой системе

### Где я и что вокруг

```bash
pwd                                    # Print Working Directory — где я сейчас
ls                                     # Список файлов в текущей директории
ls -la                                 # Подробный список (права, размер, дата)
ls -la src/                            # Содержимое папки src/
```

Опции `ls -la`:
- `-l` — длинный формат (права, владелец, размер, дата)
- `-a` — показать скрытые файлы (начинаются с точки)

### Перемещение

```bash
cd Desktop                             # Перейти в папку Desktop
cd src/components                      # Перейти по пути
cd ..                                  # На уровень вверх
cd ../..                               # На два уровня вверх
cd ~                                   # Домашняя директория (/Users/username)
cd -                                   # Вернуться в предыдущую директорию
```

### Создание и удаление

```bash
mkdir my-project                       # Создать папку
mkdir -p src/components/Header         # Создать с промежуточными папками (-p)
touch index.html                       # Создать пустой файл
rm file.txt                            # Удалить файл
rm -r folder/                          # Удалить папку рекурсивно
rm -rf node_modules/                   # Удалить принудительно (без подтверждения)
cp file.txt backup.txt                 # Копировать файл
cp -r src/ src-backup/                 # Копировать папку
mv old-name.txt new-name.txt           # Переименовать / переместить
```

### Просмотр файлов

```bash
cat package.json                       # Показать содержимое файла
head -n 20 file.log                    # Первые 20 строк
tail -n 20 file.log                    # Последние 20 строк
tail -f server.log                     # Следить за изменениями (live)
wc -l src/**/*.ts                      # Подсчитать строки в файлах
```

## Поиск

### find

```bash
find . -name "*.vue"                   # Найти все .vue файлы
find . -name "*.test.ts"               # Найти все тестовые файлы
find . -type d -name "node_modules"    # Найти все папки node_modules
find . -size +10M                      # Файлы больше 10MB
```

### grep (и rg — ripgrep)

```bash
grep "TODO" src/**/*.ts                # Найти строку в файлах
grep -r "console.log" src/             # Рекурсивный поиск
grep -i "error" log.txt                # Без учёта регистра
```

**ripgrep** (`rg`) — быстрее grep:

```bash
rg "useState" --type ts               # Поиск в TS-файлах
rg "defineProps" -l                    # Только имена файлов
rg -c "import" src/                    # Количество совпадений в каждом файле
```

## Pipes и перенаправления

### Pipe (`|`)

Pipe передаёт вывод одной команды как ввод другой:

```bash
cat package.json | grep "vue"          # Найти vue в package.json
ls -la | wc -l                         # Посчитать количество файлов
history | grep "git"                   # Найти git-команды в истории
ps aux | grep "node"                   # Найти запущенные Node-процессы
lsof -i :3000                          # Кто занял порт 3000
```

### Перенаправления

```bash
echo "hello" > file.txt                # Записать в файл (перезаписать)
echo "world" >> file.txt               # Добавить в конец файла
npm run build 2>errors.log             # stderr → файл
npm run build > output.log 2>&1        # stdout + stderr → файл
command < input.txt                    # Читать из файла
```

## Процессы

```bash
ps aux                                 # Все запущенные процессы
ps aux | grep "node"                   # Найти Node-процессы
kill <PID>                             # Завершить процесс
kill -9 <PID>                          # Принудительно завершить
```

Если dev-сервер не останавливается:

```bash
lsof -i :3000                          # Кто занял порт 3000
kill -9 $(lsof -t -i:3000)             # Убить процесс на порту 3000
```

## Права доступа

```bash
chmod +x script.sh                     # Сделать файл исполняемым
chmod 755 script.sh                    # rwxr-xr-x
chmod 644 file.txt                     # rw-r--r--
```

Формат: `[владелец][группа][остальные]`
- `r` = 4 (read), `w` = 2 (write), `x` = 1 (execute)
- `755` = 4+2+1, 4+1, 4+1 = rwx, rx, rx

## SSH

```bash
ssh user@server.com                    # Подключиться к серверу
ssh-keygen -t ed25519                  # Сгенерировать SSH-ключ
ssh-copy-id user@server.com            # Скопировать публичный ключ на сервер
scp file.txt user@server:/path/        # Копировать файл на сервер
```

GitHub SSH:
```bash
ssh-keygen -t ed25519 -C "your@email.com"
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub              # Скопировать и добавить в GitHub Settings → SSH Keys
ssh -T git@github.com                  # Проверить подключение
```

## Zsh

Zsh (Z shell) — улучшенная версия Bash, стандартный шелл в macOS с 2019 года.

### Почему Zsh, а не Bash

- Умная автодополнение (tab completion)
- Глоббинг (`**/*.vue` без `find`)
- Спелл-коррекция («did you mean...?»)
- Богатая кастомизация
- Oh My Zsh

### Проверка и переключение

```bash
echo $SHELL                            # Какой шелл используется
zsh --version                          # Версия Zsh
chsh -s $(which zsh)                   # Сделать Zsh шеллом по умолчанию
```

### Конфигурационный файл

`~/.zshrc` — главный файл настроек (аналог `~/.bashrc`).

Полезные алиасы для фронтендера:

```bash
# Навигация
alias ..="cd .."
alias ...="cd ../.."
alias projects="cd ~/Projects"

# Git
alias gs="git status"
alias gp="git push"
alias gl="git log --oneline -10"
alias gd="git diff"
alias gaa="git add ."
alias gc="git commit -m"

# Node/npm
alias ni="npm install"
alias nid="npm install -D"
alias nr="npm run"
alias ns="npm run dev"
alias nb="npm run build"

# pnpm
alias pi="pnpm install"
alias pa="pnpm add"
alias pad="pnpm add -D"
alias pd="pnpm dev"
alias pb="pnpm build"

# Docker
alias dc="docker compose"
alias dcu="docker compose up -d"
alias dcd="docker compose down"
alias dcl="docker compose logs -f"

# Полезные
alias ports="lsof -i -P -n | grep LISTEN"
alias killport="kill -9 $(lsof -t -i:"
```

## Oh My Zsh

Oh My Zsh — фреймворк для управления конфигурацией Zsh. Добавляет темы, плагины и автодополнение.

### Установка

```bash
sh -c "$(curl -fsSL https://raw.github.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

### Темы

Тема задаётся в `~/.zshrc`:

```bash
ZSH_THEME="robbyrussell"               # Дефолтная тема
```

Популярные темы:
- **robbyrussell** — простая, показывает git-ветку
- **agnoster** —_powerline-стиль, нужен Powerline-шрифт
- **powerlevel10k** — самая быстрая и красивая тема

Установка Powerlevel10k:

```bash
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git \
  ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k
```

```bash
# ~/.zshrc
ZSH_THEME="powerlevel10k/powerlevel10k"
```

При первом запуске запустится мастер настройки — выберите стиль.

### Плагины

Плагины подключаются в `~/.zshrc`:

```bash
plugins=(git z npm node zsh-autosuggestions zsh-syntax-highlighting zsh-completions)
```

Встроенные (Oh My Zsh):

| Плагин | Описание |
|---|---|
| `git` | Алиасы для git (gst, gp, gl, gco...) |
| `npm` | Автодополнение npm-команд |
| `node` | Алиасы для Node.js |
| `z` | Прыжок по часто используемым директориям |
| `sudo` | Двойной ESC добавляет sudo |
| `history` | Алиасы для работы с историей |
| `colored-man-pages` | Цветные man-страницы |

Сторонние:

**zsh-autosuggestions** — предлагает команды из истории при вводе (серым текстом, принять → →):

```bash
git clone https://github.com/zsh-users/zsh-autosuggestions \
  ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions
```

**zsh-syntax-highlighting** — подсветка команд (зелёная = существует, красная = ошибка):

```bash
git clone https://github.com/zsh-users/zsh-syntax-highlighting \
  ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

**zsh-completions** — дополнительные автодополнения:

```bash
git clone https://github.com/zsh-users/zsh-completions \
  ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-completions
```

### z — умная навигация

Плагин `z` запоминает, в какие директории вы заходите. Потом:

```bash
z my-app          # Перейти в ~/Projects/my-app (не нужен полный путь)
z api             # Перейти в ~/Projects/my-app/api
z front           # Перейти в ~/Projects/frontend-skill-vue
```

## Полезные утилиты

### curl и jq

```bash
curl -s https://api.github.com/users/octocat | jq '.login'      # "octocat"
curl -s https://api.example.com/users | jq '.[].email'           # Все email
```

### httpie (альтернатива curl)

```bash
brew install httpie
https://api.example.com/users
https POST api.example.com/users name=Иван email=ivan@test.com
```

### fzf — нечёткий поиск

```bash
brew install fzf
$(brew --prefix)/opt/fzf/install
```

`Ctrl+R` — поиск по истории команд
`Ctrl+T` — поиск файлов

### tree

```bash
tree -L 2 -I 'node_modules|dist|.git'   # Дерево проекта (2 уровня, без лишних папок)
```

### tmux

tmux — мультиплексор терминала. Несколько панелей и окон в одном терминале:

```bash
brew install tmux
tmux                                   # Новая сессия
tmux ls                                # Список сессий
tmux attach -t 0                       # Подключиться к сессии
```

## Быстрые клавиши в терминале

| Комбинация | Действие |
|---|---|
| `Ctrl+C` | Прервать текущую команду |
| `Ctrl+Z` | Поставить на паузу (bg — продолжить в фоне) |
| `Ctrl+D` | Выход (EOF) |
| `Ctrl+L` | Очистить экран (как `clear`) |
| `Ctrl+A` | В начало строки |
| `Ctrl+E` | В конец строки |
| `Ctrl+W` | Удалить слово назад |
| `Ctrl+U` | Удалить всё до курсора |
| `Ctrl+K` | Удалить всё после курсора |
| `Ctrl+R` | Поиск по истории |
| `Alt+.` | Вставить последний аргумент предыдущей команды |
| `!!` | Повторить последнюю команду (`sudo !!`) |

## Скрипты

### Простой bash-скрипт

```bash
#!/bin/bash
# deploy.sh — деплой фронтенд-приложения

set -e                                 # Прервать при ошибке

echo "Building..."
pnpm build

echo "Deploying to server..."
scp -r dist/* user@server:/var/www/html/

echo "Done!"
```

```bash
chmod +x deploy.sh
./deploy.sh
```

### package.json scripts вместо скриптов

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "pnpm build && scp -r dist/* user@server:/var/www/html/",
    "clean": "rm -rf dist node_modules/.cache",
    "kill-port": "kill -9 $(lsof -t -i:3000)"
  }
}
```

## Итог

- Терминал — обязательный навык для фронтендера
- Освоите: навигация (`cd`, `ls`), файлы (`mkdir`, `rm`, `cp`, `mv`), поиск (`grep`, `find`)
- **Zsh + Oh My Zsh** — стандарт для продуктивной работы
- Плагины `zsh-autosuggestions` и `zsh-syntax-highlighting` экономят время
- `z` — прыжок по директориям без полных путей
- Алиасы в `~/.zshrc` ускоряют рутинные команды
- `Ctrl+R` для поиска по истории — используйте постоянно
