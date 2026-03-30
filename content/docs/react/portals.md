---
title: React Portals
description: React Portals позволяют рендерить компоненты за пределами DOM-иерархии родителя. Модальные окна, тосты, тултипы без проблем с z-index и overflow.
section: react
difficulty: intermediate
readTime: 7
order: 15
tags: [Portals, createPortal, модальные окна, React]
---

## Что такое Portal

Portal рендерит дочерний элемент в DOM-узел, который находится за пределами родительского компонента. При этом React-дерево остаётся прежним — события всплывают как обычно.

```tsx
import { createPortal } from 'react-dom'

function Modal({ children }: { children: React.ReactNode }) {
  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        {children}
      </div>
    </div>,
    document.body,
  )
}
```

## Зачем нужны Portals

Проблемы без Portals:

```tsx
function Card() {
  return (
    <div className="overflow-hidden">     {/* overflow: hidden */}
      <div className="relative z-10">
        <Tooltip>Подсказка</Tooltip>       {/* Обрезается или прячется */}
      </div>
    </div>
  )
}
```

Родительский `overflow: hidden`, `z-index` или `transform` могут сломать выпадающие списки, модалки и тултипы. Portal решает это — контент рендерится прямо в `body`.

## Модальное окно

```tsx
import { useEffect, createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

function Modal({ isOpen, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
```

Использование:

```tsx
function App() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="overflow-hidden">
      <button onClick={() => setIsOpen(true)}>Открыть</button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h2>Заголовок</h2>
        <p>Содержимое модального окна</p>
        <button onClick={() => setIsOpen(false)}>Закрыть</button>
      </Modal>
    </div>
  )
}
```

## Toast-уведомления

```tsx
function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return createPortal(
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      ))}
    </div>,
    document.body,
  )
}
```

## Выпадающий список с Portal

```tsx
function Dropdown({ trigger, items }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLButtonElement>(null)

  function updatePosition() {
    if (!triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    setPosition({
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    })
  }

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => {
          updatePosition()
          setIsOpen(!isOpen)
        }}
      >
        {trigger}
      </button>

      {isOpen && createPortal(
        <ul
          className="absolute bg-white border rounded shadow-lg"
          style={{ top: position.top, left: position.left }}
        >
          {items.map((item) => (
            <li key={item.value} onClick={() => { item.onClick(); setIsOpen(false) }}>
              {item.label}
            </li>
          ))}
        </ul>,
        document.body,
      )}
    </>
  )
}
```

## События работают как обычно

Несмотря на то, что Portal рендерит в другой DOM-узел, события всплывают по React-дереву:

```tsx
function Parent() {
  return (
    <div onClick={() => console.log('Родитель поймал клик!')}>
      <Modal>
        <button>Кликни</button>
        {/* Клик по кнопке вызовет обработчик Parent */}
      </Modal>
    </div>
  )
}
```

Это значит, что `stopPropagation()` на оверлее модалки не сломает обработчики навигации, которые находятся выше в React-дереве.

## SSR и Portals

`createPortal` обращается к `document.body`, которого нет на сервере. Для SSR нужен_guard_:

```tsx
function Modal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return createPortal(<div>{children}</div>, document.body)
}
```

Или используйте `'use client'` в Next.js — тогда компонент рендерится только на клиенте.

## Итог

Portals решают три проблемы: `overflow: hidden`, `z-index` конфликты и позиционирование относительно вьюпорта. Используйте их для модалок, тостов, тултипов и выпадающих списков. События продолжают всплывать по React-дереву — это удобно и предсказуемо.
