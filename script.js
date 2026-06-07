const canvas = document.querySelector("#starfield");
const ctx = canvas.getContext("2d");

let width = 0;
let height = 0;
let stars = [];
let links = [];
let pointer = { x: 0, y: 0, active: false };

function resize() {
  const scale = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * scale);
  canvas.height = Math.floor(height * scale);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);

  const starCount = Math.round(Math.min(180, Math.max(88, width * height / 9800)));
  stars = Array.from({ length: starCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    z: Math.random() * 1.7 + 0.25,
    vx: (Math.random() - 0.5) * 0.16,
    vy: Math.random() * 0.18 + 0.04,
    pulse: Math.random() * Math.PI * 2
  }));

  links = Array.from({ length: 18 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.38,
    vy: (Math.random() - 0.5) * 0.38
  }));
}

function drawGrid(time) {
  const horizon = height * 0.64;
  ctx.save();
  ctx.globalAlpha = 0.32;
  ctx.strokeStyle = "rgba(98, 228, 255, 0.22)";
  ctx.lineWidth = 1;

  for (let i = 0; i < 18; i += 1) {
    const y = horizon + i * i * 3.2;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  for (let i = -16; i <= 16; i += 1) {
    const center = width / 2 + Math.sin(time / 1700) * 18;
    ctx.beginPath();
    ctx.moveTo(center + i * 26, horizon);
    ctx.lineTo(center + i * 96, height);
    ctx.stroke();
  }

  ctx.restore();
}

function drawStars(time) {
  for (const star of stars) {
    star.x += star.vx * star.z;
    star.y += star.vy * star.z;
    star.pulse += 0.025;

    if (star.y > height + 12) star.y = -12;
    if (star.x < -12) star.x = width + 12;
    if (star.x > width + 12) star.x = -12;

    const glow = (Math.sin(star.pulse) + 1) * 0.35 + 0.35;
    const radius = star.z * 1.4;
    ctx.beginPath();
    ctx.fillStyle = `rgba(220, 250, 255, ${glow})`;
    ctx.arc(star.x, star.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const node of links) {
    node.x += node.vx;
    node.y += node.vy;
    if (node.x < 0 || node.x > width) node.vx *= -1;
    if (node.y < 0 || node.y > height) node.vy *= -1;
  }

  ctx.save();
  ctx.lineWidth = 1;
  for (let i = 0; i < links.length; i += 1) {
    for (let j = i + 1; j < links.length; j += 1) {
      const a = links[i];
      const b = links[j];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (distance < 210) {
        ctx.strokeStyle = `rgba(98, 228, 255, ${0.18 * (1 - distance / 210)})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  if (pointer.active) {
    for (const node of links) {
      const distance = Math.hypot(node.x - pointer.x, node.y - pointer.y);
      if (distance < 240) {
        ctx.strokeStyle = `rgba(119, 255, 194, ${0.26 * (1 - distance / 240)})`;
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(pointer.x, pointer.y);
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}

function animate(time = 0) {
  ctx.clearRect(0, 0, width, height);
  drawStars(time);
  drawGrid(time);
  requestAnimationFrame(animate);
}

window.addEventListener("resize", resize);
window.addEventListener("pointermove", (event) => {
  pointer = { x: event.clientX, y: event.clientY, active: true };
});
window.addEventListener("pointerleave", () => {
  pointer.active = false;
});

resize();
animate();
