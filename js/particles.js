const PARTICLE_LIFETIME_MS = 500;
const SPAWN_INTERVAL_MS = 40;

class SmokeParticle {
  constructor(x, y) {
    this.x = x + (Math.random() - 0.5) * 8;
    this.y = y;
    this.age = 0;
    this.driftX = (Math.random() - 0.5) * 20;
  }

  update(dt) {
    this.age += dt * 1000;
    this.y += 60 * dt;
    this.x += this.driftX * dt;
  }

  get alive() {
    return this.age < PARTICLE_LIFETIME_MS;
  }

  get progress() {
    return this.age / PARTICLE_LIFETIME_MS;
  }
}

export function createTrailEmitter() {
  let sinceLastSpawn = SPAWN_INTERVAL_MS;
  const particles = [];

  return {
    particles,
    update(dt, originX, originY) {
      sinceLastSpawn += dt * 1000;
      if (sinceLastSpawn >= SPAWN_INTERVAL_MS) {
        sinceLastSpawn = 0;
        particles.push(new SmokeParticle(originX, originY));
      }
      for (const particle of particles) particle.update(dt);
      for (let i = particles.length - 1; i >= 0; i--) {
        if (!particles[i].alive) particles.splice(i, 1);
      }
    },
  };
}
