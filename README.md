# 🌀 3D Card Carousel with Hand Tracking (React)

An interactive **3D card carousel** built with **React**, featuring:

- Mouse drag + inertia (momentum physics)
- **Hand-tracking pinch control** using MediaPipe Hands
- Real-time rotation with smooth decay
- Fully 3D CSS transforms

This project explores **natural interaction** with 3D UI elements using both traditional and gesture-based input.

---

## ✨ Features

- 🎴 Circular 3D card layout using `translate3d`
- 🖱️ Mouse drag with momentum physics
- ✋ Pinch-to-rotate using webcam hand tracking
- 🧠 Velocity-based inertia for smooth motion
- 🎥 Live camera + debug overlay
- ⚡ Optimized with `useRef` and `requestAnimationFrame`

---

## 🛠️ Tech Stack

- **React**
- **MediaPipe Hands**
- **CSS 3D Transforms**
- **Web Camera API**
- **requestAnimationFrame**

---

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Include MediaPipe scripts

Add these to your `index.html` (or load them globally):

```html
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"></script>
```

### 3. Use the component

```jsx
import CardCarousel3D from "./CardCarousel3D";

function App() {
  return <CardCarousel3D />;
}
```

### 4. Run the app

```bash
npm start
```

---

## 🖱️ Controls

### Mouse

- **Click + drag** → rotate carousel
- **Release** → momentum continues naturally

### Hand Tracking

- **Pinch (thumb + index)** → grab carousel
- **Move hand horizontally** → rotate
- **Release pinch** → momentum continues

> ⚠️ Requires camera permission

---

## ⚙️ Key Parameters

You can tweak these values inside the component:

```js
const cardCount = 30; // Number of cards
const radius = 600; // Carousel radius
const angleStep = 360 / cardCount;
```

---

## 🧪 Debug UI

A live debug window shows:

- Camera feed
- Hand detection state
- Pinch distance
- Real-time pinch status

You can disable it by removing the **Hand Debug Window** JSX block.

---

## 📄 License

MIT — feel free to experiment, remix, and build on it.

---
