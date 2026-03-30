---
title: "DNS, TCP/IP, TLS: как работает интернет (для фронтендера)"
description: "Основы работы интернета: DNS, TCP/IP, TLS/SSL, CDN, HTTP-кеширование. Что происходит между вводом URL и отображением страницы."
section: web-fundamentals
difficulty: beginner
readTime: 13
order: 9
tags: [dns, tcp, ip, tls, ssl, cdn, network, internet]
---

## Что происходит, когда вы открываете сайт

Вы вводите `https://example.com` и нажимаете Enter. Вот что происходит за те ~200 мс:

```
1. DNS       → example.com → 93.184.216.34
2. TCP       → Установка соединения с сервером
3. TLS       → Шифрование (HTTPS handshake)
4. HTTP      → Отправка запроса и получение ответа
5. Parse     → DOM, CSSOM, Render Tree
6. Paint     → Пиксели на экране
```

Разберём каждый шаг.

## DNS (Domain Name System)

DNS превращает доменное имя в IP-адрес. Компьютеры общаются по IP-адресам, а не по именам.

```
example.com → 93.184.216.34
google.com  → 142.250.190.46
```

### Как работает DNS-запрос

1. Браузер проверяет кэш (был ли этот домен недавно?)
2. Проверяет OS-кэш (файл hosts)
3. Запрашивает у **Recursive DNS** (вашего провайдера или Google DNS 8.8.8.8)
4. Recursive DNS идёт к **Root DNS** → **TLD DNS** (.com) → **Authoritative DNS** (example.com)
5. Получает IP-адрес и возвращает браузеру

```
Браузер → Recursive DNS → Root DNS (.)
                         → TLD DNS (.com)
                         → Authoritative DNS (example.com)
                         → IP: 93.184.216.34
```

### Время DNS-запроса

Обычно 20–120 мс. Кэшируется на время TTL (Time to Live), обычно 5 минут — 24 часа.

### Утилиты

```bash
nslookup example.com                   # DNS-запрос
dig example.com                        # Подробный DNS-запрос
dig example.com +short                 # Только IP
dig example.com CNAME                  # CNAME-запись
```

### DNS-записи

| Тип | Описание | Пример |
|---|---|---|
| `A` | IPv4-адрес | `93.184.216.34` |
| `AAAA` | IPv6-адрес | `2606:2800:220:1:...` |
| `CNAME` | Алиас (домен → домен) | `www.example.com → example.com` |
| `MX` | Почтовый сервер | `mail.example.com` |
| `TXT` | Текстовая запись | SPF, DKIM, Google verification |
| `NS` | DNS-серверы домена | `ns1.example.com` |

### DNS-prefetch

Фронтендер может ускорить DNS-запросы для внешних ресурсов:

```html
<link rel="dns-prefetch" href="//fonts.googleapis.com">
<link rel="dns-prefetch" href="//cdn.example.com">
<link rel="preconnect" href="//fonts.googleapis.com" crossorigin>
```

`dns-prefetch` — только DNS-запрос. `preconnect` — DNS + TCP + TLS (полное подключение).

## TCP/IP

### IP (Internet Protocol)

IP — протокол доставки пакетов. Каждый компьютер в интернете имеет IP-адрес.

- **IPv4**: `192.168.1.1` (4 байта, ~4.3 млрд адресов)
- **IPv6**: `2001:0db8:85a3::8a2e:0370:7334` (16 байтов, почти бесконечно)

Пакеты IP могут идти разными маршрутами и приходить не по порядку. TCP решает эту проблему.

### TCP (Transmission Control Protocol)

TCP — протокол поверх IP, который обеспечивает:
- **Надёжную доставку** — каждый пакет подтверждается
- **Порядок** — пакеты собираются в правильном порядке
- **Контроль потока** — не отправляет быстрее, чем получатель может обработать

#### TCP Handshake (трёхстороннее рукопожатие)

```
Клиент                          Сервер
  │──── SYN ────────────────────►│   (1. Клиент: "Хочу подключиться")
  │◄─── SYN-ACK ─────────────────│   (2. Сервер: "Ок, подтверждаю")
  │──── ACK ────────────────────►│   (3. Клиент: "Подтверждаю")
  │                               │
  │═══ Данные ════════════════════│   (Можно отправлять данные)
```

Три шага = минимум 1 RTT (Round Trip Time). Между Москвой и сервером в Европе — ~30 мс.

#### TCP Slow Start

TCP не отправляет все данные сразу. Он начинает с небольшого окна и увеличивает:
- Первый пакет: 10 сегментов
- Второй: 20
- Третий: 40
- ...

Поэтому первые байты приходят быстрее, чем весь ресурс. Большие файлы выигрывают от HTTP/2 (мультиплексирование по одному соединению).

### UDP (User Datagram Protocol)

UDP — проще TCP: отправляет пакеты без подтверждения и порядка.
- Быстрее TCP (нет handshake, нет retransmission)
- Пакеты могут теряться
- Используется: DNS, видео-стриминг, онлайн-игры, HTTP/3 (QUIC)

