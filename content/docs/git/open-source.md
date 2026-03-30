---
title: Работа с Open Source: fork, upstream, pull request
description: Как внести вклад в Open Source проекты: fork репозитория, настройка upstream, синхронизация, создание pull request и процесс ревью.
section: git
difficulty: intermediate
readTime: 11
order: 9
tags: [git, open source, fork, upstream, pull request, GitHub, contribution]
---

## Зачем вносить вклад в Open Source

Open Source — это не только «бесплатный софт». Вклад в открытые проекты:
- Прокачивает навыки на реальных кодовых базах
- Расширяет портфолио (GitHub-профиль = резюме для разработчика)
- Учит работать с код-ревью и стандартами крупных проектов
- Помогает建立起 professional нетворк

Не обязательно писать фичи — документация, баг-репорты, переводы и ответы на issues тоже считаются.

## Полный цикл вклада

```
1. Fork → создать копию репозитория в своём аккаунте
2. Clone → скачать свою копию локально
3. Branch → создать ветку для изменений
4. Code → внести изменения
5. Push → отправить в свой fork
6. Pull Request → предложить изменения в оригинальный репозиторий
7. Review → исправить замечания
8. Merge → изменения приняты
```

## Fork — создание копии репозитория

Fork — личная копия чужого репозитория на GitHub. Вы можете менять её как угодно, не влияя на оригинал.

### Создание форка

1. Откройте репозиторий на GitHub (например, `https://github.com/facebook/react`)
2. Нажмите кнопку **Fork** в правом верхнем углу
3. Выберите свой аккаунт — GitHub создаст `https://github.com/your-username/react`

### Клонирование

```bash
# Клонируем СВОЙ форк
git clone https://github.com/your-username/react.git
cd react
```

### Настройка upstream

Upstream — ссылка на оригинальный репозиторий. Нужна, чтобы получать обновления:

```bash
# Добавить оригинальный репозиторий как upstream
git remote add upstream https://github.com/facebook/react.git

# Проверить remotes
git remote -v
# origin    https://github.com/your-username/react.git (fetch)
# origin    https://github.com/your-username/react.git (push)
# upstream  https://github.com/facebook/react.git (fetch)
# upstream  https://github.com/facebook/react.git (push)
```

| Remote | Что это | Куда push |
|---|---|---|
| `origin` | Ваш форк | У вас есть права |
| `upstream` | Оригинальный репозиторий | Нет прав на push |

## Синхронизация с оригиналом

Оригинальный репозиторий меняется — нужно регулярно подтягивать изменения:

```bash
# Получить изменения из upstream
git fetch upstream

# Переключиться на main и слить
git checkout main
git merge upstream/main

# Или через rebase (чище история)
git rebase upstream/main

# Отправить обновление в свой форк
git push origin main
```

### Через GitHub UI

На странице вашего форка есть кнопка **Sync fork** — один клик, и форк обновится. Но командная строка гибче.

## Создание Pull Request

### Шаг 1: Ветка для изменений

```bash
# Создать ветку от актуального main
git checkout main
git fetch upstream
git merge upstream/main
git checkout -b fix/useEffect-cleanup
```

Название ветки должно отражать суть: `fix/...`, `feat/...`, `docs/...`.

### Шаг 2: Внесение изменений

```bash
# Редактируете файлы...
vim packages/react/src/ReactHooks.js

# Проверяете, что всё работает
npm run lint
npm run test

# Коммитите
git add packages/react/src/ReactHooks.js
git commit -m "fix: cleanup useEffect on unmount"
```

### Шаг 3: Push в форк

```bash
# Отправить ветку в свой форк
git push -u origin fix/useEffect-cleanup
```

### Шаг 4: Создание PR на GitHub

1. Откройте ваш форк на GitHub
2. GitHub покажет жёлтую плашку «fix/useEffect-cleanup had recent pushes»
3. Нажмите **Compare & pull request**
4. Убедитесь, что базовый репозиторий — оригинальный (facebook/react), а не ваш форк
5. Заполните описание PR

### Шаблон PR

```markdown
## Описание
Исправлен баг, при котором cleanup-функция useEffect не вызывалась при размонтировании.

## Связанная issue
Fixes #12345

## Тип изменений
- [x] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Как проверить
1. Рендерить компонент с useEffect, возвращающим cleanup
2. Размонтировать компонент
3. Убедиться, что cleanup вызван

## Чеклист
- [x] Код следует стилю проекта
- [x] Добавлены тесты
- [x] Документация обновлена
```

