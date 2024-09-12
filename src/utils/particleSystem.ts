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

  update(canvasWidth: number, canvasHeight: number) {
    this.x += this.speedX;
    this.y += this.speedY;

    if (this.x > canvasWidth || this.x < 0) this.speedX *= -1;
    if (this.y > canvasHeight || this.y < 0) this.speedY *= -1;
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

  for (let i = 0; i < particleCount; i++) {
    particles.push(
      new Particle(canvasEl.width, canvasEl.height, particleColor),
    );
  }

  function animate() {
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);

    particles.forEach((particle) => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color;
      ctx.fill();

      particle.update(canvasEl.width, canvasEl.height);
    });

    requestAnimationFrame(animate);
  }

  animate();
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
