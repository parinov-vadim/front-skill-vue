---
title: "Web Speech API: распознавание и синтез речи в браузере"
description: "Web Speech API — Speech Recognition для распознавания голоса, SpeechSynthesis для озвучивания текста, голосовое управление и доступность."
section: html
difficulty: intermediate
readTime: 7
order: 13
tags: [Web Speech API, распознавание речи, синтез речи, голосовой ввод, Speech Recognition, Speech Synthesis]
---

## Что такое Web Speech API

Два API в одном:
- **Speech Recognition** — распознавание голоса (речь → текст)
- **Speech Synthesis** — синтез речи (текст → речь)

Работают прямо в браузере, без серверной части.

## Speech Recognition — распознавание голоса

### Базовый пример

```js
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
const recognition = new SpeechRecognition()

recognition.lang = 'ru-RU'
recognition.interimResults = true

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript
  console.log('Распознано:', transcript)
}

recognition.start()
```

### Параметры

```js
recognition.lang = 'ru-RU'
recognition.continuous = true
recognition.interimResults = true
recognition.maxAlternatives = 3
```

| Параметр | Описание |
|----------|----------|
| `lang` | Язык распознавания (`'ru-RU'`, `'en-US'`, `'de-DE'`) |
| `continuous` | `true` — не останавливаться после первой фразы |
| `interimResults` | `true` — показывать промежуточные результаты (пока говорит) |
| `maxAlternatives` | Количество вариантов распознавания |

### События

```js
recognition.onstart = () => {
  console.log('Слушаю...')
}

recognition.onresult = (event) => {
  let final = ''
  let interim = ''

  for (let i = event.resultIndex; i < event.results.length; i++) {
    const transcript = event.results[i][0].transcript
    if (event.results[i].isFinal) {
      final += transcript
    } else {
      interim += transcript
    }
  }

  console.log('Финальный:', final)
  console.log('Промежуточный:', interim)
}

recognition.onerror = (event) => {
  console.error('Ошибка:', event.error)
}

recognition.onend = () => {
  console.log('Распознавание завершено')
}
```

### Практический пример — голосовой ввод в форму

```html
<div class="voice-input">
  <input type="text" id="text-input" placeholder="Введите текст или говорите">
  <button id="voice-btn" aria-label="Голосовой ввод">🎤</button>
</div>
```

```js
const input = document.getElementById('text-input')
const btn = document.getElementById('voice-btn')

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

if (!SpeechRecognition) {
  btn.disabled = true
  btn.title = 'Браузер не поддерживает распознавание речи'
} else {
  const recognition = new SpeechRecognition()
  recognition.lang = 'ru-RU'
  recognition.interimResults = true

  let listening = false

  btn.addEventListener('click', () => {
    if (listening) {
      recognition.stop()
    } else {
      recognition.start()
    }
  })

  recognition.onstart = () => {
    listening = true
    btn.classList.add('active')
  }

  recognition.onend = () => {
    listening = false
    btn.classList.remove('active')
  }

  recognition.onresult = (event) => {
    let result = ''
    for (let i = 0; i < event.results.length; i++) {
      result += event.results[i][0].transcript
    }
    input.value = result
  }

  recognition.onerror = (event) => {
    console.error('Ошибка распознавания:', event.error)
  }
}
```

```css
#voice-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #e5e7eb;
  cursor: pointer;
  font-size: 18px;
  transition: background 0.2s;
}

#voice-btn.active {
  background: #6366f1;
  color: white;
}
```

### Перезапуск при обрыве

Сервис может остановиться после паузы. Автоперезапуск при `continuous`:

```js
recognition.onend = () => {
  if (shouldListen) {
    recognition.start()
  }
}
```

## Speech Synthesis — озвучивание текста

### Базовый пример

```js
const utterance = new SpeechSynthesisUtterance('Привет! Это озвучка текста.')
utterance.lang = 'ru-RU'
speechSynthesis.speak(utterance)
```

### Параметры

```js
const utterance = new SpeechSynthesisUtterance('Текст для озвучки')
utterance.lang = 'ru-RU'
utterance.rate = 1
utterance.pitch = 1
utterance.volume = 1
utterance.voice = speechSynthesis.getVoices()[0]
```

| Параметр | Описание | Диапазон |
|----------|----------|----------|
| `rate` | Скорость речи | 0.1 – 10 (1 = нормальная) |
| `pitch` | Высота голоса | 0 – 2 (1 = нормальная) |
| `volume` | Громкость | 0 – 1 |
| `lang` | Язык | `'ru-RU'`, `'en-US'` |
| `voice` | Конкретный голос | Из `getVoices()` |

