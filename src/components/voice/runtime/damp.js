export const damp = (current, target, speed, dt) => current + (target - current) * (1 - Math.exp(-speed * dt));
