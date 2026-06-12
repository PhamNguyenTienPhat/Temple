# 🏯 Chùa Phật Việt Nam 3D
## Vietnamese Buddhist Temple Exploration Game

Game 3D khám phá chùa Phật giáo Việt Nam chạy hoàn toàn trên trình duyệt.

---

## 📁 Cấu Trúc Dự Án

```
temp/
├── index.html          # File HTML chính
├── style.css           # Giao diện & HUD
├── AGENTS.md           # Yêu cầu dự án
├── README.md           # Hướng dẫn này
└── js/
    ├── utils.js        # Hàm tiện ích & textures
    ├── character.js    # Nhân vật 3D chi tiết
    ├── environment.js  # Môi trường chùa
    ├── particles.js    # Hệ thống khói & hiệu ứng
    ├── controls.js     # Điều khiển touch/keyboard
    └── game.js         # Engine game chính
```

---

## 🎮 Tính Năng

### Nhân Vật
- Nhân vật 3D đầy đủ: mặt, mắt, mũi, miệng, tai, tay, ngón tay, chân
- **4 tư thế** với animation blending mượt mà:
  1. 🧍 **Đứng Thường** – pose mặc định + animation đi bộ
  2. 🙏 **Cầu Nguyện** – chắp tay, hai lòng bàn tay khép chặt
  3. 🪔 **Dâng Nhang** – cầm 3 cây nhang giữa hai lòng bàn tay
  4. 🛐 **Quỳ Lạy** – quỳ cúi đầu lạy Phật

### Môi Trường
- **Sân Chùa** – lát đá, đèn lồng đỏ, cây xanh
- **Cổng Tam Quan** – cổng chùa truyền thống
- **Tượng Phật Khổng Lồ** – chi tiết nhất: mắt, mũi, môi, tai dài, ngón tay, vầng hào quang
- **Lư Hương** – lò hương đồng 3 chân, cắm nhiều nén nhang
- **Chính Điện** – chùa 3 tầng mái cong truyền thống Việt Nam
- **Ao Sen** – hồ nước với hoa sen
- **Vườn Cây** – cây đa, tre xanh
- **Vòng Tường** – tường bao quanh chùa

### Hiệu Ứng
- 💨 **Khói nhang** – particle shader mượt mà
- 🌟 **Đom đóm** – điểm sáng bay trong đêm
- 🌸 **Cánh hoa** – cánh hoa rơi nhẹ
- 🏮 **Đèn lồng** – nhấp nháy thực tế
- 🌙 **Bầu trời đêm** – trăng + 800 ngôi sao

---

## 🕹️ Điều Khiển

### Mobile (Portrait)
| Hành Động | Điều Khiển |
|-----------|-----------|
| Di chuyển | Joystick góc trái |
| Xoay camera | Kéo màn hình |
| Zoom | Pinch hoặc nút +/− |
| Đổi tư thế | Nút bên phải màn hình |

### PC/Desktop
| Hành Động | Phím |
|-----------|------|
| Di chuyển | WASD hoặc Arrow Keys |
| Xoay camera | Kéo chuột trái |
| Zoom | Scroll wheel |
| Tư thế 1-4 | Phím số 1, 2, 3, 4 |

---

## 🚀 Cách Chạy

### Cách 1: Dùng Python HTTP Server (Khuyến nghị)
```bash
cd path/to/temp
python -m http.server 8080
# Mở trình duyệt: http://localhost:8080
```

### Cách 2: Dùng Node.js
```bash
npx serve .
# Hoặc
npx http-server . -p 8080
```

### Cách 3: VS Code Live Server
- Cài extension "Live Server"
- Chuột phải `index.html` → Open with Live Server

### ⚠️ Lưu ý
- **Không mở trực tiếp file HTML** (file://) vì sẽ bị lỗi CORS với CDN scripts
- Cần kết nối internet để tải Three.js từ CDN

---

## ⚙️ Yêu Cầu Kỹ Thuật

- Trình duyệt hỗ trợ **WebGL 2.0**
- Chrome 80+, Firefox 75+, Safari 14+, Edge 80+
- RAM: tối thiểu 2GB
- GPU: WebGL-capable (tất cả smartphone từ 2018+)

---

## 🎯 Tối Ưu Hóa Mobile

- **Pixel ratio giới hạn** 1.5x trên mobile
- **Shadow map** dùng BasicShadowMap (nhanh hơn)
- **Particle count** giới hạn 120 hạt khói
- **Geometry ít polygon** hơn cho cây cối
- **Frustum culling** tự động của Three.js
- **Frame cap** dt max 50ms để tránh glitch

---

## 🏗️ Kiến Trúc

```
Game (game.js)
├── THREE.WebGLRenderer  ← WebGL rendering
├── Environment          ← Toàn bộ môi trường chùa
│   ├── Buddha Statue    ← ~200 meshes chi tiết
│   ├── Temple Hall      ← Chính điện 3 tầng
│   ├── Incense Burner   ← Lư hương + particle anchor
│   ├── Gatehouse        ← Cổng tam quan
│   ├── Trees/Bamboo     ← Thực vật
│   └── Lanterns/Lights  ← Ánh sáng động
├── Character            ← Nhân vật + 4 poses + animation
├── ParticleSystem       ← Khói, đom đóm, hoa rơi
└── Controls             ← Touch joystick + camera drag
```

---

## 📍 Địa Điểm Trong Game

Hệ thống tự động nhận biết vị trí nhân vật:
- **Cổng Tam Quan** – phía bắc
- **Ao Sen** – sân trước
- **Sân Chùa** – khu vực chính
- **Tiền Đường** – phía trước chùa
- **Lư Hương** – trước tượng Phật
- **Trước Tượng Phật** – gần tượng
- **Chính Điện** – bên trong/sau chùa
- **Vườn Cây** – hai bên sân

---

*Dự án tạo bởi Antigravity AI – 2026*