### Список голосов

```js
function loadVoices() {
  const voices = speechSynthesis.getVoices()
  console.log(voices)

  const russian = voices.filter((v) => v.lang.startsWith('ru'))
  console.log('Русские голоса:', russian)
}

speechSynthesis.onvoiceschanged = loadVoices
loadVoices()
```

`getVoices()` загружается асинхронно — используйте событие `onvoiceschanged`.

### Выбор голоса

```js
const voices = speechSynthesis.getVoices()
const russianVoice = voices.find((v) => v.lang === 'ru-RU')

const utterance = new SpeechSynthesisUtterance('Привет!')
utterance.voice = russianVoice
speechSynthesis.speak(utterance)
```

### События

```js
const utterance = new SpeechSynthesisUtterance('Длинный текст для озвучки')

utterance.onstart = () => console.log('Начало')
utterance.onend = () => console.log('Конец')
utterance.onpause = () => console.log('Пауза')
utterance.onresume = () => console.log('Продолжение')

utterance.onboundary = (event) => {
  console.log(`Слово на позиции ${event.charIndex}`)
}

speechSynthesis.speak(utterance)
```

### Управление воспроизведением

```js
speechSynthesis.pause()
speechSynthesis.resume()
speechSynthesis.cancel()
```

### Практический пример — озвучка статьи

```html
<article id="article">
  <h2>Заголовок статьи</h2>
  <p>Первый абзац текста статьи.</p>
  <p>Второй абзац текста статьи.</p>
</article>

<div class="audio-controls">
  <button id="play-btn">🔊 Озвучить</button>
  <button id="pause-btn" disabled>⏸ Пауза</button>
  <button id="stop-btn" disabled>⏹ Стоп</button>
  <select id="voice-select"></select>
  <label>Скорость: <input type="range" id="rate" min="0.5" max="2" step="0.1" value="1"></label>
</div>
```

```js
const article = document.getElementById('article')
const playBtn = document.getElementById('play-btn')
const pauseBtn = document.getElementById('pause-btn')
const stopBtn = document.getElementById('stop-btn')
const voiceSelect = document.getElementById('voice-select')
const rateInput = document.getElementById('rate')

function loadVoices() {
  const voices = speechSynthesis.getVoices()
  voiceSelect.innerHTML = voices
    .map((v, i) => `<option value="${i}">${v.name} (${v.lang})</option>`)
    .join('')
}

speechSynthesis.onvoiceschanged = loadVoices
loadVoices()

playBtn.addEventListener('click', () => {
  speechSynthesis.cancel()

  const text = article.textContent
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.voice = speechSynthesis.getVoices()[voiceSelect.value]
  utterance.rate = parseFloat(rateInput.value)

  utterance.onend = () => {
    playBtn.disabled = false
    pauseBtn.disabled = true
    stopBtn.disabled = true
  }

  speechSynthesis.speak(utterance)
  playBtn.disabled = true
  pauseBtn.disabled = false
  stopBtn.disabled = false
})

pauseBtn.addEventListener('click', () => {
  if (speechSynthesis.paused) {
    speechSynthesis.resume()
    pauseBtn.textContent = '⏸ Пауза'
  } else {
    speechSynthesis.pause()
    pauseBtn.textContent = '▶ Продолжить'
  }
})

stopBtn.addEventListener('click', () => {
  speechSynthesis.cancel()
  playBtn.disabled = false
  pauseBtn.disabled = true
  stopBtn.disabled = true
})
```

## Поддержка

| API | Chrome | Firefox | Safari | Edge |
|-----|--------|---------|--------|------|
| Speech Recognition | Да | Нет | Нет | Да |
| Speech Synthesis | Да | Да | Да | Да |

Speech Recognition работает в Chrome/Edge (использует серверы Google). Firefox и Safari не поддерживают. Для кроссбраузерности проверяйте:

```js
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

if (SpeechRecognition) {
  // Распознавание доступно
} else {
  // Показать fallback
}

if ('speechSynthesis' in window) {
  // Синтез доступен
}
```

## Итог

- `SpeechRecognition` — речь → текст. Chrome/Edge, `webkitSpeechRecognition`
- `SpeechSynthesis` — текст → речь. Широкая поддержка
- `recognition.continuous = true` для непрерывного распознавания
- `speechSynthesis.getVoices()` — список голосов (асинхронно)
- `rate`, `pitch`, `volume` — настройка озвучки
- Проверяйте поддержку и показывайте fallback
