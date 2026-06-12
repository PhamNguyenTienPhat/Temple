// ===== CONTROLS.JS - Touch Joystick + Camera Controls =====

class Controls {
  constructor(canvas) {
    this.canvas = canvas;

    // Movement state
    this.moveDir   = new THREE.Vector3();
    this.moveSpeed = 0;

    // Camera state
    this.cameraYaw   = 0;    // horizontal rotation
    this.cameraPitch = 0.4;  // vertical angle (radians)
    this.cameraDistance = 6; // zoom distance

    // Joystick state
    this.joystickActive = false;
    this.joystickOrigin = { x: 0, y: 0 };
    this.joystickDelta  = { x: 0, y: 0 };
    this.joystickRadius = 55;

    // Camera drag state
    this.camDragActive = false;
    this.camDragStart  = { x: 0, y: 0 };
    this.camDragPrevId = null;

    // DOM references
    this.joystickBase = document.getElementById('joystick-base');
    this.joystickKnob = document.getElementById('joystick-knob');
    this.joystickContainer = document.getElementById('joystick-container');

    this._bindJoystick();
    this._bindCameraDrag();
    this._bindZoomButtons();
    this._bindPoseButtons();
    this._bindKeyboard();

    // Pose callback
    this.onPoseChange = null;
  }

  _bindJoystick() {
    const base = this.joystickBase;

    const onStart = (e) => {
      e.preventDefault();
      const touch = e.touches ? e.touches[0] : e;
      const rect = base.getBoundingClientRect();
      this.joystickActive = true;
      this.joystickOrigin = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
      this._updateJoystick(touch.clientX, touch.clientY);
    };

    const onMove = (e) => {
      e.preventDefault();
      if (!this.joystickActive) return;
      const touch = e.touches ? e.touches[0] : e;
      this._updateJoystick(touch.clientX, touch.clientY);
    };

    const onEnd = (e) => {
      e.preventDefault();
      this.joystickActive = false;
      this.joystickDelta = { x: 0, y: 0 };
      this.joystickKnob.style.transform = 'translate(-50%, -50%)';
      this.moveDir.set(0, 0, 0);
      this.moveSpeed = 0;
    };

    base.addEventListener('touchstart', onStart, { passive: false });
    base.addEventListener('touchmove',  onMove,  { passive: false });
    base.addEventListener('touchend',   onEnd,   { passive: false });
    base.addEventListener('mousedown',  onStart);
    window.addEventListener('mousemove', (e) => { if (this.joystickActive) onMove(e); });
    window.addEventListener('mouseup',   (e) => { if (this.joystickActive) onEnd(e); });
  }

  _updateJoystick(cx, cy) {
    const dx = cx - this.joystickOrigin.x;
    const dy = cy - this.joystickOrigin.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clamped = Math.min(dist, this.joystickRadius);
    const angle = Math.atan2(dy, dx);

    const nx = Math.cos(angle) * clamped;
    const ny = Math.sin(angle) * clamped;

    this.joystickKnob.style.transform =
      `translate(calc(-50% + ${nx}px), calc(-50% + ${ny}px))`;

    const norm = clamped / this.joystickRadius;
    this.joystickDelta = {
      x: (nx / this.joystickRadius),
      y: (ny / this.joystickRadius),
    };
    this.moveSpeed = norm;
  }

  _bindCameraDrag() {
    const canvas = this.canvas;
    let prevX = 0, prevY = 0;
    let isDragging = false;
    let activeTouchId = null;

    const onTouchStart = (e) => {
      // Only use touches NOT on the joystick area or pose panel
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        const el = document.elementFromPoint(t.clientX, t.clientY);
        if (el && (el.closest('#joystick-base') || el.closest('#pose-panel') ||
                   el.closest('#camera-controls'))) continue;
        if (activeTouchId === null) {
          activeTouchId = t.identifier;
          prevX = t.clientX;
          prevY = t.clientY;
          isDragging = true;
          break;
        }
      }
    };

    const onTouchMove = (e) => {
      if (!isDragging || activeTouchId === null) return;
      for (let i = 0; i < e.touches.length; i++) {
        const t = e.touches[i];
        if (t.identifier === activeTouchId) {
          const dx = t.clientX - prevX;
          const dy = t.clientY - prevY;
          this.cameraYaw   -= dx * 0.006;
          this.cameraPitch  = Utils.clamp(
            this.cameraPitch + dy * 0.005,
            0.1, Math.PI / 2.2
          );
          prevX = t.clientX;
          prevY = t.clientY;
          break;
        }
      }
    };

    const onTouchEnd = (e) => {
      let found = false;
      for (let i = 0; i < e.touches.length; i++) {
        if (e.touches[i].identifier === activeTouchId) { found = true; break; }
      }
      if (!found) {
        activeTouchId = null;
        isDragging = false;
      }
    };

    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove',  onTouchMove,  { passive: true });
    canvas.addEventListener('touchend',   onTouchEnd,   { passive: true });

