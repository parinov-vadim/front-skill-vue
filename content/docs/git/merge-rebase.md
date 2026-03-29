---
title: Merge vs Rebase
description: Merge и Rebase — два способа интеграции изменений из одной ветки в другую. У каждого свои преимущества и случаи применения.
section: git
difficulty: intermediate
readTime: 9
order: 3
tags: [git, merge, rebase, history]
---

## Merge

`git merge` создаёт **merge commit**, объединяющий две истории:

```
До:
  main:    A ─── B ─── C
                  \
  feature:         D ─── E

После git merge feature (из main):
  main:    A ─── B ─── C ─── M
                  \         /
  feature:         D ─── E
```

```bash
git checkout main
git merge feature/auth
```

**Плюсы:**
- Сохраняет точную историю — видно, когда и что было слито
- Безопасен — не переписывает историю
- Простое разрешение конфликтов (один раз)

**Минусы:**
- История засоряется merge commit-ами при активном ветвлении

## Rebase

`git rebase` **переписывает историю**, перенося коммиты ветки на вершину другой:

```
До:
  main:    A ─── B ─── C
                  \
  feature:         D ─── E

После git rebase main (из feature):
  main:    A ─── B ─── C
                         \
  feature:                D' ─── E'
  (D и E переписаны как D' и E')
```

```bash
git checkout feature/auth
git rebase main
```

**Плюсы:**
- Линейная, чистая история
- Проще читать `git log`
- Нет лишних merge commit-ов

**Минусы:**
- **Переписывает историю** — опасно для опубликованных веток
- Конфликты нужно решать для каждого коммита отдельно

## Золотое правило Rebase

> **Никогда не делайте rebase публичных веток** (которые уже запушены и используются другими)

```bash
# ✅ Безопасно — rebase своей локальной ветки на main
git checkout feature/my-feature
git rebase main

# ❌ Опасно — rebase ветки, которую использует команда
git checkout main
git rebase feature/shared-branch  # Никогда!
```

## Interactive Rebase — переписывание истории

```bash
git rebase -i HEAD~3  # Редактировать последние 3 коммита
git rebase -i main    # Редактировать все коммиты начиная с main
```

Открывается редактор:

```
pick abc1234 feat: add login form
pick def5678 fix: typo in form
pick ghi9012 refactor: extract validation

# Команды:
# pick   - оставить коммит как есть
# reword - изменить сообщение коммита
# edit   - остановиться для внесения изменений
# squash - объединить с предыдущим коммитом (сохранить оба сообщения)
# fixup  - объединить с предыдущим (выбросить сообщение)
# drop   - удалить коммит
```

### Сжатие (squash) нескольких коммитов

```
pick abc1234 feat: add login feature
squash def5678 wip: save progress
squash ghi9012 fix: forgot edge case
```

Результат — один чистый коммит вместо трёх WIP-коммитов.

## Реальный рабочий процесс

### Сценарий 1: Feature branch workflow

```bash
# 1. Создать ветку от актуального main
git checkout main && git pull
git checkout -b feature/user-profile

# 2. Разработка...
git commit -m "feat: add profile page"
git commit -m "wip: save"
git commit -m "feat: add avatar upload"

# 3. Перед PR — привести историю в порядок
git rebase -i main  # Squash WIP-коммиты

# 4. Обновить на актуальный main
git rebase main

# 5. Push и PR
git push -u origin feature/user-profile
```

### Сценарий 2: Конфликт при rebase

```bash
git rebase main

# Возникает конфликт...
# Редактируем файл, разрешаем конфликт

git add resolved-file.ts
git rebase --continue   # Продолжить

# Если что-то пошло не так:
git rebase --abort      # Вернуться к состоянию до rebase
```

## Merge vs Rebase: когда что использовать

| Ситуация | Рекомендация |
|----------|-------------|
| Интеграция feature ветки в main | `merge --no-ff` |
| Обновление feature от main | `rebase` |
| Публичная ветка (уже запушена) | `merge` |
| Локальная ветка (только у вас) | `rebase` |
| Нужна чистая линейная история | `rebase` |
| Нужно видеть точки слияния | `merge` |