## TLS (Transport Layer Security)

TLS — протокол шифрования. HTTPS = HTTP + TLS. Защищает данные от перехвата.

### TLS Handshake

```
Клиент                              Сервер
  │──── ClientHello ─────────────────►│   (Поддерживаемые шифры)
  │◄─── ServerHello + Certificate ────│   (Выбранный шифр, сертификат)
  │──── Key Exchange ────────────────►│   (Обмен ключами)
  │◄─── Finished ─────────────────────│
  │                                    │
  │═══ Зашифрованные данные ═══════════│
```

TLS 1.3 оптимизирован: 1 RTT вместо 2, как в TLS 1.2. С 0-RTT — вообще без задержки для повторных подключений.

### Сертификаты

SSL/TLS-сертификат подтверждает, что сервер — тот, за кого себя выдаёт. Выпускается Certificate Authority (CA):
- **Let's Encrypt** — бесплатно, автоматически
- **Cloudflare** — бесплатно с CDN
- Платные: DigiCert, Sectigo

Сертификат содержит:
- Домен
- Владельца
- Публичный ключ
- Подпись CA
- Срок действия

### HSTS

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

HSTS говорит браузеру: «всегда используй HTTPS для этого домена». Даже если пользователь набрал `http://` — браузер переключит на `https://`.

## CDN (Content Delivery Network)

CDN — сеть серверов по всему миру. Пользователь получает данные с ближайшего сервера.

```
Без CDN:
  Пользователь в Москве → Сервер в Калифорнии → 200 мс

С CDN:
  Пользователь в Москве → CDN-сервер в Москве → 20 мс
```

### CDN кэширует:
- Статику: CSS, JS, изображения, шрифты
- HTML (если настроено)
- API-ответы (если позволяет Cache-Control)

### Популярные CDN:
- **Cloudflare** — бесплатно до определённого лимита
- **Vercel** — для Next.js / Nuxt
- **Netlify** — для статических сайтов
- **AWS CloudFront** — Enterprise

### Cache-Control на CDN

```http
Cache-Control: public, max-age=31536000, immutable
```

- `public` — CDN может кэшировать
- `max-age=31536000` — на 1 год
- `immutable` — содержимое не изменится (для файлов с хешем: `app.abc123.js`)

## Полная картина: загрузка страницы

```
1. Пользователь вводит https://example.com

2. DNS-запрос
   example.com → 93.184.216.34  (~50 мс, кэшируется)

3. TCP Handshake
   Клиент ↔ Сервер  (~30 мс, 1 RTT)

4. TLS Handshake
   Обмен ключами, проверка сертификата  (~30 мс, 1 RTT с TLS 1.3)

5. HTTP-запрос
   GET / HTTP/1.1  →  200 OK + HTML  (~50 мс)

6. Парсинг HTML
   Обнаружение CSS, JS, изображений

7. Загрузка ресурсов (параллельно)
   style.css    → DNS + TCP + TLS + HTTP (если с другого домена)
   app.js       → через HTTP/2 (мультиплексирование)
   hero.webp    → CDN

8. Render
   DOM → CSSOM → Render Tree → Layout → Paint → Composite

Итого: ~200 мс до First Paint (оптимизированный сайт)
```

## Инструменты для анализа сети

### Chrome DevTools → Network

Показывает timing каждого запроса:
```
DNS Lookup:  15 мс
TCP:         30 мс  (Initial connection)
TLS:         25 мс  (SSL)
Waiting:     50 мс  (TTFB — Time To First Byte)
Download:    80 мс  (Content Download)
Total:       200 мс
```

### curl

```bash
curl -w "DNS: %{time_namelookup}s\nTCP: %{time_connect}s\nTLS: %{time_appconnect}s\nTTFB: %{time_starttransfer}s\nTotal: %{time_total}s\n" -o /dev/null -s https://example.com
```

### traceroute

```bash
traceroute example.com                # Путь пакетов до сервера
```

## Что фронтендер может оптимизировать

| Оптимизация | Эффект |
|---|---|
| `dns-prefetch` для внешних доменов | -20–50 мс на DNS |
| `preconnect` для критических доменов | -50–100 мс на подключение |
| CDN для статики | -100–500 мс на географию |
| HTTP/2 на сервере | Мультиплексирование |
| Keep-Alive | Переиспользование TCP-соединений |
| Кэширование (Cache-Control) | 0 мс при повторных запросах |

## Итог

- **DNS** — домен → IP-адрес (кэшируется)
- **TCP** — надёжная доставка пакетов (handshake = 1 RTT)
- **TLS** — шифрование (HTTPS = HTTP + TLS)
- **CDN** — серверы ближе к пользователю = быстрее
- Используйте `dns-prefetch` и `preconnect` для внешних ресурсов
- `preconnect` = DNS + TCP + TLS заранее
- Полный путь: DNS → TCP → TLS → HTTP → Parse → Render → Paint
- Оптимизируйте критический путь рендеринга для быстрой загрузки
