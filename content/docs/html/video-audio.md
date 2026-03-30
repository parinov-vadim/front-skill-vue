---
title: "Видео и аудио в HTML: video, audio, iframe, встраивание YouTube"
description: "Медиа-элементы HTML — video и audio с субтитрами, iframe для YouTube, адаптивные видеоплееры, атрибуты controls autoplay muted и форматы видео."
section: html
difficulty: beginner
readTime: 8
order: 6
tags: [видео, аудио, video, audio, iframe, YouTube, медиа, HTML, субтитры]
---

## Тег video

Встраивание видео без сторонних плееров:

```html
<video src="intro.mp4" controls width="640" height="360">
  Ваш браузер не поддерживает видео.
</video>
```

### Несколько форматов

Не все браузеры поддерживают один формат. Укажите несколько:

```html
<video controls width="640" height="360">
  <source src="intro.webm" type="video/webm">
  <source src="intro.mp4" type="video/mp4">
  <source src="intro.ogv" type="video/ogg">
  Ваш браузер не поддерживает видео.
</video>
```

Браузер берёт первый поддерживаемый. MP4 (H.264) — самый универсальный.

### Атрибуты

```html
<video
  src="intro.mp4"
  controls
  autoplay
  muted
  loop
  playsinline
  preload="metadata"
  poster="preview.jpg"
  width="640"
  height="360"
>
</video>
```

| Атрибут | Что делает |
|---------|-----------|
| `controls` | Показать панель управления (play, pause, громкость) |
| `autoplay` | Автозапуск. Работает только с `muted` в большинстве браузеров |
| `muted` | Без звука. Нужен для autoplay |
| `loop` | Зациклить воспроизведение |
| `playsinline` | На iOS — играть внутри страницы, не на полный экран |
| `preload="metadata"` | Загрузить только метаданные (длительность, размеры) |
| `preload="none"` | Не загружать ничего до нажатия play |
| `poster` | Картинка-превью до начала воспроизведения |

### Фоновое видео (hero)

```html
<video autoplay muted loop playsinline class="hero-video">
  <source src="hero-background.webm" type="video/webm">
  <source src="hero-background.mp4" type="video/mp4">
</video>
```

Четыре атрибута вместе — `autoplay muted loop playsinline` — стандартный паттерн для фонового видео. Без `muted` браузер заблокирует autoplay.

### Субтитры и дорожки

```html
<video controls>
  <source src="movie.mp4" type="video/mp4">
  <track kind="subtitles" src="subs-ru.vtt" srclang="ru" label="Русский">
  <track kind="subtitles" src="subs-en.vtt" srclang="en" label="English">
  <track kind="captions" src="captions-ru.vtt" srclang="ru" label="Русские субтитры">
</video>
```

Виды дорожек (`kind`):

| Значение | Описание |
|----------|----------|
| `subtitles` | Перевод диалогов |
| `captions` | Субтитры для глухих (звуки, музыка) |
| `descriptions` | Аудио-описание для слепых |
| `chapters` | Главы для навигации |
| `metadata` | Данные для скриптов |

Формат файла — WebVTT (`.vtt`):

```vtt
WEBVTT

00:00:01.000 --> 00:00:04.000
Привет, добро пожаловать на канал.

00:00:05.000 --> 00:00:08.000
Сегодня мы разберём HTML5 video.
```

### Управление через JavaScript

```js
const video = document.querySelector('video')

video.play()
video.pause()
video.currentTime = 30
video.volume = 0.5

video.addEventListener('timeupdate', () => {
  console.log(`Текущая позиция: ${video.currentTime}`)
})

video.addEventListener('ended', () => {
  console.log('Видео закончилось')
})

video.playbackRate = 1.5
video.requestFullscreen()
```

## Тег audio

Аналогично video, но без визуального отображения:

```html
<audio controls>
  <source src="podcast.mp3" type="audio/mpeg">
  <source src="podcast.ogg" type="audio/ogg">
  Ваш браузер не поддерживает аудио.
</audio>
```

### Атрибуты

```html
<audio src="music.mp3" controls loop preload="metadata"></audio>
```

Те же атрибуты что и у video: `controls`, `autoplay`, `muted`, `loop`, `preload`.

### Аудиоплеер с плейлистом

```html
<audio id="player" controls>
  <source src="track1.mp3" type="audio/mpeg">
</audio>

<ul id="playlist">
  <li data-src="track1.mp3" class="active">Трек 1 — Артист</li>
  <li data-src="track2.mp3">Трек 2 — Артист</li>
  <li data-src="track3.mp3">Трек 3 — Артист</li>
</ul>
```

