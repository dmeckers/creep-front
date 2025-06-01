<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

const canvas = ref<HTMLCanvasElement | null>(null);

interface Firefly {
  x: number;
  y: number;
  s: number;
  ang: number;
  v: number;
  move: () => void;
  show: () => void;
}

interface MousePosition {
  x: number;
  y: number;
}

let c: CanvasRenderingContext2D;
let w = ref(window.innerWidth);
let h = ref(window.innerHeight);
const fireflies = ref<Firefly[]>([]);
const mouse = ref<MousePosition>({ x: 0, y: 0 });
const lastMouse = ref<MousePosition>({ x: 0, y: 0 });

class FireflyClass implements Firefly {
  x: number;
  y: number;
  s: number;
  ang: number;
  v: number;

  constructor() {
    this.x = Math.random() * w.value;
    this.y = Math.random() * h.value;
    this.s = Math.random() * 2;
    this.ang = Math.random() * 2 * Math.PI;
    this.v = (this.s * this.s) / 8;
  }

  move() {
    this.x += this.v * Math.cos(this.ang);
    this.y += this.v * Math.sin(this.ang);
    this.ang += (Math.random() * 20 * Math.PI) / 180 - (10 * Math.PI) / 180;
  }

  show() {
    if (!c) return;
    c.beginPath();
    c.arc(this.x, this.y, this.s, 0, 2 * Math.PI);
    c.fillStyle = "#fddba3";
    c.fill();
  }
}

function init() {
  if (!canvas.value) return;
  c = canvas.value.getContext("2d") as CanvasRenderingContext2D;
  canvas.value.width = w.value;
  canvas.value.height = h.value;
  c.fillStyle = "rgba(182, 217, 44, 1)";
  c.fillRect(0, 0, w.value, h.value);
}

function draw() {
  if (fireflies.value.length < 100) {
    for (let j = 0; j < 10; j++) {
      fireflies.value.push(new FireflyClass());
    }
  }

  for (let i = 0; i < fireflies.value.length; i++) {
    fireflies.value[i].move();
    fireflies.value[i].show();
    if (
      fireflies.value[i].x < 0 ||
      fireflies.value[i].x > w.value ||
      fireflies.value[i].y < 0 ||
      fireflies.value[i].y > h.value
    ) {
      fireflies.value.splice(i, 1);
    }
  }
}

function handleMouseMove(e: MouseEvent) {
  if (!canvas.value) return;
  lastMouse.value.x = mouse.value.x;
  lastMouse.value.y = mouse.value.y;

  mouse.value.x = e.pageX - canvas.value.offsetLeft;
  mouse.value.y = e.pageY - canvas.value.offsetTop;
}

function loop() {
  if (!c || !canvas.value) return;
  requestAnimationFrame(loop);
  c.clearRect(0, 0, w.value, h.value);
  draw();
}

function handleResize() {
  if (!canvas.value) return;
  w.value = canvas.value.width = window.innerWidth;
  h.value = canvas.value.height = window.innerHeight;
  loop();
}

onMounted(() => {
  init();
  canvas.value?.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("resize", handleResize);
  loop();
});

onUnmounted(() => {
  canvas.value?.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("resize", handleResize);
});
</script>

<template>
  <canvas ref="canvas"></canvas>
</template>

<style scoped>
canvas {
  filter: blur(1px);
}
</style>
