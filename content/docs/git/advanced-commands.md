---
title: Продвинутые команды Git
description: git bisect для поиска сломанного коммита, git blame для определения автора строки, git cherry-pick для переноса отдельных коммитов, git stash, git reflog и другие полезные команды.
section: git
difficulty: advanced
readTime: 11
order: 7
tags: [git, bisect, blame, cherry-pick, stash, reflog, advanced]
---

## git bisect — поиск сломанного коммита

Баг появился, но непонятно когда и из-за какого коммита. `git bisect` находит его бинарным поиском: вы отмечаете «хороший» и «плохой» коммит, а Git делит историю пополам, пока не найдёт виновника.

### Интерактивный bisect

```bash
# Начать поиск
git bisect start

# Указать текущий (плохой) коммит
git bisect bad

# Указать коммит, где всё работало
git bisect good v2.3.0
# или по хешу
git bisect good abc1234
```

Git переключится на середину между хорошим и плохим коммитом:

```
Bisecting: 50 revisions left to test after this (roughly 6 steps)
[def5678] some commit message
```

Вы проверяете — баг есть или нет:

```bash
# Баг всё ещё есть — помечаем как плохой
git bisect bad

# Бага нет — помечаем как хороший
git bisect good
```

Git сужает диапазон и переключается на следующий коммит. Через несколько шагов:

```
def5678 is the first bad commit
```

### Автоматический bisect

Можно автоматизировать проверку — Git сам запустит скрипт и найдёт виновника:

```bash
# Скрипт возвращает 0 — хорошо, 1-124 — плохо, 125 — пропустить
git bisect start HEAD v2.3.0
git bisect run npm test
```

```bash
# Скрипт проверки: запускает тест и проверяет результат
git bisect run sh -c 'npm run test:specific || exit 1'
```

```bash
# Скрипт: проверяет, что сборка успешна
git bisect run sh -c 'npm run build && exit 0 || exit 1'
```

### Завершение bisect

```bash
# После завершения — вернуться к исходному состоянию
git bisect reset
```

Важно: `bisect`.detached HEAD — вы находитесь не на ветке. После `reset` вернётесь обратно.

## git blame — кто написал эту строку

`git blame` показывает, кто и когда изменил каждую строку файла:

```bash
# Полная информация по файлу
git blame src/app/auth.service.ts
```

Вывод:

```
a1b2c3d4 (Иван Иванов  2024-03-15 10:30:22  1) import { Injectable } from '@angular/core'
e5f6g7h8 (Анна Петрова  2024-03-16 14:20:05  2) import { HttpClient } from '@angular/common/http'
a1b2c3d4 (Иван Иванов  2024-03-15 10:30:22  3)
a1b2c3d4 (Иван Иванов  2024-03-15 10:30:22  4) @Injectable({ providedIn: 'root' })
```

### Полезные флаги

```bash
# Только определённые строки
git blame -L 10,30 src/app/auth.service.ts

# Диапазон от строки 10 до конца
git blame -L 10, src/app/auth.service.ts

# По регулярному выражению (от функции до конца)
git blame -L :login src/app/auth.service.ts

# Показать email вместо имени
git blame -e src/app/auth.service.ts

# Игнорировать переносы строк (показать последний значимый коммит)
git blame -w src/app/auth.service.ts
```

### blame конкретного коммита

```bash
# Как выглядел blame в конкретном коммите
git blame abc1234 -- src/app/auth.service.ts
```

### В IDE

VS Code: выделите строки → правый клик → «Open Blame» или установите расширение GitLens — оно показывает автора каждой строки прямо в редакторе.

## git cherry-pick — перенос отдельных коммитов

`cherry-pick` переносит конкретный коммит из одной ветки в другую, не сливая всю ветку:

```
main:     A---B---C---D
                   \
feature:            E---F---G
```

Нужен только коммит `F` в main:

```bash
git checkout main
git cherry-pick f1a2b3c   # Хеш коммита F
```

```
main:     A---B---C---D---F'
```

`F'` — копия коммита `F` с новым хешем.

### Типичные сценарии

```bash
# Перенести hotfix из feature-ветки в main
git checkout main
git cherry-pick abc1234

# Перенести несколько коммитов
git cherry-pick abc1234 def5678 ghi9012

# Диапазон коммитов (включительно)
git cherry-pick abc1234^..def5678
```

### Разрешение конфликтов при cherry-pick

```bash
git cherry-pick abc1234
# CONFLICT в src/app/auth.service.ts

# Разрешить конфликт вручную
# Затем:
git add src/app/auth.service.ts
git cherry-pick --continue

# Или отменить cherry-pick
git cherry-pick --abort
```

## git stash — временное хранение изменений

Вы работаете над фичей, но срочно нужно переключиться на другую ветку. Коммитить незаконченную работу не хочется. `stash` сохраняет текущие изменения и прячет их:

