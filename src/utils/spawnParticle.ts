export const spawnRandomParticle = (
  classes: string[] = [],
  container: HTMLElement,
  duration = 3
): HTMLElement => {
  const particle = document.createElement('div');
  particle.classList.add('particle');
  classes.forEach((c) => particle.classList.add(c));
  particle.style.animationDuration = `${duration}s`;
  particle.style.left = `${Math.random() * 99}%`;
  particle.style.top = `${Math.random() * 99}%`;
  container.appendChild(particle);

  setTimeout(() => particle.remove(), duration * 1000 + 100);
  return particle;
};
