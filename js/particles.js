// ===== PARTICLES.JS - Smoke & Fire Particle System =====

class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.systems = [];
    this._buildIncenseSmoke();
    this._buildFireflies();
    this._buildBlossomPetals();
  }

  // ── INCENSE SMOKE ──
  _buildIncenseSmoke() {
    const count = 120; // Mobile-optimized count
    const geo   = new THREE.BufferGeometry();

    const positions  = new Float32Array(count * 3);
    const alphas     = new Float32Array(count);
    const sizes      = new Float32Array(count);
    const velocities = [];
    const ages       = new Float32Array(count);
    const maxAges    = new Float32Array(count);

    // Smoke spawn points (matches incense stick tips in environment)
    const origins = [];
    for (let i = 0; i < 9; i++) {
      const angle = (i / 9) * Math.PI * 2;
      const r = 0.1 + (i % 3) * 0.15;
      origins.push(new THREE.Vector3(
        Math.sin(angle) * r,
        1.83,
        -4 + Math.cos(angle) * r
      ));
    }

    for (let i = 0; i < count; i++) {
      const origin = origins[i % origins.length];
      ages[i] = Math.random(); // stagger
      maxAges[i] = Utils.rand(2, 4);
      const t = ages[i] / maxAges[i];
      positions[i * 3]     = origin.x + Utils.rand(-0.05, 0.05);
      positions[i * 3 + 1] = origin.y + t * 3;
      positions[i * 3 + 2] = origin.z + Utils.rand(-0.05, 0.05);
      alphas[i] = (1 - t) * 0.6;
      sizes[i]  = 0.3 + t * 1.5;
      velocities.push(new THREE.Vector3(
        Utils.rand(-0.02, 0.02),
        Utils.rand(0.3, 0.6),
        Utils.rand(-0.02, 0.02)
      ));
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('alpha',    new THREE.BufferAttribute(alphas, 1));
    geo.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

    // Smoke material with canvas texture
    const smokeCanvas = document.createElement('canvas');
    smokeCanvas.width = smokeCanvas.height = 64;
    const ctx = smokeCanvas.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(220,210,200,0.8)');
    grad.addColorStop(0.4, 'rgba(180,170,160,0.4)');
    grad.addColorStop(1, 'rgba(150,140,130,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const smokeTex = new THREE.CanvasTexture(smokeCanvas);

    const mat = new THREE.ShaderMaterial({
      uniforms: { tex: { value: smokeTex } },
      vertexShader: `
        attribute float alpha;
        attribute float size;
        varying float vAlpha;
        void main() {
          vAlpha = alpha;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform sampler2D tex;
        varying float vAlpha;
        void main() {
          vec4 color = texture2D(tex, gl_PointCoord);
          gl_FragColor = vec4(0.85, 0.82, 0.78, color.a * vAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    const points = new THREE.Points(geo, mat);
    this.scene.add(points);

    this.systems.push({
      type: 'smoke',
      geo, mat, points,
      positions, alphas, sizes, velocities, ages, maxAges, origins,
      count,
    });
  }

  // ── FIREFLIES ──
  _buildFireflies() {
    const count = 40;
    const geo   = new THREE.BufferGeometry();
    const pos   = new Float32Array(count * 3);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      pos[i * 3]     = Utils.rand(-20, 20);
      pos[i * 3 + 1] = Utils.rand(0.5, 5);
      pos[i * 3 + 2] = Utils.rand(-40, 30);
      phases[i] = Math.random() * Math.PI * 2;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xaaffaa,
      size: 0.15,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geo, mat);
    this.scene.add(points);

    this.systems.push({
      type: 'firefly',
      geo, mat, points,
      pos, phases, count,
    });
  }

  // ── BLOSSOM PETALS ──
  _buildBlossomPetals() {
    const count = 30;
    const geo   = new THREE.BufferGeometry();
    const pos   = new Float32Array(count * 3);
    const velData = [];

    for (let i = 0; i < count; i++) {
      pos[i * 3]     = Utils.rand(-15, 15);
      pos[i * 3 + 1] = Utils.rand(1, 12);
      pos[i * 3 + 2] = Utils.rand(-35, 30);
      velData.push({
        vx: Utils.rand(-0.5, 0.5),
        vy: Utils.rand(-0.3, -0.1),
        vz: Utils.rand(-0.3, 0.3),
        spin: Utils.rand(-1, 1),
      });
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    const mat = new THREE.PointsMaterial({
      color: 0xffaacc,
      size: 0.25,
      transparent: true,
      opacity: 0.7,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geo, mat);
    this.scene.add(points);

    this.systems.push({
      type: 'petal',
      geo, mat, points,
      pos, velData, count,
    });
  }

  // ── UPDATE ──
  update(dt, time) {
    this.systems.forEach(sys => {
      if (sys.type === 'smoke') this._updateSmoke(sys, dt);
      else if (sys.type === 'firefly') this._updateFireflies(sys, time);
      else if (sys.type === 'petal') this._updatePetals(sys, dt);
    });
  }

  _updateSmoke(sys, dt) {
    const { positions, alphas, sizes, velocities, ages, maxAges, origins, count } = sys;

    for (let i = 0; i < count; i++) {
      ages[i] += dt;

      if (ages[i] >= maxAges[i]) {
        // Respawn
        ages[i] = 0;
        maxAges[i] = Utils.rand(2, 4);
        const origin = origins[i % origins.length];
        positions[i * 3]     = origin.x + Utils.rand(-0.04, 0.04);
        positions[i * 3 + 1] = origin.y;
        positions[i * 3 + 2] = origin.z + Utils.rand(-0.04, 0.04);
        velocities[i].set(
          Utils.rand(-0.02, 0.02),
          Utils.rand(0.3, 0.6),
          Utils.rand(-0.02, 0.02)
        );
        alphas[i] = 0;
        sizes[i]  = 0.2;
        continue;
      }

      const t = ages[i] / maxAges[i];
      // Drift upward with slight wind
      positions[i * 3]     += velocities[i].x * dt + Math.sin(ages[i] * 0.8 + i) * 0.003;
      positions[i * 3 + 1] += velocities[i].y * dt;
      positions[i * 3 + 2] += velocities[i].z * dt;

      // Slow down horizontal drift
      velocities[i].x *= 0.99;
      velocities[i].z *= 0.99;

      // Fade in then out
      alphas[i] = t < 0.2
        ? (t / 0.2) * 0.55
        : (1 - (t - 0.2) / 0.8) * 0.55;

      // Grow
      sizes[i] = 0.3 + t * 2.0;
    }

    sys.geo.attributes.position.needsUpdate = true;
    sys.geo.attributes.alpha.needsUpdate    = true;
    sys.geo.attributes.size.needsUpdate     = true;
  }

  _updateFireflies(sys, time) {
    const { pos, phases, count } = sys;
    for (let i = 0; i < count; i++) {
      const p = phases[i];
      pos[i * 3]     += Math.sin(time * 0.7 + p) * 0.02;
      pos[i * 3 + 1] += Math.sin(time * 1.3 + p * 1.5) * 0.01;
      pos[i * 3 + 2] += Math.cos(time * 0.5 + p) * 0.02;
      // Boundary wrap
      if (pos[i * 3] > 22)  pos[i * 3] = -22;
      if (pos[i * 3] < -22) pos[i * 3] = 22;
      if (pos[i * 3 + 2] > 32)  pos[i * 3 + 2] = -42;
      if (pos[i * 3 + 2] < -42) pos[i * 3 + 2] = 32;
    }
    // Flicker opacity
    sys.mat.opacity = 0.5 + Math.sin(time * 3) * 0.3;
    sys.geo.attributes.position.needsUpdate = true;
  }

  _updatePetals(sys, dt) {
    const { pos, velData, count } = sys;
    for (let i = 0; i < count; i++) {
      const v = velData[i];
      pos[i * 3]     += v.vx * dt;
      pos[i * 3 + 1] += v.vy * dt;
      pos[i * 3 + 2] += v.vz * dt;
      // Respawn when fallen
      if (pos[i * 3 + 1] < 0) {
        pos[i * 3]     = Utils.rand(-15, 15);
        pos[i * 3 + 1] = Utils.rand(8, 14);
        pos[i * 3 + 2] = Utils.rand(-35, 30);
      }
    }
    sys.geo.attributes.position.needsUpdate = true;
  }
}
