// ===== CHARACTER.JS - Fixed: baseHeight, prayer hands, kneel pose =====

class Character {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.parts = {};

    this.pose = 0;
    this.walkCycle = 0;
    this.facingAngle = 0;

    // baseHeight: nâng nhân vật để chân chạm đất (y=0)
    // Tổng chiều cao từ chân đến gốc root ≈ 1.1 units
    this.baseHeight = 1.1;

    this.mat = {
      skin:      new THREE.MeshPhongMaterial({ color: 0xd4956a, shininess: 20 }),
      robe:      new THREE.MeshLambertMaterial({ color: 0xf5a623 }),
      robeDark:  new THREE.MeshLambertMaterial({ color: 0xc47d10 }),
      eye:       new THREE.MeshPhongMaterial({ color: 0x1a1a2e, shininess: 60 }),
      eyeWhite:  new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 40 }),
      hair:      new THREE.MeshLambertMaterial({ color: 0x1a0a00 }),
      incense:   new THREE.MeshLambertMaterial({ color: 0x8b5a2b }),
      incenseGlow: new THREE.MeshPhongMaterial({ color: 0xff6600, emissive: 0xff3300, emissiveIntensity: 0.8 }),
      sandal:    new THREE.MeshLambertMaterial({ color: 0x8b6914 }),
      nail:      new THREE.MeshPhongMaterial({ color: 0xc9a98a, shininess: 30 }),
      lip:       new THREE.MeshPhongMaterial({ color: 0xb05a4a, shininess: 15 }),
    };

    this._build();
    this.scene.add(this.group);
  }

  _mesh(geo, mat) {
    const m = new THREE.Mesh(geo, mat);
    m.castShadow = true;
    return m;
  }

  _build() {
    // Root pivot - nâng lên baseHeight để chân chạm đất
    this.root = new THREE.Group();
    this.root.position.y = this.baseHeight;
    this.group.add(this.root);

    // Torso group (gốc của toàn bộ skeleton)
    this.torso = new THREE.Group();
    this.root.add(this.torso);

    // ── THÂN MÌNH ──
    const body = this._mesh(new THREE.CylinderGeometry(0.19, 0.22, 0.52, 10), this.mat.robe);
    body.position.y = 0.26;
    this.torso.add(body);

    // Chi tiết áo chéo trước ngực
    [-0.06, 0.06].forEach(x => {
      const fold = this._mesh(new THREE.BoxGeometry(0.04, 0.38, 0.012), this.mat.robeDark);
      fold.position.set(x, 0.28, 0.19);
      fold.rotation.z = x < 0 ? 0.1 : -0.1;
      this.torso.add(fold);
    });

    // Thắt lưng
    const belt = this._mesh(new THREE.CylinderGeometry(0.215, 0.215, 0.06, 10), this.mat.robeDark);
    belt.position.y = 0.10;
    this.torso.add(belt);

    // ── VÁY / HÔNG ──
    const hips = this._mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.38, 10), this.mat.robe);
    hips.position.y = -0.19;
    this.torso.add(hips);

    // Nếp gấp váy
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const fold = this._mesh(new THREE.BoxGeometry(0.025, 0.32, 0.018), this.mat.robeDark);
      fold.position.set(Math.sin(angle) * 0.21, -0.19, Math.cos(angle) * 0.21);
      fold.rotation.y = angle;
      this.torso.add(fold);
    }

    // ── ĐẦU ──
    this.headGroup = new THREE.Group();
    this.headGroup.position.set(0, 0.62, 0);
    this.torso.add(this.headGroup);
    this._buildHead();

    // ── VAI & CÁNH TAY ──
    this.shoulderL = new THREE.Group(); this.shoulderL.position.set(-0.235, 0.46, 0); this.torso.add(this.shoulderL);
    this.shoulderR = new THREE.Group(); this.shoulderR.position.set( 0.235, 0.46, 0); this.torso.add(this.shoulderR);

    this.upperArmL = new THREE.Group(); this.shoulderL.add(this.upperArmL);
    this.upperArmR = new THREE.Group(); this.shoulderR.add(this.upperArmR);

    this.forearmL = new THREE.Group(); this.forearmL.position.y = -0.26; this.upperArmL.add(this.forearmL);
    this.forearmR = new THREE.Group(); this.forearmR.position.y = -0.26; this.upperArmR.add(this.forearmR);

    this.handL = new THREE.Group(); this.handL.position.y = -0.24; this.forearmL.add(this.handL);
    this.handR = new THREE.Group(); this.handR.position.y = -0.24; this.forearmR.add(this.handR);

    // Vai
    [this.shoulderL, this.shoulderR].forEach(s => {
      s.add(this._mesh(new THREE.SphereGeometry(0.065, 8, 6), this.mat.robe));
    });

    // Cánh tay trên
    const uaGeo = new THREE.CylinderGeometry(0.048, 0.042, 0.26, 8);
    const uaL = this._mesh(uaGeo, this.mat.robe); uaL.position.y = -0.13; this.upperArmL.add(uaL);
    const uaR = this._mesh(uaGeo, this.mat.robe); uaR.position.y = -0.13; this.upperArmR.add(uaR);

    // Cẳng tay
    const faGeo = new THREE.CylinderGeometry(0.038, 0.030, 0.24, 8);
    const faL = this._mesh(faGeo, this.mat.skin); faL.position.y = -0.12; this.forearmL.add(faL);
    const faR = this._mesh(faGeo, this.mat.skin); faR.position.y = -0.12; this.forearmR.add(faR);

    // Ống tay áo rộng (Wide sleeves)
    const sleeveGeo = new THREE.CylinderGeometry(0.06, 0.13, 0.27, 8);
    const sleeveL = this._mesh(sleeveGeo, this.mat.robe); sleeveL.position.y = -0.09; this.forearmL.add(sleeveL);
    const sleeveR = this._mesh(sleeveGeo, this.mat.robe); sleeveR.position.y = -0.09; this.forearmR.add(sleeveR);

    // Bàn tay bình thường (chỉ hiện ở tư thế đứng)
    this._buildNormalHand(this.handL, 'L');
    this._buildNormalHand(this.handR, 'R');

    // ── CHÂN ──
    this.thighL = new THREE.Group(); this.thighL.position.set(-0.10, -0.35, 0); this.torso.add(this.thighL);
    this.thighR = new THREE.Group(); this.thighR.position.set( 0.10, -0.35, 0); this.torso.add(this.thighR);

    this.calfL = new THREE.Group(); this.calfL.position.y = -0.32; this.thighL.add(this.calfL);
    this.calfR = new THREE.Group(); this.calfR.position.y = -0.32; this.thighR.add(this.calfR);

    this.footL = new THREE.Group(); this.footL.position.y = -0.28; this.calfL.add(this.footL);
    this.footR = new THREE.Group(); this.footR.position.y = -0.28; this.calfR.add(this.footR);

    // Đùi
    const thGeo = new THREE.CylinderGeometry(0.085, 0.07, 0.32, 8);
    const thL = this._mesh(thGeo, this.mat.robe); thL.position.y = -0.16; this.thighL.add(thL);
    const thR = this._mesh(thGeo, this.mat.robe); thR.position.y = -0.16; this.thighR.add(thR);

    // Bắp chân
    const caGeo = new THREE.CylinderGeometry(0.060, 0.048, 0.28, 8);
    const caL = this._mesh(caGeo, this.mat.skin); caL.position.y = -0.14; this.calfL.add(caL);
    const caR = this._mesh(caGeo, this.mat.skin); caR.position.y = -0.14; this.calfR.add(caR);

    // Bàn chân / dép
    const footGeo = new THREE.BoxGeometry(0.10, 0.055, 0.20);
    const fL = this._mesh(footGeo, this.mat.sandal); fL.position.set(0, -0.03, 0.04); this.footL.add(fL);
    const fR = this._mesh(footGeo, this.mat.sandal); fR.position.set(0, -0.03, 0.04); this.footR.add(fR);

    // Ngón chân (3 ngón nhỏ)
    [this.footL, this.footR].forEach(foot => {
      for (let t = 0; t < 3; t++) {
        const toe = this._mesh(new THREE.SphereGeometry(0.016, 5, 4), this.mat.skin);
        toe.position.set((t - 1) * 0.03, -0.025, 0.11);
        foot.add(toe);
      }
    });

    // ── BÀN TAY CHẮP (100% khép sát) - dùng cho tư thế 1, 2, 3 ──
    this._buildPrayerHands();

    // Đặt tư thế ban đầu
    this._applyPoseImmediate(0);
  }

  _buildHead() {
    const h = this.headGroup;

    // Đầu (hơi bầu dục)
    const headGeo = new THREE.SphereGeometry(0.155, 16, 14);
    headGeo.scale(1.0, 1.1, 0.96);
    h.add(this._mesh(headGeo, this.mat.skin));

    // Cổ
    const neck = this._mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.10, 8), this.mat.skin);
    neck.position.set(0, -0.13, 0);
    h.add(neck);

    // Tai + dái tai
    [[-0.16, 1], [0.16, -1]].forEach(([x]) => {
      const earGeo = new THREE.SphereGeometry(0.055, 8, 6); earGeo.scale(0.5, 0.8, 0.4);
      const ear = this._mesh(earGeo, this.mat.skin); ear.position.set(x, 0, 0); h.add(ear);
      const lobe = this._mesh(new THREE.SphereGeometry(0.03, 6, 5), this.mat.skin);
      lobe.position.set(x, -0.05, 0); h.add(lobe);
    });

    // Tóc (kiểu nhà sư cạo trọc)
    const hair = this._mesh(new THREE.SphereGeometry(0.158, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), this.mat.hair);
    hair.position.y = 0.02; h.add(hair);

    // Nhục kế (bướu trí tuệ)
    const ush = this._mesh(new THREE.SphereGeometry(0.04, 8, 6), this.mat.hair);
    ush.position.set(0, 0.15, 0); h.add(ush);

    // Lông mày
    [[-0.065, 1], [0.065, -1]].forEach(([x, s]) => {
      const brow = this._mesh(new THREE.BoxGeometry(0.06, 0.012, 0.01), this.mat.hair);
      brow.position.set(x, 0.055, 0.148); brow.rotation.z = s * Utils.deg2rad(5); h.add(brow);
    });

    // Mắt: lòng trắng
    [[-0.065], [0.065]].forEach(([x]) => {
      const ew = this._mesh(new THREE.SphereGeometry(0.032, 10, 8), this.mat.eyeWhite);
      ew.position.set(x, 0.02, 0.143); h.add(ew);
      // Tròng đen
      const iris = new THREE.Mesh(new THREE.CircleGeometry(0.018, 10),
        new THREE.MeshPhongMaterial({ color: 0x3a2000, shininess: 80 }));
      iris.position.set(x, 0.02, 0.175); h.add(iris);
      // Con ngươi
      const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.009, 8),
        new THREE.MeshBasicMaterial({ color: 0x000000 }));
      pupil.position.set(x, 0.02, 0.176); h.add(pupil);
      // Ánh sáng mắt
      const shine = new THREE.Mesh(new THREE.CircleGeometry(0.005, 6),
        new THREE.MeshBasicMaterial({ color: 0xffffff }));
      shine.position.set(x + 0.006 * Math.sign(x), 0.025, 0.177); h.add(shine);
    });

    // Mũi
    const noseGeo = new THREE.SphereGeometry(0.022, 8, 6); noseGeo.scale(1, 0.75, 0.8);
    const nose = this._mesh(noseGeo, this.mat.skin); nose.position.set(0, -0.012, 0.155); h.add(nose);
    // Lỗ mũi
    [[-0.013], [0.013]].forEach(([x]) => {
      const nost = this._mesh(new THREE.SphereGeometry(0.009, 6, 5),
        new THREE.MeshLambertMaterial({ color: 0xb5745a }));
      nost.position.set(x, -0.018, 0.163); h.add(nost);
    });

    // Môi
    const upLip = this._mesh(new THREE.BoxGeometry(0.075, 0.016, 0.015), this.mat.lip);
    upLip.position.set(0, -0.05, 0.152); h.add(upLip);
    const loLip = this._mesh(new THREE.SphereGeometry(0.028, 8, 5), this.mat.lip);
    loLip.scale.set(1.3, 0.6, 0.5); loLip.position.set(0, -0.065, 0.153); h.add(loLip);

    // Cằm
    const chin = this._mesh(new THREE.SphereGeometry(0.03, 8, 6), this.mat.skin);
    chin.scale.set(1.2, 0.7, 0.8); chin.position.set(0, -0.11, 0.1); h.add(chin);
  }

  _buildNormalHand(handGroup, side) {
    // Lòng bàn tay
    const palm = this._mesh(new THREE.BoxGeometry(0.075, 0.022, 0.085), this.mat.skin);
    palm.position.y = -0.011; handGroup.add(palm);

    // 4 ngón tay
    const fingerData = [
      { x: -0.028, z: -0.05, len: 0.065 },
      { x: -0.009, z: -0.055, len: 0.072 },
      { x:  0.010, z: -0.053, len: 0.068 },
      { x:  0.028, z: -0.048, len: 0.058 },
    ];
    fingerData.forEach(fd => {
      const fgp = new THREE.Group();
      fgp.position.set(fd.x, -0.022, fd.z);
      handGroup.add(fgp);
      for (let p = 0; p < 3; p++) {
        const ph = this._mesh(new THREE.CylinderGeometry(0.009 - p * 0.001, 0.009, fd.len / 3, 6), this.mat.skin);
        ph.position.y = -(fd.len / 3) * p - fd.len / 6; fgp.add(ph);
        if (p === 2) {
          const nail = this._mesh(new THREE.BoxGeometry(0.012, 0.003, 0.01), this.mat.nail);
          nail.position.set(0, -(fd.len / 3) * p - fd.len / 3 + 0.003, -0.006); fgp.add(nail);
        }
      }
    });

    // Ngón cái
    const thumb = new THREE.Group();
    const ts = side === 'L' ? 1 : -1;
    thumb.position.set(-0.04 * ts, -0.01, -0.01);
    thumb.rotation.z = Utils.deg2rad(50 * ts);
    thumb.rotation.x = Utils.deg2rad(-30);
    handGroup.add(thumb);
    for (let p = 0; p < 2; p++) {
      const ph = this._mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.034, 6), this.mat.skin);
      ph.position.y = -0.034 * p - 0.017; thumb.add(ph);
    }
  }

  // ── BÀN TAY CHẮP 100% (hai lòng bàn tay khép hoàn toàn) ──
  _buildPrayerHands() {
    // Group này gắn vào torso, đặt trước ngực
    // Vị trí: y=0.36 (giữa ngực), z=0.35 (phía trước, tránh bị thân che)
    this.prayerHandsGroup = new THREE.Group();
    this.prayerHandsGroup.position.set(0, 0.36, 0.35);
    this.prayerHandsGroup.visible = false;
    this.torso.add(this.prayerHandsGroup);

    // Hai lòng bàn tay khép sát nhau hoàn toàn
    // Đặt theo trục: ngón tay hướng lên (+Y), lòng bàn tay đối diện nhau (±X)
    // Trái: lòng bàn tay hướng về +X (mặt trong nhìn sang phải)
    // Phải: lòng bàn tay hướng về -X (mặt trong nhìn sang trái)

    const palmW = 0.072, palmH = 0.095, palmD = 0.016;

    // Lòng bàn tay trái (x < 0)
    const palmLGeo = new THREE.BoxGeometry(palmD, palmH, palmW);
    const palmL = this._mesh(palmLGeo, this.mat.skin);
    palmL.position.set(-0.008, 0, 0); // sát vào trung tâm
    this.prayerHandsGroup.add(palmL);

    // Lòng bàn tay phải (x > 0)
    const palmRGeo = new THREE.BoxGeometry(palmD, palmH, palmW);
    const palmR = this._mesh(palmRGeo, this.mat.skin);
    palmR.position.set(0.008, 0, 0);
    this.prayerHandsGroup.add(palmR);

    // 4 ngón tay (mỗi bên 4 ngón chĩa lên)
    const fingerLens = [0.068, 0.078, 0.082, 0.072, 0.058];
    const fingerZs   = [-0.028, -0.012, 0.004, 0.020, 0.034];
    for (let i = 0; i < 4; i++) {
      const fLen = fingerLens[i];
      const fz   = fingerZs[i];

      // Ngón tay trái
      const fingerL = this._mesh(
        new THREE.CylinderGeometry(0.007, 0.006, fLen, 6),
        this.mat.skin
      );
      fingerL.position.set(-0.008, palmH / 2 + fLen / 2 + 0.002, fz);
      this.prayerHandsGroup.add(fingerL);
      // Móng tay
      const nailL = this._mesh(new THREE.BoxGeometry(0.008, 0.003, 0.009), this.mat.nail);
      nailL.position.set(-0.013, palmH / 2 + fLen + 0.002, fz);
      this.prayerHandsGroup.add(nailL);

      // Ngón tay phải (mirror)
      const fingerR = this._mesh(
        new THREE.CylinderGeometry(0.007, 0.006, fLen, 6),
        this.mat.skin
      );
      fingerR.position.set(0.008, palmH / 2 + fLen / 2 + 0.002, fz);
      this.prayerHandsGroup.add(fingerR);
      const nailR = this._mesh(new THREE.BoxGeometry(0.008, 0.003, 0.009), this.mat.nail);
      nailR.position.set(0.013, palmH / 2 + fLen + 0.002, fz);
      this.prayerHandsGroup.add(nailR);
    }

    // Ngón cái (đặt chéo ra ngoài)
    const thumbL = this._mesh(new THREE.CylinderGeometry(0.009, 0.008, 0.055, 6), this.mat.skin);
    thumbL.rotation.z = Utils.deg2rad(35);
    thumbL.position.set(-0.038, palmH / 2 - 0.005, 0.036);
    this.prayerHandsGroup.add(thumbL);

    const thumbR = this._mesh(new THREE.CylinderGeometry(0.009, 0.008, 0.055, 6), this.mat.skin);
    thumbR.rotation.z = Utils.deg2rad(-35);
    thumbR.position.set(0.038, palmH / 2 - 0.005, 0.036);
    this.prayerHandsGroup.add(thumbR);

    // Cổ tay (nối với cẳng tay)
    const wristL = this._mesh(new THREE.CylinderGeometry(0.028, 0.030, 0.05, 8), this.mat.skin);
    wristL.position.set(-0.008, -palmH / 2 - 0.025, 0);
    this.prayerHandsGroup.add(wristL);
    const wristR = this._mesh(new THREE.CylinderGeometry(0.028, 0.030, 0.05, 8), this.mat.skin);
    wristR.position.set(0.008, -palmH / 2 - 0.025, 0);
    this.prayerHandsGroup.add(wristR);

    // ── 3 CÂY NHANG (chỉ hiện ở tư thế 2) ──
    this.prayerIncenseGroup = new THREE.Group();
    this.prayerIncenseGroup.position.y = palmH / 2 + 0.01; // ngay trên đầu ngón tay
    this.prayerIncenseGroup.visible = false;
    this.prayerHandsGroup.add(this.prayerIncenseGroup);

    const incensePositions = [-0.013, 0, 0.013];
    incensePositions.forEach((x, i) => {
      // Thân nhang
      const stick = this._mesh(
        new THREE.CylinderGeometry(0.003, 0.003, 0.22, 5),
        this.mat.incense
      );
      stick.position.set(x, 0.11, 0);
      this.prayerIncenseGroup.add(stick);

      // Đầu nhang cháy đỏ
      const tip = this._mesh(
        new THREE.SphereGeometry(0.005, 6, 5),
        this.mat.incenseGlow
      );
      tip.position.set(x, 0.225, 0);
      this.prayerIncenseGroup.add(tip);

      // Ánh sáng đỏ từ nhang
      const glow = new THREE.PointLight(0xff4400, 0.25, 0.5);
      glow.position.set(x, 0.225, 0);
      this.prayerIncenseGroup.add(glow);
    });
  }

  // ── TƯ THẾ (POSE DATA) ──
  _getPoseData(poseId) {
    // rootY: điều chỉnh chiều cao gốc relative với baseHeight
    // root thực tế = baseHeight + rootY
    const poses = {
      // 0: Đứng thường
      0: {
        torso: { x: 0, y: 0, z: 0 },
        shoulderL: { x: 0, y: 0, z: 0.10 },
        shoulderR: { x: 0, y: 0, z: -0.10 },
        upperArmL: { x: 0.08, y: 0, z: 0 },
        upperArmR: { x: 0.08, y: 0, z: 0 },
        forearmL: { x: -0.05, y: 0, z: 0 },
        forearmR: { x: -0.05, y: 0, z: 0 },
        handL: { x: 0, y: 0, z: 0 },
        handR: { x: 0, y: 0, z: 0 },
        thighL: { x: 0, y: 0, z: 0 },
        thighR: { x: 0, y: 0, z: 0 },
        calfL: { x: 0, y: 0, z: 0 },
        calfR: { x: 0, y: 0, z: 0 },
        rootY: 0,
        prayerHands: false,
        incense: false,
      },

      // 1: Chắp tay cầu nguyện
      // Khuỷu tay ra ngoài → cẳng tay gập lên → tay chắp trước ngực
      1: {
        torso: { x: -0.08, y: 0, z: 0 },
        // Vai: đưa thẳng tay ra trước (âm là ra trước)
        shoulderL: { x: -1.2, y: 0, z: 0 },
        shoulderR: { x: -1.2, y: 0, z: 0 },
        upperArmL: { x: 0, y: 0, z: 0 },
        upperArmR: { x: 0, y: 0, z: 0 },
        // Cẳng tay: gập ngang vào trong ngực để chạm bàn tay
        forearmL: { x: 0, y: 0, z: 1.2 },
        forearmR: { x: 0, y: 0, z: -1.2 },
        handL: { x: 0, y: 0, z: 0 },
        handR: { x: 0, y: 0, z: 0 },
        thighL: { x: 0, y: 0, z: 0 },
        thighR: { x: 0, y: 0, z: 0 },
        calfL: { x: 0, y: 0, z: 0 },
        calfR: { x: 0, y: 0, z: 0 },
        rootY: 0,
        prayerHands: true,
        incense: false,
        prayerY: 0.43,
        prayerZ: 0.32,
      },

      // 2: Dâng nhang (tay cao hơn tư thế 1)
      2: {
        torso: { x: -0.12, y: 0, z: 0 },
        shoulderL: { x: -1.5, y: 0, z: 0 },
        shoulderR: { x: -1.5, y: 0, z: 0 },
        upperArmL: { x: 0, y: 0, z: 0 },
        upperArmR: { x: 0, y: 0, z: 0 },
        forearmL: { x: 0, y: 0, z: 1.2 },
        forearmR: { x: 0, y: 0, z: -1.2 },
        handL: { x: 0, y: 0, z: 0 },
        handR: { x: 0, y: 0, z: 0 },
        thighL: { x: 0, y: 0, z: 0 },
        thighR: { x: 0, y: 0, z: 0 },
        calfL: { x: 0, y: 0, z: 0 },
        calfR: { x: 0, y: 0, z: 0 },
        rootY: 0,
        prayerHands: true,
        incense: true,
        // Dâng nhang cao hơn
        prayerY: 0.53,
        prayerZ: 0.33,
      },

      // 3: Quỳ lạy
      // KHÔNG dùng rootY âm nhiều → dùng baseHeight để giữ trên mặt đất
      // Quỳ: đùi thẳng xuống, cẳng chân gập ra sau, hạ người xuống
      3: {
        torso: { x: 0.35, y: 0, z: 0 },
        // Tay đưa thẳng ra trước
        shoulderL: { x: -1.2, y: 0, z: 0 },
        shoulderR: { x: -1.2, y: 0, z: 0 },
        upperArmL: { x: 0, y: 0, z: 0 },
        upperArmR: { x: 0, y: 0, z: 0 },
        // Gập cẳng tay vào trong
        forearmL: { x: 0, y: 0, z: 1.2 },
        forearmR: { x: 0, y: 0, z: -1.2 },
        handL: { x: 0, y: 0, z: 0 },
        handR: { x: 0, y: 0, z: 0 },
        // Đùi hướng thẳng xuống và hơi dạng ra
        thighL: { x: -0.35, y: 0, z: -0.15 },
        thighR: { x: -0.35, y: 0, z: 0.15 },
        // Cẳng chân nằm ngang trên mặt đất và vạt ngang ra ngoài để người chơi nhìn thấy
        calfL: { x: 1.57, y: 0, z: 0.8 },
        calfR: { x: 1.57, y: 0, z: -0.8 },
        // Giữ nguyên độ cao để đầu gối vừa chạm đất, tà áo không che mất
        rootY: -0.45,
        prayerHands: true,
        incense: false,
        prayerY: 0.33,
        prayerZ: 0.32,
      },
    };
    return poses[poseId];
  }

  _applyPoseRaw(p) {
    const sr = (obj, rx, ry, rz) => obj.rotation.set(rx, ry, rz);

    sr(this.torso,     p.torso.x,     p.torso.y,     p.torso.z);
    sr(this.shoulderL, p.shoulderL.x, p.shoulderL.y, p.shoulderL.z);
    sr(this.shoulderR, p.shoulderR.x, p.shoulderR.y, p.shoulderR.z);
    sr(this.upperArmL, p.upperArmL.x, p.upperArmL.y, p.upperArmL.z);
    sr(this.upperArmR, p.upperArmR.x, p.upperArmR.y, p.upperArmR.z);
    sr(this.forearmL,  p.forearmL.x,  p.forearmL.y,  p.forearmL.z);
    sr(this.forearmR,  p.forearmR.x,  p.forearmR.y,  p.forearmR.z);
    sr(this.handL,     p.handL.x,     p.handL.y,     p.handL.z);
    sr(this.handR,     p.handR.x,     p.handR.y,     p.handR.z);
    sr(this.thighL,    p.thighL.x,    p.thighL.y,    p.thighL.z);
    sr(this.thighR,    p.thighR.x,    p.thighR.y,    p.thighR.z);
    sr(this.calfL,     p.calfL.x,     p.calfL.y,     p.calfL.z);
    sr(this.calfR,     p.calfR.x,     p.calfR.y,     p.calfR.z);

    // root.y = baseHeight + rootY → không bao giờ âm vào đất
    this.root.position.y = this.baseHeight + p.rootY;

    // Bàn tay chắp riêng
    const usePrayer = p.prayerHands === true;
    this.prayerHandsGroup.visible = usePrayer;
    this.handL.visible = !usePrayer;
    this.handR.visible = !usePrayer;

    // Điều chỉnh vị trí bàn tay chắp theo tư thế
    if (usePrayer) {
      this.prayerHandsGroup.position.y = p.prayerY !== undefined ? p.prayerY : 0.36;
      this.prayerHandsGroup.position.z = p.prayerZ !== undefined ? p.prayerZ : 0.24;
    }

    // Nhang
    this.prayerIncenseGroup.visible = p.incense === true;
  }

  _applyPoseImmediate(poseId) {
    const p = this._getPoseData(poseId);
    this._applyPoseRaw(p);
  }

  _lerpPose(pA, pB, t) {
    const L = (a, b) => Utils.lerp(a, b, t);
    const LO = (a, b) => ({ x: L(a.x, b.x), y: L(a.y, b.y), z: L(a.z, b.z) });
    return {
      torso:     LO(pA.torso,     pB.torso),
      shoulderL: LO(pA.shoulderL, pB.shoulderL),
      shoulderR: LO(pA.shoulderR, pB.shoulderR),
      upperArmL: LO(pA.upperArmL, pB.upperArmL),
      upperArmR: LO(pA.upperArmR, pB.upperArmR),
      forearmL:  LO(pA.forearmL,  pB.forearmL),
      forearmR:  LO(pA.forearmR,  pB.forearmR),
      handL:     LO(pA.handL,     pB.handL),
      handR:     LO(pA.handR,     pB.handR),
      thighL:    LO(pA.thighL,    pB.thighL),
      thighR:    LO(pA.thighR,    pB.thighR),
      calfL:     LO(pA.calfL,     pB.calfL),
      calfR:     LO(pA.calfR,     pB.calfR),
      rootY:     L(pA.rootY,      pB.rootY),
      prayerHands: t > 0.5 ? pB.prayerHands : pA.prayerHands,
      incense:   t > 0.5 ? pB.incense : pA.incense,
      prayerY:   L(pA.prayerY || 0.36, pB.prayerY || 0.36),
      prayerZ:   L(pA.prayerZ || 0.24, pB.prayerZ || 0.24),
    };
  }

  setPose(id) {
    if (this.pose === id) return;
    this._prevPose = this.pose;
    this.pose = id;
    this._poseBlendStart = performance.now();
    this._poseBlendDuration = 450;
  }

  update(dt, moveDir, speed) {
    const now = performance.now();

    // Blend pose
    if (this._poseBlendStart !== undefined) {
      const elapsed = now - this._poseBlendStart;
      const t = Utils.clamp(elapsed / this._poseBlendDuration, 0, 1);
      const st = Utils.smoothstep(t);
      const pA = this._getPoseData(this._prevPose !== undefined ? this._prevPose : 0);
      const pB = this._getPoseData(this.pose);
      this._applyPoseRaw(this._lerpPose(pA, pB, st));
      if (t >= 1) { this._poseBlendStart = undefined; this._prevPose = undefined; }
    }

    // Walk animation (chỉ pose 0)
    const isMoving = moveDir && (Math.abs(moveDir.x) > 0.05 || Math.abs(moveDir.z) > 0.05);
    if (this.pose === 0 && isMoving) {
      this.walkCycle += dt * 6;
      const sw = Math.sin(this.walkCycle);

      // Chân đi
      if (this._poseBlendStart === undefined) {
        this.thighL.rotation.x = sw * 0.38;
        this.thighR.rotation.x = -sw * 0.38;
        this.calfL.rotation.x  = Math.max(0, -sw * 0.22);
        this.calfR.rotation.x  = Math.max(0, sw * 0.22);
        // Tay đánh
        this.shoulderL.rotation.x = -sw * 0.18;
        this.shoulderR.rotation.x =  sw * 0.18;
      }

      // Bob nhẹ
      this.torso.position.y = Math.abs(sw) * 0.014;
    } else if (this.pose === 0 && this._poseBlendStart === undefined) {
      // Thở idle
      this.torso.position.y = Math.sin(now * 0.001) * 0.007;
    }

    // Xoay nhân vật theo hướng đi
    if (isMoving && moveDir) {
      const targetAngle = Math.atan2(moveDir.x, moveDir.z);
      let diff = targetAngle - this.facingAngle;
      diff = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI;
      this.facingAngle += diff * Math.min(1, dt * 10);
      this.group.rotation.y = this.facingAngle;
    }

    // Nhang phát sáng nhấp nháy
    if (this.pose === 2 && this.prayerIncenseGroup.visible) {
      this.prayerIncenseGroup.children.forEach(child => {
        if (child.isLight) {
          child.intensity = 0.2 + Math.sin(now * 0.008 + child.position.x * 10) * 0.1;
        }
      });
    }
  }
}
