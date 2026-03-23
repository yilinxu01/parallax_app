# Parallax — Hidden Spots, Told by the People Who Found Them

**English** | [中文](#中文)

Parallax is a mobile-first web app for discovering and sharing hidden gems in your city. Users create geo-tagged story cards — a photo, a location, and a short personal story — polished with AI. Cards live on an interactive map and a community feed.

This is a pre-release MVP / interactive demo.

---

## Features

- **Story Card Creation** — 4-step flow: photo (camera or upload) → location search → write your story → AI polish
- **AI Story Polish** — GPT-powered rewrite that matches the user's voice, plus auto-generated location-specific tags
- **Interactive Map** — Mapbox-powered map with colored pins; fly-to animation when a new card is published
- **Community Feed** — Browse all story cards sorted by recency
- **My Collection** — Save cards to a personal collection

---

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Map | Mapbox GL JS (react-map-gl) |
| Backend | FastAPI (Python), SQLite |
| AI | OpenAI GPT-4.1 mini with web search |
| Geocoding | OpenStreetMap Nominatim |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- A [Mapbox access token](https://account.mapbox.com)
- An OpenAI API key

### 1. Clone & install frontend

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your tokens:

```bash
cp .env.example .env
```

```env
VITE_MAPBOX_TOKEN=your_mapbox_token_here
VITE_API_BASE=http://localhost:8000
```

### 3. Install & start the backend

```bash
cd backend
pip install -r requirements.txt
```

Create `backend/.env` with your OpenAI key:

```env
OPENAI_API_KEY=your_openai_key_here
```

Start the backend:

```bash
uvicorn main:app --reload --port 8000
```

### 4. Start the frontend

```bash
npm run dev
```

Open `http://localhost:5173` (or whichever port Vite assigns).

---

## Project Structure

```
├── src/
│   ├── App.tsx                  # Root — state, routing between views
│   ├── components/
│   │   ├── CardCreationFlow.tsx # 4-step card creation flow
│   │   ├── MapView.tsx          # Interactive map with pins & popups
│   │   ├── CommunityFeed.tsx    # Scrollable card feed
│   │   ├── Profile.tsx          # User profile & collection
│   │   └── ARDirections.tsx     # AR navigation (prototype)
│   └── styles/globals.css
├── backend/
│   ├── main.py                  # FastAPI app — all endpoints
│   ├── cards.db                 # SQLite database (auto-created)
│   ├── uploads/                 # Uploaded images
│   └── requirements.txt
└── .env.example
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/generate-story` | AI story polish + tag generation |
| `POST` | `/api/upload-image` | Upload a photo |
| `POST` | `/api/cards` | Save a new card |
| `GET` | `/api/cards/nearby` | Get cards within radius of lat/lng |
| `GET` | `/health` | Health check |

---

## Known Limitations (Demo)

- User accounts and authentication are not implemented — the profile view uses mock data
- Likes are stored in frontend state only and reset on page refresh
- The map defaults to a fixed NYC center point; real GPS is not yet wired up

---

---

# 中文

Parallax 是一款移动端优先的 Web 应用，用于发现和分享城市里的隐藏宝藏。用户创建带地理位置的故事卡片——一张照片、一个地点、一段亲历短故事——经 AI 润色后，发布到交互地图和社区 Feed。

这是预发布 MVP / 交互 Demo。

---

## 功能特性

- **故事卡片创建** — 4 步流程：拍照或上传 → 位置搜索 → 写故事 → AI 润色
- **AI 故事润色** — GPT 驱动的改写，保留用户语气，并自动生成与地点相关的标签
- **交互地图** — 基于 Mapbox 的彩色 pin 地图，发布新卡片后自动飞入定位
- **社区 Feed** — 按时间倒序浏览所有故事卡片
- **我的收藏** — 收藏感兴趣的卡片

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18、TypeScript、Vite、Tailwind CSS、shadcn/ui |
| 地图 | Mapbox GL JS（react-map-gl）|
| 后端 | FastAPI（Python）、SQLite |
| AI | OpenAI GPT-4.1 mini + 网络搜索 |
| 地理编码 | OpenStreetMap Nominatim |

---

## 快速开始

### 前提条件

- Node.js 18+
- Python 3.10+
- [Mapbox access token](https://account.mapbox.com)
- OpenAI API Key

### 1. 安装前端依赖

```bash
npm install
```

### 2. 配置环境变量

将 `.env.example` 复制为 `.env` 并填入 token：

```bash
cp .env.example .env
```

```env
VITE_MAPBOX_TOKEN=你的_mapbox_token
VITE_API_BASE=http://localhost:8000
```

### 3. 安装并启动后端

```bash
cd backend
pip install -r requirements.txt
```

在 `backend/.env` 中填入 OpenAI Key：

```env
OPENAI_API_KEY=你的_openai_key
```

启动后端：

```bash
uvicorn main:app --reload --port 8000
```

### 4. 启动前端

```bash
npm run dev
```

在浏览器中打开 `http://localhost:5173`（或 Vite 分配的端口）。

---

## 项目结构

```
├── src/
│   ├── App.tsx                  # 根组件 — 状态管理与视图切换
│   ├── components/
│   │   ├── CardCreationFlow.tsx # 4 步卡片创建流程
│   │   ├── MapView.tsx          # 交互地图（pin + 弹窗）
│   │   ├── CommunityFeed.tsx    # 卡片 Feed 流
│   │   ├── Profile.tsx          # 用户主页与收藏
│   │   └── ARDirections.tsx     # AR 导航（原型）
│   └── styles/globals.css
├── backend/
│   ├── main.py                  # FastAPI 应用 — 所有接口
│   ├── cards.db                 # SQLite 数据库（自动创建）
│   ├── uploads/                 # 上传图片目录
│   └── requirements.txt
└── .env.example
```

---

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/generate-story` | AI 故事润色 + 标签生成 |
| `POST` | `/api/upload-image` | 上传图片 |
| `POST` | `/api/cards` | 保存新卡片 |
| `GET` | `/api/cards/nearby` | 获取附近卡片 |
| `GET` | `/health` | 健康检查 |

---

## 已知限制（Demo 阶段）

- 暂无用户账号和登录系统，个人主页使用 mock 数据
- 点赞数仅存储在前端状态中，刷新后重置
- 地图默认以纽约市固定坐标为中心，尚未接入真实 GPS 定位
