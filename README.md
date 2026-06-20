# 如果我是古人 — 穿越千年，遇见另一个自己

> 候鸟AI创造局参赛作品

写下你的性格、志趣与故事，看看千年前的你，会是诗客、侠士、谋臣，还是隐者。

## 功能

- **古风身份生成**：输入性格、爱好、MBTI、星座、生肖，AI 为你生成古风名字、人物小传、古人知己、相遇场景
- **水墨山水欢迎页**：Canvas 动态绘制的中国山水画背景，飞鸟掠过，云雾呼吸
- **身份卡弹出层**：卷轴展开动画，毛玻璃遮罩，可关闭
- **分享名帖**：Canvas 生成 1080×1440 古风身份卡，适合小红书分享
- **古人画廊**：历史生成记录，可回顾和删除
- **随机古诗词**：主页左右两侧飘落经典古诗词
- **自定义下拉组件**：全自定义 UI，统一古风暖色调

## 技术栈

| 层 | 技术 |
|---|------|
| 前端 | HTML + CSS + Canvas API，单文件 |
| 后端 | Node.js + Express |
| AI | DeepSeek API（OpenAI 兼容格式，可切换阶跃星辰等） |
| 字体 | 志莽行（标题）+ 霞鹜文楷（正文） |
| Skills | frontend-design、canvas-design |

## 快速开始

```bash
# 安装依赖
npm install

# 配置 API Key
cp .env.example .env
# 编辑 .env，填入你的 DeepSeek API Key

# 启动
npm start
# 访问 http://localhost:3000
```

## 环境变量

```
API_KEY=sk-xxx          # DeepSeek API Key
API_BASE_URL=https://api.deepseek.com/v1
MODEL=deepseek-chat
PORT=3000
```

## 项目结构

```
├── server.js           # Express 后端
├── poetry.js           # 古诗词库（115首）
├── public/
│   └── index.html      # 前端（单文件，含 CSS + JS + Canvas）
├── .env.example        # 环境变量模板
└── package.json
```

## 设计理念

**墨韵流觞** — 以宣纸暖色为底，水墨山水为骨，书法字体为魂。

- 色调：米白 `#f8f6f2` + 深棕 `#2c2c2c` + 朱红 `#c23b22`
- 字体：志莽行（毛笔行书）+ 霞鹜文楷（书卷气）
- 动效：山水呼吸、飞鸟掠过、诗词飘落、卷轴展开
- 下拉：全自定义暖色调组件，不用原生 select

## 候鸟AI创造局

[候鸟AI创造局](https://github.com/anthropics/skills) — 阶跃星辰 × 阿那亚·候鸟300

> 群迁徙到阿那亚的创作者，在海边住 300 个小时，用 AI 把想法当场做出来。

---

MIT License
