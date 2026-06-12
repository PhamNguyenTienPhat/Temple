// ===== UTILS.JS - Utility Functions =====

const Utils = {
  // Lerp
  lerp(a, b, t) { return a + (b - a) * t; },

  // Clamp
  clamp(val, min, max) { return Math.max(min, Math.min(max, val)); },

  // Map range
  map(val, inMin, inMax, outMin, outMax) {
    return outMin + ((val - inMin) / (inMax - inMin)) * (outMax - outMin);
  },

  // Degrees to radians
  deg2rad(d) { return d * Math.PI / 180; },
  rad2deg(r) { return r * 180 / Math.PI; },

  // Smooth step
  smoothstep(t) { return t * t * (3 - 2 * t); },

  // Random range
  rand(min, max) { return min + Math.random() * (max - min); },
  randInt(min, max) { return Math.floor(Utils.rand(min, max + 1)); },

  // Distance 2D
  dist2D(x1, z1, x2, z2) {
    const dx = x1 - x2, dz = z1 - z2;
    return Math.sqrt(dx * dx + dz * dz);
  },

  // Vector3 from angle
  vecFromAngle(angle) {
    return new THREE.Vector3(Math.sin(angle), 0, Math.cos(angle));
  },

  // Hex color to THREE.Color
  hex(h) { return new THREE.Color(h); },

  // Create material with good defaults
  mat(opts = {}) {
    return new THREE.MeshLambertMaterial(opts);
  },

  phong(opts = {}) {
    return new THREE.MeshPhongMaterial({ shininess: 30, ...opts });
  },

  // Simple box geometry helper
  box(w, h, d) { return new THREE.BoxGeometry(w, h, d); },

  // Cylinder helper
  cyl(rt, rb, h, seg = 8) { return new THREE.CylinderGeometry(rt, rb, h, seg); },

  // Sphere helper
  sph(r, ws = 12, hs = 8) { return new THREE.SphereGeometry(r, ws, hs); },

  // Merge geometries for performance (simple approach)
  mergeMeshes(meshes, material) {
    if (meshes.length === 0) return null;
    const geo = new THREE.BufferGeometry();
    const positions = [];
    const normals = [];
    const uvs = [];
    meshes.forEach(mesh => {
      mesh.updateMatrixWorld();
      const g = mesh.geometry.clone();
      g.applyMatrix4(mesh.matrixWorld);
      const pos = g.attributes.position;
      const nor = g.attributes.normal;
      const uv = g.attributes.uv;
      for (let i = 0; i < pos.count; i++) {
        positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
        if (nor) normals.push(nor.getX(i), nor.getY(i), nor.getZ(i));
        if (uv) uvs.push(uv.getX(i), uv.getY(i));
      }
    });
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    if (normals.length) geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    if (uvs.length) geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geo.computeVertexNormals();
    return new THREE.Mesh(geo, material);
  },

  // Create canvas texture for procedural textures
  canvasTexture(width, height, drawFn) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    drawFn(ctx, width, height);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  },

  // Wood texture
  woodTexture(w = 256, h = 256, baseColor = '#6b3a2a', grainColor = '#4a2518') {
    return Utils.canvasTexture(w, h, (ctx) => {
      ctx.fillStyle = baseColor;
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = grainColor;
      ctx.lineWidth = 1;
      for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.moveTo(Utils.rand(0, w), 0);
        ctx.lineTo(Utils.rand(0, w), h);
        ctx.globalAlpha = Utils.rand(0.1, 0.3);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    });
  },

  // Stone texture
  stoneTexture(w = 256, h = 256) {
    return Utils.canvasTexture(w, h, (ctx) => {
      const img = ctx.createImageData(w, h);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Utils.randInt(100, 160);
        img.data[i] = v;
        img.data[i+1] = v - 10;
        img.data[i+2] = v - 20;
        img.data[i+3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      // Add cracks
      ctx.strokeStyle = 'rgba(50,40,30,0.3)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.moveTo(Utils.rand(0, w), Utils.rand(0, h));
        ctx.lineTo(Utils.rand(0, w), Utils.rand(0, h));
        ctx.stroke();
      }
    });
  },

  // Gold texture
  goldTexture(w = 128, h = 128) {
    return Utils.canvasTexture(w, h, (ctx) => {
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#f0c040');
      grad.addColorStop(0.3, '#d4a017');
      grad.addColorStop(0.6, '#f0c040');
      grad.addColorStop(1, '#8b6914');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
    });
  },

  // Roof tile texture
  roofTexture(w = 256, h = 256) {
    return Utils.canvasTexture(w, h, (ctx) => {
      ctx.fillStyle = '#8b1a1a';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#5a0d0d';
      ctx.lineWidth = 2;
      const tw = 32, th = 20;
      for (let row = 0; row < h / th; row++) {
        for (let col = 0; col < w / tw; col++) {
          const ox = (row % 2 === 0) ? 0 : tw / 2;
          const x = col * tw + ox;
          const y = row * th;
          ctx.beginPath();
          ctx.ellipse(x + tw / 2, y + th / 2, tw / 2 - 1, th / 2 - 1, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    });
  },

  // Grass texture
  grassTexture(w = 256, h = 256) {
    return Utils.canvasTexture(w, h, (ctx) => {
      ctx.fillStyle = '#2d5a1b';
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 200; i++) {
        const x = Utils.rand(0, w);
        const y = Utils.rand(0, h);
        ctx.strokeStyle = `rgba(${Utils.randInt(30,80)},${Utils.randInt(80,140)},${Utils.randInt(20,60)},0.6)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y + 8);
        ctx.lineTo(x + Utils.rand(-3, 3), y);
        ctx.stroke();
      }
    });
  },
};

// FPS Counter
class FPSCounter {
  constructor() {
    this.frames = 0;
    this.last = performance.now();
    this.fps = 60;
    this.el = document.getElementById('fps-counter');
  }
  update() {
    this.frames++;
    const now = performance.now();
    if (now - this.last >= 1000) {
      this.fps = Math.round(this.frames * 1000 / (now - this.last));
      this.frames = 0;
      this.last = now;
      if (this.el) this.el.textContent = `${this.fps} FPS`;
    }
  }
}