```js
const player = document.getElementById('player')
const playlist = document.getElementById('playlist')

playlist.addEventListener('click', (e) => {
  const item = e.target.closest('li')
  if (!item) return

  player.src = item.dataset.src
  player.play()

  playlist.querySelector('.active')?.classList.remove('active')
  item.classList.add('active')
})

player.addEventListener('ended', () => {
  const current = playlist.querySelector('.active')
  const next = current.nextElementSibling
  if (next) {
    next.click()
  }
})
```

## iframe — встраивание внешнего контента

### YouTube

```html
<iframe
  src="https://www.youtube.com/embed/VIDEO_ID"
  title="Название видео"
  width="560"
  height="315"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
  loading="lazy"
></iframe>
```

Параметры YouTube через URL:

```
https://www.youtube.com/embed/VIDEO_ID?autoplay=1&mute=1&loop=1&rel=0
```

| Параметр | Что делает |
|----------|-----------|
| `autoplay=1` | Автозапуск (только с `mute=1`) |
| `mute=1` | Без звука |
| `loop=1` | Зациклить |
| `rel=0` | Не показывать похожие видео |
| `controls=0` | Скрыть элементы управления |
| `start=30` | Начать с 30-й секунды |

### Vimeo

```html
<iframe
  src="https://player.vimeo.com/video/VIDEO_ID"
  title="Название видео"
  width="640"
  height="360"
  frameborder="0"
  allow="autoplay; fullscreen; picture-in-picture"
  allowfullscreen
></iframe>
```

### Google Maps

```html
<iframe
  src="https://www.google.com/maps/embed?pb=..."
  width="600"
  height="450"
  style="border:0;"
  allowfullscreen
  loading="lazy"
  referrerpolicy="no-referrer-when-downgrade"
></iframe>
```

## Адаптивный видеоплеер

Видео и iframe с фиксированными размерами ломают мобильную вёрстку. Решение — обёртка с `aspect-ratio`:

```css
.video-wrapper {
  position: relative;
  width: 100%;
  max-width: 800px;
  aspect-ratio: 16 / 9;
}

.video-wrapper iframe,
.video-wrapper video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}
```

```html
<div class="video-wrapper">
  <iframe src="https://www.youtube.com/embed/VIDEO_ID" title="Видео" allowfullscreen></iframe>
</div>
```

## Безопасность iframe

### sandbox

Ограничьте возможности встраиваемой страницы:

```html
<iframe
  src="untrusted.html"
  sandbox="allow-scripts allow-same-origin"
></iframe>
```

Значения `sandbox`:

| Значение | Разрешает |
|----------|-----------|
| `allow-scripts` | JavaScript |
| `allow-same-origin` | Доступ к cookies, localStorage |
| `allow-forms` | Отправка форм |
| `allow-popups` | Всплывающие окна |
| `allow-presentation` | Presentation API |

Без `sandbox` — все разрешения даны. Пустой `sandbox=""` — максимальные ограничения.

### 其他 атрибуты безопасности

```html
<iframe
  src="widget.html"
  sandbox="allow-scripts"
  referrerpolicy="no-referrer"
  loading="lazy"
></iframe>
```

## Форматы медиа

### Видео

| Формат | Контейнер | Кодек | Когда |
|--------|-----------|-------|-------|
| MP4 | `.mp4` | H.264 | Универсальный, везде работает |
| WebM | `.webm` | VP9 / AV1 | Лучшее сжатие, для веба |
| Ogg | `.ogv` | Theora | Запасной, устаревает |

Стратегия: WebM (VP9) как основной, MP4 как fallback.

### Аудио

| Формат | Когда |
|--------|-------|
| MP3 | Универсальный |
| AAC | Лучшее качество при том же размере |
| OGG Vorbis | Бесплатный кодек |
| WebM Audio | Для аудио в WebM-контейнере |
| WAV | Без сжатия, для коротких звуков |

## Итог

- `<video>` + `controls` — встроенный плеер, MP4 + WebM для совместимости
- `autoplay muted loop playsinline` — паттерн для фонового видео
- `<track>` — субтитры в формате WebVTT
- `<audio controls>` — аудиоплеер
- `<iframe>` — YouTube, Vimeo, карты. `sandbox` для безопасности
- `aspect-ratio: 16 / 9` — адаптивный видеоплеер
- `loading="lazy"` — для iframe ниже сгиба
