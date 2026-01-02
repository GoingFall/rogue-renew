# Rogue Renew

一个基于 React + TypeScript 的 Roguelite 地牢探索游戏，灵感来源于经典的 Rogue 游戏。

## 游戏简介

Rogue Renew 是一个即时战斗的地牢探索游戏，玩家需要深入地下城，击败怪物，收集物品，最终找到并带回 Yendor 护身符。游戏采用程序生成地牢，每次游戏体验都不同。

### 游戏特色

- 🎮 **即时战斗系统** - 流畅的实时战斗体验
- 🗺️ **程序生成地牢** - 每次游戏都是全新的地牢布局
- 🎯 **26 种怪物** - 从蝙蝠到巨龙，挑战不断升级
- 💎 **丰富物品系统** - 武器、护甲、药水、卷轴、法杖、戒指等
- ⚡ **局外成长系统** - 死亡后保留灵魂，用于永久升级
- 🎨 **现代图形界面** - 基于 Web 技术的精美界面

## 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite
- **渲染**: HTML5 Canvas
- **物理引擎**: 自定义物理系统

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

游戏将在 `http://localhost:3000` 启动。

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 游戏操作

- **移动**: WASD 或方向键
- **攻击**: 空格键或鼠标左键
- **背包**: I 键
- **暂停**: ESC 键

## 项目结构

```
rogue-renew/
├── classes/          # 游戏引擎核心类
│   └── GameEngine.ts
├── components/       # React 组件
│   ├── GameCanvas.tsx
│   ├── HUD.tsx
│   ├── MetaShop.tsx
│   └── TutorialModal.tsx
├── constants.ts      # 游戏常量配置
├── types.ts          # TypeScript 类型定义
├── App.tsx           # 主应用组件
└── index.tsx         # 入口文件
```

## 开发说明

详细的功能文档请参考 [PROJECT_FEATURES.md](./PROJECT_FEATURES.md)

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

