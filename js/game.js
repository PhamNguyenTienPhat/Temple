// ===== GAME.JS - Main Game Engine =====

class Game {
  constructor() {
    this.canvas  = document.getElementById('game-canvas');
    this.loadingScreen = document.getElementById('loading-screen');
    this.hud     = document.getElementById('hud');
    this.progressBar = document.getElementById('progress-bar');
    this.loadingStatus = document.getElementById('loading-status');

    this.clock   = new THREE.Clock();
    this.time    = 0;
    this.fps     = new FPSCounter();

    this._setProgress(5, 'Khởi tạo renderer...');
    this._initRenderer();
    this._setProgress(15, 'Tạo cảnh quan...');
    this._initScene();
    this._setProgress(30, 'Dựng môi trường chùa...');
    this._initEnvironment();
    this._setProgress(60, 'Tạo nhân vật...');
    this._initCharacter();
    this._setProgress(75, 'Tạo hệ thống particles...');
    this._initParticles();
    this._setProgress(88, 'Kết nối điều khiển...');
    this._initControls();
    this._setProgress(95, 'Hoàn thiện...');
    this._initResize();

    // Short delay to show loading then start
    setTimeout(() => {
      this._setProgress(100, 'Bắt đầu!');
      setTimeout(() => {
        this._start();
      }, 500);
    }, 400);
  }

  _setProgress(pct, msg) {
    if (this.progressBar)    this.progressBar.style.width = `${pct}%`;
    if (this.loadingStatus)  this.loadingStatus.textContent = msg;
  }

  // ── RENDERER ──
  _initRenderer() {
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    const pixelRatio = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2.0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: !isMobile,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setPixelRatio(pixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = isMobile ? THREE.BasicShadowMap : THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.setClearColor(0x0d0600, 1);
  }

  // ── SCENE & CAMERA ──
  _initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x1a0a18, 0.008);

    this.camera = new THREE.PerspectiveCamera(
      65,
      window.innerWidth / window.innerHeight,
      0.3,
      300
    );
    this.camera.position.set(0, 4, 12);
  }

  // ── ENVIRONMENT ──
  _initEnvironment() {
    this.env = new Environment(this.scene);
  }

  // ── CHARACTER ──
  _initCharacter() {
    this.character = new Character(this.scene);
    this.character.group.position.set(0, 0, 8);

    // Character bounding
    this.charPos = new THREE.Vector3(0, 0, 8);
    this.charRadius = 0.45;
    this.moveSpeed = 4.5; // units per second
  }

  // ── PARTICLES ──
  _initParticles() {
    this.particles = new ParticleSystem(this.scene);
  }

  // ── CONTROLS ──
  _initControls() {
    this.controls = new Controls(this.canvas);
    this.controls.onPoseChange = (id) => {
      this.character.setPose(id);
      this._updateLocationText(id);
    };
  }

  _updateLocationText(poseId) {
    const el = document.getElementById('location-text');
    if (!el) return;
    const texts = ['Sân Chùa', 'Cầu Nguyện', 'Dâng Nhang', 'Quỳ Lạy'];
    el.textContent = texts[poseId] || 'Sân Chùa';
  }

  // ── RESIZE ──
  _initResize() {
    window.addEventListener('resize', () => {
      const w = window.innerWidth, h = window.innerHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });

    // Orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        const w = window.innerWidth, h = window.innerHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
      }, 200);
    });
  }

  // ── START ──
  _start() {
    // Fade out loading screen
    this.loadingScreen.classList.add('fade-out');
    setTimeout(() => {
      this.loadingScreen.style.display = 'none';
    }, 900);

    // Show HUD
    this.hud.classList.remove('hidden');
    this.hud.style.opacity = '1';

    // Start game loop
    this._loop();
  }

  // ── MAIN LOOP ──
  _loop() {
    requestAnimationFrame(() => this._loop());

    const rawDt = this.clock.getDelta();
    const dt = Math.min(rawDt, 0.05); // cap dt to avoid huge jumps
    this.time += dt;

    this._update(dt);
    this._render();
    this.fps.update();
  }

  // ── UPDATE ──
  _update(dt) {
    // Controls
    this.controls.update(dt);

    // Movement
    const moveDir = this.controls.getWorldMoveDir();
    const isMoving = moveDir !== null && this.character.pose === 0;

    if (isMoving) {
      const spd = this.moveSpeed * this.controls.moveSpeed;
      const newX = this.charPos.x + moveDir.x * spd * dt;
      const newZ = this.charPos.z + moveDir.z * spd * dt;

      // Boundary clamp (stay within temple walls)
      const bx = Utils.clamp(newX, -15, 15);
      const bz = Utils.clamp(newZ, -43, 40);

      // Collision
      if (!this.env.checkCollision(bx, this.charPos.z, this.charRadius)) {
        this.charPos.x = bx;
      }
      if (!this.env.checkCollision(this.charPos.x, bz, this.charRadius)) {
        this.charPos.z = bz;
      }
    }

    // Apply char position
    this.character.group.position.set(this.charPos.x, 0, this.charPos.z);

    // Character animation
    this.character.update(dt, isMoving ? moveDir : null, this.controls.moveSpeed);

    // Camera
    this.controls.updateCamera(this.camera, this.charPos);

    // Environment animations
    this.env.update(this.time);

    // Particles
    this.particles.update(dt, this.time);

    // Update location text based on position
    this._checkLocation();
  }

  _checkLocation() {
    const el = document.getElementById('location-text');
    if (!el) return;

    // Only update if in default pose
    if (this.character.pose !== 0) return;

    const x = this.charPos.x;
    const z = this.charPos.z;

    let loc = 'Sân Chùa';
    if (z < -35) loc = 'Chính Điện';
    else if (z < -15 && Math.abs(x) < 5) loc = 'Trước Tượng Phật';
    else if (z < -8  && Math.abs(x) < 3)  loc = 'Lư Hương';
    else if (z > 28)  loc = 'Cổng Tam Quan';
    else if (z > 18)  loc = 'Ao Sen';
    else if (Math.abs(x) > 11) loc = 'Vườn Cây';
    else if (z < 0)   loc = 'Tiền Đường';

    el.textContent = loc;
  }

  // ── RENDER ──
  _render() {
    this.renderer.render(this.scene, this.camera);
  }
}

// ── BOOT ──
window.addEventListener('DOMContentLoaded', () => {
  // Prevent scroll / context menu on mobile
  document.addEventListener('touchmove',  (e) => e.preventDefault(), { passive: false });
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  // Lock orientation hint (not enforced, just cosmetic)
  if (screen.orientation && screen.orientation.lock) {
    screen.orientation.lock('portrait').catch(() => {});
  }

  window._game = new Game();
});
