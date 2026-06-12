// ===== ENVIRONMENT.JS - Vietnamese Buddhist Temple Complex =====

class Environment {
  constructor(scene) {
    this.scene = scene;
    this.collidables = []; // collision boxes [x,z,halfW,halfD]
    this.textures = {};
    this._initTextures();
    this._build();
  }

  _initTextures() {
    this.textures.stone   = Utils.stoneTexture(256, 256);
    this.textures.wood    = Utils.woodTexture(256, 256);
    this.textures.roof    = Utils.roofTexture(256, 256);
    this.textures.grass   = Utils.grassTexture(256, 256);
    this.textures.gold    = Utils.goldTexture(128, 128);
    [this.textures.stone, this.textures.wood, this.textures.roof,
     this.textures.grass, this.textures.gold].forEach(t => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
    });
    this.textures.stone.repeat.set(4, 4);
    this.textures.grass.repeat.set(8, 8);
    this.textures.roof.repeat.set(3, 2);
    this.textures.wood.repeat.set(2, 2);
  }

  _mat(color, opts = {}) {
    return new THREE.MeshLambertMaterial({ color, ...opts });
  }
  _phong(color, opts = {}) {
    return new THREE.MeshPhongMaterial({ color, shininess: 30, ...opts });
  }
  _mesh(geo, mat, castShadow = true) {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = castShadow;
    m.receiveShadow = true;
    return m;
  }

  _addCollider(x, z, hw, hd) {
    this.collidables.push({ x, z, hw, hd });
  }

  _build() {
    this._buildGround();
    this._buildCourtyard();
    this._buildStairs();
    this._buildBuddhaStatue();
    this._buildIncenseBurner();
    this._buildTempleHall();
    this._buildGatehouse();
    this._buildWalls();
    this._buildLanterns();
    this._buildTrees();
    this._buildSkyDome();
    this._buildLighting();
    this._buildWaterFeature();
    this._buildDecorations();
  }

  // ── GROUND ──
  _buildGround() {
    const ground = this._mesh(
      new THREE.PlaneGeometry(200, 200, 20, 20),
      new THREE.MeshLambertMaterial({ map: this.textures.grass, color: 0x3a6b25 }),
      false
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Stone courtyard area
    const court = this._mesh(
      new THREE.PlaneGeometry(50, 60, 10, 10),
      new THREE.MeshLambertMaterial({ map: this.textures.stone, color: 0xb0a090 }),
      false
    );
    court.rotation.x = -Math.PI / 2;
    court.position.set(0, 0.01, 0);
    court.receiveShadow = true;
    this.scene.add(court);
  }

  // ── COURTYARD PAVING ──
  _buildCourtyard() {
    const tileMat = this._phong(0x9a8878, { map: this.textures.stone });
    // Paving tiles grid
    for (let i = -4; i <= 4; i++) {
      for (let j = -5; j <= 5; j++) {
        if ((i + j) % 2 === 0) {
          const tile = this._mesh(
            new THREE.BoxGeometry(2.8, 0.06, 2.8),
            tileMat, false
          );
          tile.position.set(i * 3, 0.03, j * 4);
          tile.receiveShadow = true;
          this.scene.add(tile);
        }
      }
    }
  }

  // ── STONE STAIRS ──
  _buildStairs() {
    const stairMat = this._phong(0x888070, { map: this.textures.stone });
    const steps = 8;
    const stairW = 14;
    // Front stairs (south side)
    for (let s = 0; s < steps; s++) {
      const step = this._mesh(
        new THREE.BoxGeometry(stairW, 0.22, 0.9),
        stairMat
      );
      step.position.set(0, s * 0.22, 22 + s * 0.9);
      this.scene.add(step);
    }
    // Side guard rails
    [-7, 7].forEach(sx => {
      for (let s = 0; s < steps; s++) {
        const rail = this._mesh(new THREE.BoxGeometry(0.4, 1.0, 0.9), stairMat);
        rail.position.set(sx, s * 0.22 + 0.5, 22 + s * 0.9);
        this.scene.add(rail);
      }
    });
    this._addCollider(0, 26, 7, 8);
  }

  // ══════════════════════════════════════════════════
  // ── GIGANTIC BUDDHA STATUE (most detailed object) ──
  // ══════════════════════════════════════════════════
  _buildBuddhaStatue() {
    const g = new THREE.Group();
    g.position.set(0, 0, -18);
    this.scene.add(g);
    this._addCollider(0, -18, 4, 4);

    const goldMat = this._phong(0xd4a017, {
      map: this.textures.gold,
      shininess: 80,
      specular: new THREE.Color(0xffdd88),
    });
    const darkGoldMat = this._phong(0x8b6914, { shininess: 40 });
    const stoneMat   = this._phong(0x8a7a6a, { map: this.textures.stone });
    const skinMat    = this._phong(0xd4a017, { shininess: 60 });
    const eyeMat     = new THREE.MeshPhongMaterial({ color: 0x1a0a40, shininess: 100 });
    const eyeWhiteMat = new THREE.MeshPhongMaterial({ color: 0xfff8e8, shininess: 60 });
    const robeMat    = this._phong(0xc47d10, { shininess: 30 });
    const haloMat    = this._phong(0xf0c040, { shininess: 120, emissive: 0xd4a017, emissiveIntensity: 0.15 });

    const mk = (geo, mat) => this._mesh(geo, mat);

    // ── LOTUS THRONE BASE ──
    const throneBase = mk(new THREE.CylinderGeometry(4.5, 5, 1.2, 16), stoneMat);
    throneBase.position.y = 0.6;
    g.add(throneBase);

    const throneUpper = mk(new THREE.CylinderGeometry(3.8, 4.5, 0.5, 16), stoneMat);
    throneUpper.position.y = 1.45;
    g.add(throneUpper);

    // Lotus petals around throne
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const petal = mk(new THREE.SphereGeometry(0.9, 8, 6), goldMat);
      petal.scale.set(0.6, 0.4, 1.2);
      petal.position.set(Math.sin(angle) * 3.6, 1.7, Math.cos(angle) * 3.6);
      petal.rotation.y = angle;
      g.add(petal);

      // Inner petal layer
      const angle2 = angle + Math.PI / 16;
      const petal2 = mk(new THREE.SphereGeometry(0.7, 8, 6), this._phong(0xe8b820));
      petal2.scale.set(0.55, 0.45, 1.0);
      petal2.position.set(Math.sin(angle2) * 3.0, 2.0, Math.cos(angle2) * 3.0);
      petal2.rotation.y = angle2;
      g.add(petal2);
    }

    // Lotus platform top
    const lotusPlatform = mk(new THREE.CylinderGeometry(3.2, 3.8, 0.4, 16), goldMat);
    lotusPlatform.position.y = 2.0;
    g.add(lotusPlatform);

    // ── BODY / TORSO ──
    const bodyGeo = new THREE.CylinderGeometry(1.55, 1.9, 3.5, 14);
    const body = mk(bodyGeo, goldMat);
    body.position.y = 4.0;
    g.add(body);

    // Robe folds on torso
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const fold = mk(new THREE.BoxGeometry(0.12, 3.0, 0.06), robeMat);
      fold.position.set(Math.sin(angle) * 1.55, 4.0, Math.cos(angle) * 1.55);
      fold.rotation.y = angle;
      g.add(fold);
    }

    // Robe collar
    const collar = mk(new THREE.TorusGeometry(1.2, 0.12, 8, 20), robeMat);
    collar.position.y = 5.5;
    collar.rotation.x = Math.PI / 2;
    g.add(collar);

    // Belly ornament
    const belly = mk(new THREE.SphereGeometry(0.25, 8, 6), goldMat);
    belly.position.set(0, 3.5, 1.55);
    g.add(belly);

    // Chest medallion
    const medal = mk(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 12), haloMat);
    medal.position.set(0, 4.8, 1.52);
    medal.rotation.x = Math.PI / 2;
    g.add(medal);

    // ── SHOULDERS ──
    const shGeo = new THREE.SphereGeometry(0.72, 10, 8);
    const shL = mk(shGeo, goldMat);
    shL.scale.set(0.85, 0.8, 0.85);
    shL.position.set(-1.9, 5.6, 0.1);
    g.add(shL);
    const shR = shL.clone();
    shR.position.set(1.9, 5.6, 0.1);
    g.add(shR);

    // ── ARMS - Dhyana mudra (meditation hands on lap) ──
    // Left upper arm
    const uaGeo = new THREE.CylinderGeometry(0.38, 0.32, 1.8, 10);
    const uaL = mk(uaGeo, goldMat);
    uaL.position.set(-2.1, 4.8, 0.3);
    uaL.rotation.z = Utils.deg2rad(60);
    uaL.rotation.x = Utils.deg2rad(20);
    g.add(uaL);

    const uaR = uaL.clone();
    uaR.position.set(2.1, 4.8, 0.3);
    uaR.rotation.z = Utils.deg2rad(-60);
    uaR.rotation.x = Utils.deg2rad(20);
    g.add(uaR);

    // Forearms resting on lap
    const faGeo = new THREE.CylinderGeometry(0.3, 0.25, 1.6, 10);
    const faL = mk(faGeo, goldMat);
    faL.position.set(-1.1, 3.0, 1.3);
    faL.rotation.z = Utils.deg2rad(10);
    faL.rotation.x = Utils.deg2rad(-60);
    g.add(faL);

    const faR = faL.clone();
    faR.position.set(1.1, 3.0, 1.3);
    faR.rotation.z = Utils.deg2rad(-10);
    faR.rotation.x = Utils.deg2rad(-60);
    g.add(faR);

    // ── HANDS - Dhyana Mudra (right hand on left, palms up) ──
    const handGeo = new THREE.BoxGeometry(0.9, 0.18, 0.65);
    const handL = mk(handGeo, skinMat);
    handL.position.set(-0.38, 2.35, 2.0);
    handL.rotation.x = Utils.deg2rad(-15);
    g.add(handL);

    const handR = mk(handGeo, skinMat);
    handR.position.set(0.38, 2.5, 1.9);
    handR.rotation.x = Utils.deg2rad(-15);
    g.add(handR);

    // Buddha hand fingers (detailed)
    const fingerPositions = [-0.3, -0.15, 0, 0.15, 0.3];
    fingerPositions.forEach((fx, fi) => {
      const fLen = [0.38, 0.42, 0.44, 0.40, 0.32][fi];
      // Left hand fingers
      const fgL = mk(new THREE.CylinderGeometry(0.05, 0.04, fLen, 5), skinMat);
      fgL.position.set(fx - 0.38, 2.35, 2.4 + fi * 0.01);
      fgL.rotation.x = Utils.deg2rad(-80);
      g.add(fgL);
      // Right hand fingers
      const fgR = fgL.clone();
      fgR.position.set(fx + 0.38, 2.5, 2.3);
      g.add(fgR);
      // Fingernails
      const nail = mk(new THREE.BoxGeometry(0.07, 0.02, 0.06), haloMat);
      nail.position.set(fx - 0.38, 2.35, 2.62);
      g.add(nail);
      const nailR = nail.clone();
      nailR.position.set(fx + 0.38, 2.5, 2.52);
      g.add(nailR);
    });

    // ── NECK ──
    const neck = mk(new THREE.CylinderGeometry(0.55, 0.7, 0.8, 12), goldMat);
    neck.position.y = 5.85;
    g.add(neck);

    // Three neck lines (Triratna symbol)
    for (let i = 0; i < 3; i++) {
      const nl = mk(new THREE.TorusGeometry(0.58, 0.03, 6, 16), darkGoldMat);
      nl.position.y = 5.7 + i * 0.15;
      nl.rotation.x = Math.PI / 2;
      g.add(nl);
    }

    // ── HEAD (most detailed) ──
    const headGeo = new THREE.SphereGeometry(1.25, 20, 16);
    headGeo.scale(1.0, 1.15, 0.95);
    const head = mk(headGeo, goldMat);
    head.position.y = 7.15;
    g.add(head);
    this.parts = this.parts || {};
    this.parts.buddhaHead = head;

    // ── USHNISHA (wisdom bump on top) ──
    const ush = mk(new THREE.SphereGeometry(0.5, 12, 10), goldMat);
    ush.position.y = 8.5;
    g.add(ush);

    // Spiral curls (Buddha hair)
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const r = Utils.rand(0.2, 0.9);
      const curl = mk(new THREE.SphereGeometry(0.09, 6, 5), darkGoldMat);
      curl.position.set(
        Math.sin(angle) * r,
        7.8 + Math.cos(i) * 0.3,
        Math.cos(angle) * r * 0.95
      );
      g.add(curl);
    }

    // ── FOREHEAD ──
    // Urna (dot on forehead)
    const urna = mk(new THREE.SphereGeometry(0.08, 8, 7), haloMat);
    urna.position.set(0, 7.22, 1.22);
    g.add(urna);

    // ── EYES ──
    // White sclera
    const ewGeo = new THREE.SphereGeometry(0.2, 10, 8);
    const ewL = mk(ewGeo, eyeWhiteMat);
    ewL.position.set(-0.42, 7.18, 1.15);
    ewL.scale.set(1, 0.7, 0.5);
    g.add(ewL);
    const ewR = ewL.clone();
    ewR.position.set(0.42, 7.18, 1.15);
    g.add(ewR);

    // Iris
    const irisGeo = new THREE.CircleGeometry(0.12, 12);
    const irisMat = new THREE.MeshPhongMaterial({ color: 0x1a0a30, shininess: 100 });
    const irisL = mk(irisGeo, irisMat);
    irisL.position.set(-0.42, 7.18, 1.22);
    g.add(irisL);
    const irisR = irisL.clone();
    irisR.position.set(0.42, 7.18, 1.22);
    g.add(irisR);

    // Half-closed eyelids (meditative expression)
    const lidGeo = new THREE.SphereGeometry(0.21, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2);
    const lidMat = new THREE.MeshPhongMaterial({ color: 0xc49a28, shininess: 40 });
    const lidL = mk(lidGeo, lidMat);
    lidL.position.set(-0.42, 7.22, 1.14);
    lidL.rotation.x = -Math.PI / 2;
    lidL.scale.set(1, 0.5, 0.9);
    g.add(lidL);
    const lidR = lidL.clone();
    lidR.position.set(0.42, 7.22, 1.14);
    g.add(lidR);

    // Eyebrows (arched, elongated)
    const browMat = new THREE.MeshLambertMaterial({ color: 0x5a3a00 });
    const browGeo = new THREE.CylinderGeometry(0.03, 0.02, 0.55, 6);
    const browL = mk(browGeo, browMat);
    browL.position.set(-0.42, 7.45, 1.18);
    browL.rotation.z = Utils.deg2rad(15);
    browL.rotation.x = Utils.deg2rad(-20);
    g.add(browL);
    const browR = browL.clone();
    browR.position.set(0.42, 7.45, 1.18);
    browR.rotation.z = Utils.deg2rad(-15);
    g.add(browR);

    // ── NOSE ──
    const noseGeo = new THREE.SphereGeometry(0.18, 8, 6);
    noseGeo.scale(0.8, 0.65, 0.7);
    const nose = mk(noseGeo, goldMat);
    nose.position.set(0, 7.0, 1.26);
    g.add(nose);
    // Nostrils
    const nostGeo = new THREE.SphereGeometry(0.07, 6, 5);
    const nostL = mk(nostGeo, darkGoldMat);
    nostL.position.set(-0.11, 6.92, 1.32);
    g.add(nostL);
    const nostR = nostL.clone();
    nostR.position.set(0.11, 6.92, 1.32);
    g.add(nostR);

    // ── LIPS (serene smile) ──
    const upLipMat = this._phong(0xb8860b);
    const upLip = mk(new THREE.CylinderGeometry(0.28, 0.24, 0.08, 12), upLipMat);
    upLip.position.set(0, 6.78, 1.22);
    upLip.rotation.x = Math.PI / 2;
    g.add(upLip);
    const loLip = mk(new THREE.SphereGeometry(0.22, 10, 6), upLipMat);
    loLip.scale.set(1.2, 0.5, 0.5);
    loLip.position.set(0, 6.68, 1.22);
    g.add(loLip);
    // Smile corners
    [-0.26, 0.26].forEach(sx => {
      const corner = mk(new THREE.SphereGeometry(0.07, 6, 5), upLipMat);
      corner.position.set(sx, 6.73, 1.21);
      g.add(corner);
    });

    // ── EARS ──
    const earGeo = new THREE.SphereGeometry(0.35, 8, 6);
    earGeo.scale(0.4, 0.9, 0.35);
    const earL = mk(earGeo, goldMat);
    earL.position.set(-1.26, 7.1, 0.1);
    g.add(earL);
    // Extended earlobe (elongated Buddha ears)
    const earLobeL = mk(new THREE.SphereGeometry(0.22, 8, 6), goldMat);
    earLobeL.scale.set(0.5, 1.2, 0.4);
    earLobeL.position.set(-1.26, 6.55, 0.12);
    g.add(earLobeL);
    const earR = earL.clone();
    earR.position.set(1.26, 7.1, 0.1);
    g.add(earR);
    const earLobeR = earLobeL.clone();
    earLobeR.position.set(1.26, 6.55, 0.12);
    g.add(earLobeR);

    // Ear rings / ornament
    const earRingGeo = new THREE.TorusGeometry(0.14, 0.03, 5, 10);
    const erL = mk(earRingGeo, haloMat);
    erL.position.set(-1.3, 6.55, 0.12);
    erL.rotation.y = Math.PI / 2;
    g.add(erL);
    const erR = erL.clone();
    erR.position.set(1.3, 6.55, 0.12);
    g.add(erR);

    // ── HALO / NIMBUS ──
    const haloGeo = new THREE.TorusGeometry(2.2, 0.08, 8, 40);
    const halo = mk(haloGeo, haloMat);
    halo.position.y = 7.5;
    halo.position.z = -0.2;
    g.add(halo);

    // Halo rays
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const ray = mk(new THREE.BoxGeometry(0.04, 1.8, 0.02), haloMat);
      ray.position.set(Math.sin(angle) * 1.4, 7.5 + Math.cos(angle) * 1.4, -0.18);
      ray.rotation.z = angle;
      g.add(ray);
    }

    // Inner halo disk (translucent)
    const haloInner = new THREE.Mesh(
      new THREE.CircleGeometry(2.1, 32),
      new THREE.MeshBasicMaterial({
        color: 0xf0d060,
        transparent: true,
        opacity: 0.06,
        side: THREE.DoubleSide,
      })
    );
    haloInner.position.set(0, 7.5, -0.22);
    g.add(haloInner);

    // ── ORNAMENTAL CROWN / TIARA ──
    const crownGeo = new THREE.CylinderGeometry(0.9, 1.1, 0.35, 14);
    const crown = mk(crownGeo, haloMat);
    crown.position.y = 8.2;
    g.add(crown);
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const spike = mk(new THREE.ConeGeometry(0.06, 0.3, 5), haloMat);
      spike.position.set(Math.sin(angle) * 1.0, 8.55, Math.cos(angle) * 1.0);
      g.add(spike);
    }

    // ── PEDESTAL INSCRIPTION ──
    const inscPlate = mk(new THREE.BoxGeometry(3, 0.5, 0.12), darkGoldMat);
    inscPlate.position.set(0, 0.7, 5.15);
    g.add(inscPlate);

    // ── POINT LIGHT on statue ──
    const statueLight = new THREE.PointLight(0xffdd88, 1.2, 25);
    statueLight.position.set(0, 10, 5);
    g.add(statueLight);

    // Subtle glow at base
    const glowLight = new THREE.PointLight(0xd4a017, 0.5, 12);
    glowLight.position.set(0, 2, 0);
    g.add(glowLight);
  }

  // ── INCENSE BURNER ──
  _buildIncenseBurner() {
    const g = new THREE.Group();
    g.position.set(0, 0, -4);
    this.scene.add(g);
    this._addCollider(0, -4, 1.5, 1.5);

    const bronzeMat = this._phong(0x7c5a2a, { shininess: 60 });
    const darkMat   = this._mat(0x3a2810);

    // Base platform
    const base = this._mesh(new THREE.BoxGeometry(2.8, 0.25, 2.8), this._phong(0x888070, { map: this.textures.stone }));
    base.position.y = 0.125;
    g.add(base);

    // Pedestal legs (3 legs)
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const leg = this._mesh(new THREE.CylinderGeometry(0.12, 0.18, 0.9, 6), bronzeMat);
      leg.position.set(Math.sin(angle) * 0.65, 0.7, Math.cos(angle) * 0.65);
      g.add(leg);
      // Claw foot
      const claw = this._mesh(new THREE.SphereGeometry(0.16, 6, 5), bronzeMat);
      claw.position.set(Math.sin(angle) * 0.65, 0.2, Math.cos(angle) * 0.65);
      g.add(claw);
    }

    // Burner body
    const body = this._mesh(new THREE.CylinderGeometry(0.7, 0.5, 0.5, 12), bronzeMat);
    body.position.y = 1.15;
    g.add(body);

    // Rim
    const rim = this._mesh(new THREE.TorusGeometry(0.72, 0.06, 6, 16), bronzeMat);
    rim.position.y = 1.42;
    rim.rotation.x = Math.PI / 2;
    g.add(rim);

    // Dragon handles
    [-0.8, 0.8].forEach(sx => {
      const handle = this._mesh(new THREE.TorusGeometry(0.22, 0.04, 6, 12, Math.PI), bronzeMat);
      handle.position.set(sx, 1.25, 0);
      handle.rotation.z = Math.PI / 2;
      g.add(handle);
    });

    // Ash fill
    const ash = this._mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.1, 12), this._mat(0xc0b8b0));
    ash.position.y = 1.22;
    g.add(ash);

    // Burning incense sticks
    this.incenseSticks = [];
    for (let i = 0; i < 9; i++) {
      const angle = (i / 9) * Math.PI * 2;
      const r = Utils.rand(0.1, 0.4);
      const stick = this._mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.55, 5),
        this._mat(0x8b5a2b)
      );
      const sx = Math.sin(angle) * r;
      const sz = Math.cos(angle) * r;
      const tilt = Utils.rand(-0.15, 0.15);
      stick.position.set(sx, 1.55, sz);
      stick.rotation.x = tilt;
      stick.rotation.z = Utils.rand(-0.1, 0.1);
      g.add(stick);

      // Glowing tip
      const tip = this._mesh(
        new THREE.SphereGeometry(0.02, 5, 4),
        new THREE.MeshPhongMaterial({ color: 0xff5500, emissive: 0xff2200, emissiveIntensity: 1, shininess: 0 })
      );
      tip.position.set(sx, 1.83 + tilt * 0.3, sz);
      g.add(tip);
      this.incenseSticks.push({ tip, angle, r, sx, sz });
    }

    // Incense light
    this.incenseLight = new THREE.PointLight(0xff6600, 0.6, 4);
    this.incenseLight.position.set(0, 2.0, 0);
    g.add(this.incenseLight);

    this.incenseBurnerGroup = g;
  }

  // ── TEMPLE HALL (behind Buddha) ──
  _buildTempleHall() {
    const g = new THREE.Group();
    g.position.set(0, 0, -42);
    this.scene.add(g);
    this._addCollider(0, -42, 14, 12);

    const woodMat  = this._phong(0x6b3a2a, { map: this.textures.wood });
    const roofMat  = this._phong(0x8b1a1a, { map: this.textures.roof });
    const stoneMat = this._phong(0x888070, { map: this.textures.stone });
    const goldMat  = this._phong(0xd4a017, { map: this.textures.gold });
    const redMat   = this._mat(0xcc2222);
    const darkWood = this._mat(0x3d1f0f);

    // Foundation
    const found = this._mesh(new THREE.BoxGeometry(28, 1.2, 22), stoneMat);
    found.position.y = 0.6;
    g.add(found);

    // Columns (8 columns)
    const colPositions = [
      [-10,-8],[-10,0],[-10,8],[10,-8],[10,0],[10,8],
      [0,-10.5],[0,10.5]
    ];
    colPositions.forEach(([cx, cz]) => {
      const col = this._mesh(new THREE.CylinderGeometry(0.45, 0.52, 8, 10), redMat);
      col.position.set(cx, 5.2, cz);
      g.add(col);
      // Capital
      const cap = this._mesh(new THREE.BoxGeometry(1.2, 0.5, 1.2), goldMat);
      cap.position.set(cx, 9.45, cz);
      g.add(cap);
      // Base
      const base = this._mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.5, 8), stoneMat);
      base.position.set(cx, 1.45, cz);
      g.add(base);
    });

    // Walls
    const wallMat = this._phong(0xf5e6c8);
    // Back wall
    const backWall = this._mesh(new THREE.BoxGeometry(28, 9, 0.5), wallMat);
    backWall.position.set(0, 5.7, -11);
    g.add(backWall);
    // Side walls
    const sideWall = this._mesh(new THREE.BoxGeometry(0.5, 9, 22), wallMat);
    sideWall.position.set(-14, 5.7, 0);
    g.add(sideWall);
    const sideWallR = sideWall.clone();
    sideWallR.position.set(14, 5.7, 0);
    g.add(sideWallR);

    // Front entrance
    const archL = this._mesh(new THREE.BoxGeometry(9, 9, 0.5), wallMat);
    archL.position.set(-9.5, 5.7, 11);
    g.add(archL);
    const archR = this._mesh(new THREE.BoxGeometry(9, 9, 0.5), wallMat);
    archR.position.set(9.5, 5.7, 11);
    g.add(archR);
    const archTop = this._mesh(new THREE.BoxGeometry(28, 2.5, 0.5), wallMat);
    archTop.position.set(0, 9.55, 11);
    g.add(archTop);

    // Door frame
    const doorFrame = this._mesh(new THREE.BoxGeometry(5.2, 7.2, 0.6), goldMat);
    doorFrame.position.set(0, 4.8, 11.1);
    g.add(doorFrame);
    // Door panels
    const doorPanel = this._mesh(new THREE.BoxGeometry(2.3, 6.8, 0.2), darkWood);
    doorPanel.position.set(-1.3, 4.6, 11.2);
    g.add(doorPanel);
    const doorPanelR = doorPanel.clone();
    doorPanelR.position.set(1.3, 4.6, 11.2);
    g.add(doorPanelR);

    // ── TIERED ROOF (3 tiers - traditional Vietnamese) ──
    const tiers = [
      { w: 32, d: 26, y: 11, curve: 1.5 },
      { w: 24, d: 19, y: 13.5, curve: 1.2 },
      { w: 16, d: 12, y: 16, curve: 0.9 },
    ];

    tiers.forEach((tier, ti) => {
      // Eave structure
      const eave = this._mesh(
        new THREE.BoxGeometry(tier.w, 0.4, tier.d),
        roofMat
      );
      eave.position.y = tier.y;
      g.add(eave);

      // Curved roof sides
      const sides = [
        { rot: 0,        pos: [0, 0, tier.d / 2] },
        { rot: Math.PI,  pos: [0, 0, -tier.d / 2] },
        { rot: Math.PI / 2, pos: [tier.w / 2, 0, 0] },
        { rot: -Math.PI / 2, pos: [-tier.w / 2, 0, 0] },
      ];
      sides.forEach(s => {
        const roofSlope = this._mesh(
          new THREE.BoxGeometry(s.rot % Math.PI === 0 ? tier.w : tier.d, tier.curve * 2.5, 0.25),
          roofMat
        );
        roofSlope.position.set(s.pos[0], tier.y + tier.curve * 0.8, s.pos[2]);
        roofSlope.rotation.y = s.rot;
        roofSlope.rotation.x = -Math.PI * 0.18;
        g.add(roofSlope);
      });

      // Ridge beam
      const ridge = this._mesh(new THREE.BoxGeometry(tier.w, 0.5, 0.4), roofMat);
      ridge.position.y = tier.y + tier.curve * 2.2;
      g.add(ridge);

      // Corner ornaments
      const corners = [
        [tier.w / 2, tier.d / 2], [-tier.w / 2, tier.d / 2],
        [tier.w / 2, -tier.d / 2], [-tier.w / 2, -tier.d / 2]
      ];
      corners.forEach(([cx, cz]) => {
        const orn = this._mesh(new THREE.ConeGeometry(0.2, 0.7, 5), goldMat);
        orn.position.set(cx, tier.y + 0.5, cz);
        g.add(orn);
        const ornBase = this._mesh(new THREE.SphereGeometry(0.22, 6, 5), goldMat);
        ornBase.position.set(cx, tier.y + 0.25, cz);
        g.add(ornBase);
      });
    });

    // Ridge dragon ornament
    const dragonBody = this._mesh(new THREE.SphereGeometry(0.5, 8, 6), goldMat);
    dragonBody.position.y = 18;
    g.add(dragonBody);

    const dragonTop = this._mesh(new THREE.ConeGeometry(0.35, 1.2, 6), goldMat);
    dragonTop.position.y = 19;
    g.add(dragonTop);

    // Wall decorations
    const decGeo = new THREE.BoxGeometry(1.5, 2, 0.1);
    for (let i = -2; i <= 2; i++) {
      const dec = this._mesh(decGeo, goldMat);
      dec.position.set(i * 4, 8.5, 11.15);
      g.add(dec);
    }

    // Interior altar (simple)
    const altar = this._mesh(new THREE.BoxGeometry(6, 2, 2), woodMat);
    altar.position.set(0, 2.2, -8);
    g.add(altar);
    const altarTop = this._mesh(new THREE.BoxGeometry(7, 0.2, 2.5), goldMat);
    altarTop.position.set(0, 3.3, -8);
    g.add(altarTop);
  }

  // ── GATEHOUSE ──
  _buildGatehouse() {
    const g = new THREE.Group();
    g.position.set(0, 0, 32);
    this.scene.add(g);
    this._addCollider(0, 32, 10, 3);

    const woodMat  = this._phong(0x6b3a2a, { map: this.textures.wood });
    const roofMat  = this._phong(0x8b1a1a, { map: this.textures.roof });
    const stoneMat = this._phong(0x888070, { map: this.textures.stone });
    const goldMat  = this._phong(0xd4a017);
    const redMat   = this._mat(0xcc2222);

    // Gate pillars
    [-5, 5].forEach(x => {
      const pil = this._mesh(new THREE.BoxGeometry(2.5, 10, 2.5), redMat);
      pil.position.set(x, 5, 0);
      g.add(pil);
      // Gold cap
      const cap = this._mesh(new THREE.BoxGeometry(3, 0.6, 3), goldMat);
      cap.position.set(x, 10.3, 0);
      g.add(cap);
    });

    // Crossbeam
    const beam = this._mesh(new THREE.BoxGeometry(12, 1.5, 2), woodMat);
    beam.position.set(0, 9.0, 0);
    g.add(beam);

    // Roof over gate
    const roofBase = this._mesh(new THREE.BoxGeometry(14, 0.4, 5), roofMat);
    roofBase.position.y = 10.5;
    g.add(roofBase);

    const roofSlope = this._mesh(new THREE.BoxGeometry(14, 2, 0.4), roofMat);
    roofSlope.position.set(0, 11.5, 2.5);
    roofSlope.rotation.x = -Utils.deg2rad(40);
    g.add(roofSlope);
    const roofSlopeB = roofSlope.clone();
    roofSlopeB.position.set(0, 11.5, -2.5);
    roofSlopeB.rotation.x = Utils.deg2rad(40);
    g.add(roofSlopeB);

    // Gate sign board
    const sign = this._mesh(new THREE.BoxGeometry(8, 1.8, 0.2), woodMat);
    sign.position.set(0, 7.5, 0.6);
    g.add(sign);
    const signBorder = this._mesh(new THREE.BoxGeometry(8.4, 2.2, 0.15), goldMat);
    signBorder.position.set(0, 7.5, 0.55);
    g.add(signBorder);

    // Stone base
    const stoneBase = this._mesh(new THREE.BoxGeometry(14, 1, 4), stoneMat);
    stoneBase.position.y = 0.5;
    g.add(stoneBase);
  }

  // ── PERIMETER WALLS ──
  _buildWalls() {
    const wallMat = this._phong(0xd4b896, { map: this.textures.stone });
    const wallH = 3.5;
    const wallT = 0.6;
    const wallLen = 80;

    const walls = [
      { pos: [0, wallH / 2, -45], rot: 0, w: 32, h: wallH, d: wallT },
      { pos: [0, wallH / 2, 45], rot: 0, w: 32, h: wallH, d: wallT },
      { pos: [-16, wallH / 2, 0], rot: 0, w: wallT, h: wallH, d: 90 },
      { pos: [16, wallH / 2, 0], rot: 0, w: wallT, h: wallH, d: 90 },
    ];

    walls.forEach(w => {
      const wall = this._mesh(new THREE.BoxGeometry(w.w, w.h, w.d), wallMat);
      wall.position.set(...w.pos);
      this.scene.add(wall);
    });

    // Wall battlements
    for (let i = -7; i <= 7; i++) {
      [-45.3, 45.3].forEach(z => {
        const bat = this._mesh(new THREE.BoxGeometry(1.2, 0.8, 0.7), wallMat);
        bat.position.set(i * 2, wallH + 0.4, z);
        this.scene.add(bat);
      });
    }
  }

  // ── LANTERNS ──
  _buildLanterns() {
    this.lanterns = [];
    const positions = [
      [-8, 0], [8, 0], [-8, -10], [8, -10],
      [-8, 10], [8, 10], [0, 15], [0, -8],
      [-12, -4], [12, -4],
    ];

    positions.forEach(([lx, lz]) => {
      const g = new THREE.Group();
      g.position.set(lx, 0, lz);
      this.scene.add(g);

      const postMat = this._phong(0x3d1f0f);
      const lanMat  = new THREE.MeshPhongMaterial({
        color: 0xff2200, transparent: true, opacity: 0.85, shininess: 40
      });
      const goldMat = this._phong(0xd4a017);
      const ropeMat = this._mat(0x8b6914);

      // Post
      const post = this._mesh(new THREE.CylinderGeometry(0.06, 0.08, 3.5, 6), postMat);
      post.position.y = 1.75;
      g.add(post);

      // Lantern body
      const lanGroup = new THREE.Group();
      lanGroup.position.y = 3.8;
      g.add(lanGroup);

      const lanBody = this._mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.45, 8), lanMat);
      lanGroup.add(lanBody);

      // Top/bottom caps
      const cap = this._mesh(new THREE.CylinderGeometry(0.28, 0.22, 0.12, 8), goldMat);
      cap.position.y = 0.27;
      lanGroup.add(cap);
      const capBot = cap.clone();
      capBot.position.y = -0.27;
      lanGroup.add(capBot);

      // Tassel
      for (let t = 0; t < 4; t++) {
        const angle = (t / 4) * Math.PI * 2;
        const tassel = this._mesh(new THREE.CylinderGeometry(0.012, 0.002, 0.4, 4), ropeMat);
        tassel.position.set(Math.sin(angle) * 0.2, -0.65, Math.cos(angle) * 0.2);
        lanGroup.add(tassel);
      }

      // Point light
      const light = new THREE.PointLight(0xff4400, 0.4, 6);
      light.position.y = 3.7;
      g.add(light);

      this.lanterns.push({ group: lanGroup, light, phase: Math.random() * Math.PI * 2 });
    });
  }

  // ── TREES ──
  _buildTrees() {
    const treePositions = [
      [-12, -15], [12, -15], [-14, -5], [14, -5],
      [-13, 5], [13, 5], [-14, 15], [14, 15],
      [-6, 28], [6, 28], [-10, 28], [10, 28],
      [-16, -30], [16, -30], [0, -40], [-5, -38], [5, -38],
    ];

    const trunkMat = this._phong(0x3d2010);
    const leafMats = [
      this._mat(0x1a4d10), this._mat(0x2d6b1a),
      this._mat(0x3a7a20), this._mat(0x4a6015),
    ];

    treePositions.forEach(([tx, tz]) => {
      const g = new THREE.Group();
      g.position.set(tx, 0, tz);
      this.scene.add(g);
      this._addCollider(tx, tz, 0.6, 0.6);

      const h = Utils.rand(3, 6);
      const trunk = this._mesh(new THREE.CylinderGeometry(0.15, 0.22, h, 6), trunkMat);
      trunk.position.y = h / 2;
      g.add(trunk);

      // Branch layers
      const layers = Utils.randInt(2, 4);
      for (let i = 0; i < layers; i++) {
        const r = Utils.rand(0.8, 1.6) - i * 0.25;
        const leafMat = leafMats[Utils.randInt(0, 3)];
        const cluster = this._mesh(new THREE.SphereGeometry(r, 7, 5), leafMat);
        cluster.position.y = h * 0.6 + i * r * 0.7;
        cluster.scale.y = 0.75;
        g.add(cluster);
      }

      // Top cluster
      const topCluster = this._mesh(
        new THREE.ConeGeometry(0.7, 1.8, 7),
        leafMats[Utils.randInt(0, 3)]
      );
      topCluster.position.y = h + 0.5;
      g.add(topCluster);
    });

    // Bamboo groves
    const bambooPositions = [[-4, 35], [4, 35], [-15, 20], [15, 20]];
    bambooPositions.forEach(([bx, bz]) => {
      for (let i = 0; i < 6; i++) {
        const g = new THREE.Group();
        g.position.set(bx + Utils.rand(-1, 1), 0, bz + Utils.rand(-1, 1));
        this.scene.add(g);
        const bh = Utils.rand(4, 8);
        const bamboo = this._mesh(
          new THREE.CylinderGeometry(0.04, 0.06, bh, 5),
          this._mat(0x5a8a30)
        );
        bamboo.position.y = bh / 2;
        g.add(bamboo);
        // Bamboo nodes
        for (let n = 0; n < 4; n++) {
          const node = this._mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 0.06, 5),
            this._mat(0x3d6020)
          );
          node.position.y = (bh / 4) * n + bh / 8;
          g.add(node);
        }
        // Leaves
        for (let l = 0; l < 3; l++) {
          const leaf = this._mesh(
            new THREE.BoxGeometry(0.5, 0.06, 0.12),
            this._mat(0x4a7a28)
          );
          const la = Utils.rand(0, Math.PI * 2);
          leaf.position.set(Math.sin(la) * 0.4, bh * 0.7 + l * 0.8, Math.cos(la) * 0.4);
          leaf.rotation.y = la;
          leaf.rotation.z = Utils.deg2rad(-20);
          g.add(leaf);
        }
      }
    });
  }

  // ── SKY DOME ──
  _buildSkyDome() {
    const sky = new THREE.Mesh(
      new THREE.SphereGeometry(180, 20, 12),
      new THREE.MeshBasicMaterial({
        color: 0x1a0a30,
        side: THREE.BackSide,
      })
    );
    this.scene.add(sky);

    // Stars
    const starCount = 800;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 160;
      starPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = Math.abs(r * Math.cos(phi));
      starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPos, 3));
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({ color: 0xffffff, size: 0.5, sizeAttenuation: true })
    );
    this.scene.add(stars);

    // Moon
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(5, 12, 10),
      new THREE.MeshBasicMaterial({ color: 0xffffdd })
    );
    moon.position.set(60, 100, -120);
    this.scene.add(moon);

    // Moon glow
    const moonGlow = new THREE.PointLight(0xffeebb, 0.3, 300);
    moonGlow.position.copy(moon.position);
    this.scene.add(moonGlow);
  }

  // ── LIGHTING ──
  _buildLighting() {
    // Ambient
    const ambient = new THREE.AmbientLight(0x301820, 0.8);
    this.scene.add(ambient);

    // Main directional (moon)
    const dirLight = new THREE.DirectionalLight(0xaabbdd, 0.6);
    dirLight.position.set(30, 50, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 150;
    dirLight.shadow.camera.left = -40;
    dirLight.shadow.camera.right = 40;
    dirLight.shadow.camera.top = 40;
    dirLight.shadow.camera.bottom = -40;
    this.scene.add(dirLight);

    // Warm temple glow
    const warmLight = new THREE.PointLight(0xff8822, 0.5, 40);
    warmLight.position.set(0, 8, -40);
    this.scene.add(warmLight);

    // Courtyard fill
    const fillLight = new THREE.PointLight(0x4488ff, 0.2, 60);
    fillLight.position.set(0, 15, 0);
    this.scene.add(fillLight);
  }

  // ── WATER FEATURE ──
  _buildWaterFeature() {
    const g = new THREE.Group();
    g.position.set(0, 0, 24);
    this.scene.add(g);

    const pondMat = new THREE.MeshPhongMaterial({
      color: 0x0a2a4a, shininess: 120, reflectivity: 0.8,
    });
    const stoneMat = this._phong(0x888070, { map: this.textures.stone });

    // Pond basin
    const basin = this._mesh(new THREE.CylinderGeometry(3.5, 3.5, 0.5, 16), stoneMat);
    basin.position.y = 0.25;
    g.add(basin);

    // Water surface
    const water = new THREE.Mesh(new THREE.CircleGeometry(3.2, 20), pondMat);
    water.rotation.x = -Math.PI / 2;
    water.position.y = 0.5;
    g.add(water);
    this.water = water;

    // Lotus flowers
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const lx = Math.sin(angle) * 1.8;
      const lz = Math.cos(angle) * 1.8;
      const lotusMat = this._mat(0xff9999);
      const lotus = this._mesh(new THREE.ConeGeometry(0.25, 0.3, 8), lotusMat);
      lotus.position.set(lx, 0.55, lz);
      g.add(lotus);
    }
  }

  // ── DECORATIONS ──
  _buildDecorations() {
    // Stone lion guardian statues
    [[-6, 20], [6, 20]].forEach(([lx, lz], i) => {
      const g = new THREE.Group();
      g.position.set(lx, 0, lz);
      g.rotation.y = i === 0 ? -Math.PI / 4 : Math.PI / 4;
      this.scene.add(g);
      this._addCollider(lx, lz, 0.7, 0.7);

      const stoneMat = this._phong(0x888070);

      // Pedestal
      const ped = this._mesh(new THREE.BoxGeometry(1.5, 1.0, 1.5), stoneMat);
      ped.position.y = 0.5;
      g.add(ped);
      // Body
      const body = this._mesh(new THREE.BoxGeometry(1.0, 1.2, 1.4), stoneMat);
      body.position.y = 1.6;
      g.add(body);
      // Head
      const head = this._mesh(new THREE.SphereGeometry(0.45, 8, 7), stoneMat);
      head.position.set(0, 2.6, 0.4);
      g.add(head);
      // Mane
      const mane = this._mesh(new THREE.SphereGeometry(0.52, 8, 7), stoneMat);
      mane.scale.set(1.1, 0.9, 0.9);
      mane.position.set(0, 2.5, 0.2);
      g.add(mane);
      // Tail
      const tail = this._mesh(new THREE.CylinderGeometry(0.08, 0.04, 1.0, 5), stoneMat);
      tail.position.set(0, 2.1, -0.8);
      tail.rotation.x = -Utils.deg2rad(60);
      g.add(tail);
    });

    // Prayer flag poles
    [[-14, -10], [14, -10]].forEach(([fx, fz]) => {
      const g = new THREE.Group();
      g.position.set(fx, 0, fz);
      this.scene.add(g);

      const pole = this._mesh(new THREE.CylinderGeometry(0.05, 0.07, 8, 5), this._mat(0x8b6914));
      pole.position.y = 4;
      g.add(pole);

      const flagColors = [0xff0000, 0xffff00, 0xffffff, 0x00aa44, 0x0000cc];
      flagColors.forEach((color, i) => {
        const flag = this._mesh(
          new THREE.BoxGeometry(1.2, 0.5, 0.01),
          this._mat(color)
        );
        flag.position.set(0.6, 7.5 - i * 0.8, 0);
        g.add(flag);
      });
    });

    // Stone lantern pillars along path
    for (let i = -2; i <= 2; i++) {
      [-3, 3].forEach(side => {
        const g = new THREE.Group();
        g.position.set(side * 3, 0, i * 7 + 3);
        this.scene.add(g);
        const stoneMat = this._phong(0x888070);
        const pillar = this._mesh(new THREE.BoxGeometry(0.5, 2.5, 0.5), stoneMat);
        pillar.position.y = 1.25;
        g.add(pillar);
        const top = this._mesh(new THREE.BoxGeometry(0.8, 0.5, 0.8), stoneMat);
        top.position.y = 2.75;
        g.add(top);
        const glow = new THREE.PointLight(0xffaa44, 0.2, 4);
        glow.position.y = 2.8;
        g.add(glow);
      });
    }
  }

  // ── UPDATE ──
  update(time) {
    // Flicker lanterns
    if (this.lanterns) {
      this.lanterns.forEach(lan => {
        const flicker = 0.3 + Math.sin(time * 3 + lan.phase) * 0.1 + Math.sin(time * 7.3 + lan.phase) * 0.04;
        lan.light.intensity = flicker;
        lan.group.rotation.y = Math.sin(time * 0.5 + lan.phase) * 0.05;
      });
    }

    // Incense light flicker
    if (this.incenseLight) {
      this.incenseLight.intensity = 0.5 + Math.sin(time * 4) * 0.1 + Math.sin(time * 11) * 0.05;
    }

    // Water shimmer
    if (this.water) {
      this.water.material.color.setHSL(0.6, 0.8, 0.08 + Math.sin(time * 0.5) * 0.02);
    }
  }

  // ── COLLISION CHECK ──
  checkCollision(x, z, radius = 0.5) {
    for (const col of this.collidables) {
      const dx = Math.abs(x - col.x);
      const dz = Math.abs(z - col.z);
      if (dx < col.hw + radius && dz < col.hd + radius) {
        return true;
      }
    }
    return false;
  }
}