    // Mouse camera drag
    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) { isDragging = true; prevX = e.clientX; prevY = e.clientY; }
    });
    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      this.cameraYaw  -= dx * 0.005;
      this.cameraPitch = Utils.clamp(this.cameraPitch + dy * 0.004, 0.1, Math.PI / 2.2);
      prevX = e.clientX;
      prevY = e.clientY;
    });
    window.addEventListener('mouseup', () => { isDragging = false; });

    // Mouse wheel zoom
    canvas.addEventListener('wheel', (e) => {
      this.cameraDistance = Utils.clamp(
        this.cameraDistance + e.deltaY * 0.01,
        2.5, 18
      );
    }, { passive: true });

    // Pinch zoom
    let lastPinchDist = 0;
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        lastPinchDist = Math.sqrt(dx * dx + dy * dy);
      }
    }, { passive: true });
    canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const delta = lastPinchDist - dist;
        this.cameraDistance = Utils.clamp(this.cameraDistance + delta * 0.03, 2.5, 18);
        lastPinchDist = dist;
      }
    }, { passive: true });
  }

  _bindZoomButtons() {
    document.getElementById('cam-zoom-in').addEventListener('click', () => {
      this.cameraDistance = Utils.clamp(this.cameraDistance - 1, 2.5, 18);
    });
    document.getElementById('cam-zoom-out').addEventListener('click', () => {
      this.cameraDistance = Utils.clamp(this.cameraDistance + 1, 2.5, 18);
    });
  }

  _bindPoseButtons() {
    document.querySelectorAll('.pose-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const poseId = parseInt(btn.dataset.pose);
        document.querySelectorAll('.pose-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (this.onPoseChange) this.onPoseChange(poseId);
      });
    });
  }

  _bindKeyboard() {
    this._keys = {};
    window.addEventListener('keydown', (e) => {
      this._keys[e.code] = true;
      // Number keys for poses
      if (e.code === 'Digit1') this._triggerPose(0);
      if (e.code === 'Digit2') this._triggerPose(1);
      if (e.code === 'Digit3') this._triggerPose(2);
      if (e.code === 'Digit4') this._triggerPose(3);
    });
    window.addEventListener('keyup', (e) => { this._keys[e.code] = false; });
  }

  _triggerPose(id) {
    document.querySelectorAll('.pose-btn').forEach(b => b.classList.remove('active'));
    const btn = document.getElementById(`btn-pose-${id}`);
    if (btn) btn.classList.add('active');
    if (this.onPoseChange) this.onPoseChange(id);
  }

  // ── UPDATE ── called each frame
  update(dt) {
    // Keyboard movement
    if (this._keys) {
      let kx = 0, kz = 0;
      if (this._keys['KeyW'] || this._keys['ArrowUp'])    kz -= 1;
      if (this._keys['KeyS'] || this._keys['ArrowDown'])  kz += 1;
      if (this._keys['KeyA'] || this._keys['ArrowLeft'])  kx -= 1;
      if (this._keys['KeyD'] || this._keys['ArrowRight']) kx += 1;
      if (kx !== 0 || kz !== 0) {
        const len = Math.sqrt(kx * kx + kz * kz);
        this.joystickDelta.x = kx / len;
        this.joystickDelta.y = kz / len;
        this.moveSpeed = 1;
      } else if (!this.joystickActive) {
        this.joystickDelta = { x: 0, y: 0 };
        this.moveSpeed = 0;
      }
    }
  }

  // ── GET WORLD MOVE DIRECTION (camera-relative) ──
  getWorldMoveDir() {
    if (this.moveSpeed < 0.05) return null;
    const jx = this.joystickDelta.x;
    const jy = this.joystickDelta.y;
    const yaw = this.cameraYaw;
    // Transform joystick to world space based on camera yaw
    const wx = Math.cos(yaw) * jx - Math.sin(yaw) * jy;
    const wz = Math.sin(yaw) * jx + Math.cos(yaw) * jy;
    return new THREE.Vector3(wx, 0, wz).normalize().multiplyScalar(this.moveSpeed);
  }

  // ── UPDATE CAMERA ──
  updateCamera(camera, targetPos) {
    const dist = this.cameraDistance;
    const pitch = this.cameraPitch;
    const yaw   = this.cameraYaw;

    const camX = targetPos.x + dist * Math.sin(yaw) * Math.cos(pitch);
    const camY = targetPos.y + dist * Math.sin(pitch) + 1.2;
    const camZ = targetPos.z + dist * Math.cos(yaw) * Math.cos(pitch);

    camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.12);
    camera.lookAt(
      targetPos.x,
      targetPos.y + 1.2,
      targetPos.z
    );
  }
}
