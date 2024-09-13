class Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;

  constructor(canvasWidth: number, canvasHeight: number, color: string) {
    this.x = Math.random() * canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.size = Math.random() * 3 + 1;
    this.speedX = Math.random() * 0.5 - 0.25;
    this.speedY = Math.random() * 0.5 - 0.25;
    this.color = color;
  }

  update(
    canvasWidth: number,
    canvasHeight: number,
    offsetX: number,
    offsetY: number,
  ) {
    this.x += this.speedX + offsetX * 0.05;
    this.y += this.speedY + offsetY * 0.05;

    if (this.x > canvasWidth) this.x = 0;
    if (this.x < 0) this.x = canvasWidth;
    if (this.y > canvasHeight) this.y = 0;
    if (this.y < 0) this.y = canvasHeight;
  }
}

export function createParticleSystem(
  canvasEl: HTMLCanvasElement,
  theme: string,
) {
  const ctx = canvasEl.getContext("2d")!;
  const particles: Particle[] = [];

  const particleCount = 100;
  const particleColor = getParticleColor(theme);

  let mouseX = 0;
  let mouseY = 0;
  let scrollY = 0;

  for (let i = 0; i < particleCount; i++) {
    particles.push(
      new Particle(canvasEl.width, canvasEl.height, particleColor),
    );
  }

  function animate() {
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

    const offsetX = (mouseX - canvasEl.width / 2) * 0.01;
    const offsetY = (mouseY - canvasEl.height / 2) * 0.01 + scrollY * 0.1;

    particles.forEach((particle) => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();

      particle.update(canvasEl.width, canvasEl.height, offsetX, offsetY);
    });

    requestAnimationFrame(animate);
  }

  animate();

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  window.addEventListener("scroll", () => {
    scrollY = window.scrollY;
  });
}

function getParticleColor(theme: string): string {
  switch (theme) {
    case "light":
      return "rgba(52, 152, 219, 0.5)";
    case "light-red":
      return "rgba(231, 76, 60, 0.5)";
    case "light-yellow":
      return "rgba(241, 196, 15, 0.5)";
    case "dark":
      return "rgba(236, 240, 241, 0.5)";
    case "dark-red":
      return "rgba(255, 148, 120, 0.5)";
    case "dark-yellow":
      return "rgba(255, 234, 167, 0.5)";
    default:
      return "rgba(52, 152, 219, 0.5)";
  }
}