```bash
# Сохранить все изменения (staged + unstaged)
git stash

# С сообщением
git stash push -m "WIP: авторизация через Google"

# Сохранить только определенные файлы
git stash push -m "частично" src/app/auth.service.ts

# Сохранить включая untracked файлы
git stash -u

# Сохранить всё, включая игнорируемые файлы
git stash -a
```

После `stash` рабочая директория чистая — можно переключаться на другую ветку.

### Восстановление

```bash
# Посмотреть список stash
git stash list
# stash@{0}: On feature/auth: WIP: авторизация через Google
# stash@{1}: On main: экспериментальный фикс

# Восстановить последний stash (и удалить из списка)
git stash pop

# Восстановить конкретный stash
git stash pop stash@{1}

# Восстановить, но оставить в списке
git stash apply stash@{0}
```

### Управление stash

```bash
# Посмотреть содержимое stash
git stash show -p stash@{0}

# Создать ветку из stash
git stash branch fix-from-stash stash@{0}

# Удалить конкретный stash
git stash drop stash@{1}

# Удалить все stash
git stash clear
```

## git reflog — история всех действий

`reflog` — лог всех перемещений HEAD. Даже если вы потеряли коммит после reset или rebase, reflog поможет его найти:

```bash
git reflog
```

```
a1b2c3d HEAD@{0}: checkout: moving from feature to main
e5f6g7h HEAD@{1}: commit: feat: add search
i8j9k0l HEAD@{2}: commit: fix: resolve null pointer
m1n2o3p HEAD@{3}: rebase: checkout main
q4r5s6t HEAD@{4}: reset: moving to HEAD~2
```

### Восстановление «потерянных» коммитов

```bash
# Вы случайно сделали git reset --hard HEAD~3
# Коммиты «пропали», но reflog помнит:

git reflog
# a1b2c3d HEAD@{0}: reset: moving to HEAD~3
# x7y8z9w HEAD@{1}: commit: important feature  ← это нужно!

# Вернуться к потерянному коммиту
git checkout x7y8z9w
# или создать ветку
git branch recovered x7y8z9w
```

```bash
# Удалить reflog (старые записи удаляются через 90 дней автоматически)
git reflog expire --expire=30.days.ago --all
```

## git clean — удаление неотслеживаемых файлов

```bash
# Посмотреть, какие файлы будут удалены (dry run)
git clean -n

# Удалить untracked файлы
git clean -f

# Удалить untracked файлы и папки
git clean -fd

# Удалить включая ignored файлы (node_modules, dist и т.д.)
git clean -fdx

# Ядерная очистка — полный возврат к чистому состоянию
git reset --hard
git clean -fdx
```

## Полезные комбинации

### Отменить последний коммит (сохранив изменения)

```bash
git reset --soft HEAD~1
```

Изменения вернутся в staging area. Коммит исчезнет из истории.

### Изменить последний коммит

```bash
# Добавить забытый файл
git add forgotten-file.ts
git commit --amend --no-edit

# Изменить сообщение
git commit --amend -m "fix: correct login redirect"
```

### Перенести коммит в другую ветку

```bash
# Коммит abc1234 был сделан не в той ветке
git checkout feature/correct-branch
git cherry-pick abc1234
git checkout main
git reset --hard HEAD~1  # Удалить из main
```

### Найти коммит, удаливший строку

```bash
# Найти коммит, где была удалена строка
git log -S "removeUserFromStore" --oneline

# Найти коммит, где была добавлена строка
git log -S "removeUserFromStore" --diff-filter=A --oneline
```

### Сравнить две ветки

```bash
# Список файлов, различающихся между ветками
git diff main..feature/auth --name-only

# Статистика изменений
git diff main..feature/auth --stat

# Конкретный файл
git diff main..feature/auth -- src/app/auth.service.ts
```

### Скопировать файл из другой ветки

```bash
# Получить файл из другой ветки без слияния
git checkout feature/auth -- src/app/auth.service.ts
```

## Итог

| Команда | Для чего |
|---|---|
| `git bisect` | Бинарный поиск сломанного коммита |
| `git blame` | Кто изменил строку |
| `git cherry-pick` | Перенести коммит в другую ветку |
| `git stash` | Временно сохранить незакоммиченные изменения |
| `git reflog` | История всех действий — восстановление «потерянных» коммитов |
| `git clean` | Удалить untracked/ignored файлы |
| `git reset --soft` | Отменить коммит, сохранив изменения |
| `git commit --amend` | Поправить последний коммит |
| `git log -S "text"` | Найти коммит по содержимому |

Эти команды не нужны каждый день, но когда ситуация требует — они экономят часы работы. `bisect` и `reflog` — настоящие спасители: первый находит баг в истории из сотен коммитов, второй восстанавливает то, что казалось потерянным навсегда.