## Процесс ревью

### Типичный сценарий

```
1. Вы создали PR
2. CI запускается (тесты, линт, сборка)
3. Мейнтейнер просматривает PR
4. Оставляет замечания или просит изменения
5. Вы исправляете и пушите
6. Мейнтейнер аппрувит
7. PR мёржится
```

### Если просят изменения

```bash
# Добавить новый коммит с исправлением
git add .
git commit -m "fix: address review feedback — add edge case test"
git push

# Или исправить предыдущий коммит (если проект допускает)
git add .
git commit --amend
git push --force-with-lease
```

### Если конфликт с main

```bash
# Получить свежий main из оригинала
git fetch upstream
git rebase upstream/main

# Разрешить конфликты, если есть
git add .
git rebase --continue

# Обновить PR (force push нужен после rebase)
git push --force-with-lease
```

## Правила хорошего контрибьютора

### До написания кода

1. **Прочитайте CONTRIBUTING.md** — в большинстве проектов есть файл с правилами
2. **Проверьте issues** — возможно, нужный issue уже открыт или закрыт
3. **Спросите** — откройте issue с вопросом «Можно я возьму задачу X?» перед тем как писать код
4. **Изучите стиль проекта** — какие паттерны используются, как называются файлы

### При написании кода

- Следуйте стилю проекта (линтер, форматтер)
- Пишите тесты для новых функций
- Не добавляйте лишнего — один PR, одна задача
- Обновите документацию, если меняете API

### Коммиты

```bash
# ✅ Понятное сообщение
git commit -m "fix: resolve memory leak in event listener cleanup"

# ❌ Неинформативное
git commit -m "fix"
git commit -m "changes"
git commit -m "wip"
```

Многие проекты используют Conventional Commits — узнайте заранее.

## Полезные команды для Open Source

### Переключиться на PR другого человека

```bash
# Скачать PR #42 локально для проверки
git fetch upstream pull/42/head:pr-42
git checkout pr-42
```

### Создать patch

```bash
# Создать патч-файл из коммита
git format-patch -1 abc1234

# Применить патч
git am < 0001-fix-useEffect-cleanup.patch
```

### Cherry-pick из чужого PR

```bash
# Если мейнтейнер просит применить конкретный коммит
git fetch upstream pull/42/head
git cherry-pick FETCH_HEAD
```

### Hard reset к upstream

```bash
# Если ваш форк сильно отстал или запутался
git fetch upstream
git checkout main
git reset --hard upstream/main
git push origin main --force
```

## Где искать проекты для вклада

### Новичкам

- [goodfirstissues.com](https://goodfirstissues.com) — задачи с меткой `good first issue`
- [firsttimersonly.com](https://www.firsttimersonly.com) — первые шаги в OSS
- [github.com/topics/good-first-issue](https://github.com/topics/good-first-issue)
- Документация проектов — почти всегда нуждается в улучшении

### В экосистеме фронтенда

- **Vue**: github.com/vuejs — ядро, router, pinia
- **React**: github.com/facebook/react
- **Angular**: github.com/angular/angular
- **Nuxt**: github.com/nuxt/nuxt
- **Vite**: github.com/vitejs/vite
- **ESLint плагины**: github.com/eslint — создание правил

### Маленькие проекты

Необязательно контрибьютить в крупные фреймворки. Библиотеки на 1000 звёзд часто приветливее к новичкам и быстрее мёржат PR.

## Итог

| Шаг | Команда |
|---|---|
| Fork | Кнопка на GitHub |
| Clone | `git clone <your-fork-url>` |
| Add upstream | `git remote add upstream <original-url>` |
| Sync | `git fetch upstream && git merge upstream/main` |
| Create branch | `git checkout -b fix/bug-name` |
| Push | `git push -u origin fix/bug-name` |
| Create PR | Кнопка на GitHub |
| Resolve conflicts | `git rebase upstream/main` |
| Update PR | `git push --force-with-lease` |

Open Source — один из лучших способов расти как разработчик. Первый PR — самый страшный. После пятого — становится рутиной. Начните с маленького: исправьте опечатку в документации, добавьте пример в README, ответьте на вопрос в issues.
