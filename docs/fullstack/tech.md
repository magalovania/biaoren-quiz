# 镖人角色测试 - 技术方案

## 1. 技术栈选择

| 层面 | 技术 | 理由 |
|------|------|------|
| 前端 | Vanilla JS + Tailwind CSS | 无框架负担，零构建配置，直接跑 |
| 后端 | Cloudflare Workers | 免费额度充足，全球边缘部署 |
| 存储 | Cloudflare KV | 与Workers天然集成，足够用 |
| 部署 | Cloudflare Pages | 静态资源+边缘函数一体化 |

**为什么不选 Next.js/Vue/React？**
- 单页面应用，不需要路由和SSR
- 纯展示+简单交互，框架是累赘
- 首屏性能优先，减少JS体积

## 2. 项目结构

```
biaoren-quiz/
├── index.html              # 单页面入口
├── css/
│   └── style.css           # Tailwind编译后的样式
├── js/
│   ├── app.js              # 主逻辑
│   ├── quiz.js             # 题目流程控制
│   ├── result.js           # 结果计算
│   └── share.js            # 分享功能
├── data/
│   ├── questions.json      # 题目数据
│   └── characters.json     # 角色数据
├── assets/
│   └── images/             # 角色图片
├── workers/
│   └── api.js              # Cloudflare Worker (记录分享数)
└── wrangler.toml           # Cloudflare配置
```

## 3. 核心功能实现

### 3.1 题目管理

```javascript
// js/quiz.js
const quiz = {
  questions: [],      // 从questions.json加载
  currentIndex: 0,
  answers: [],        // 存储用户选择
  
  async init() {
    const res = await fetch('./data/questions.json');
    this.questions = await res.json();
    this.render();
  },
  
  next(answer) {
    this.answers.push(answer);
    this.currentIndex++;
    this.currentIndex < this.questions.length 
      ? this.render() 
      : this.showResult();
  }
};
```

### 3.2 匹配算法

采用**维度计分法**：每个角色有5个属性维度，题目选项对应不同维度的加权分。

```javascript
// js/result.js
const DIMENSIONS = ['武力', '智谋', '义气', '野心', '仁心'];

function calculateResult(answers) {
  // 初始化各维度分数
  const scores = { '武力': 0, '智谋': 0, '义气': 0, '野心': 0, '仁心': 0 };
  
  answers.forEach((choice, idx) => {
    const weights = questions[idx].options[choice].weights;
    Object.entries(weights).forEach(([dim, w]) => {
      scores[dim] += w;
    });
  });
  
  // 与角色模板匹配（余弦相似度）
  return findBestMatch(scores, characters);
}

function cosineSimilarity(vec1, vec2) {
  const dims = DIMENSIONS;
  let dot = 0, norm1 = 0, norm2 = 0;
  dims.forEach(d => {
    dot += vec1[d] * vec2[d];
    norm1 += vec1[d] ** 2;
    norm2 += vec2[d] ** 2;
  });
  return dot / (Math.sqrt(norm1) * Math.sqrt(norm2));
}
```

### 3.3 结果生成

```javascript
// js/result.js
function renderResult(character) {
  const container = document.getElementById('result');
  container.innerHTML = `
    <img src="./assets/images/${character.id}.jpg" alt="${character.name}">
    <h2>${character.name}</h2>
    <p>${character.description}</p>
    <div class="dimensions">
      ${renderDimensions(character.attributes)}
    </div>
    <button onclick="share()">分享结果</button>
  `;
  window.currentCharacter = character;
}
```

## 4. 数据结构设计

### 4.1 题目数据 (questions.json)

```json
[
  {
    "id": 1,
    "question": "面对强敌，你会？",
    "options": [
      { "text": "正面硬刚", "weights": { "武力": 3, "野心": 1 } },
      { "text": "智取为上", "weights": { "智谋": 3, "仁心": 1 } },
      { "text": "避其锋芒", "weights": { "智谋": 2, "野心": -1 } },
      { "text": "寻求盟友", "weights": { "义气": 3, "仁心": 1 } }
    ]
  }
]
```

### 4.2 角色数据 (characters.json)

```json
[
  {
    "id": "dao-ma",
    "name": "刀马",
    "description": "独行镖师，重信守诺，武艺高强",
    "attributes": { "武力": 95, "智谋": 70, "义气": 90, "野心": 30, "仁心": 75 },
    "quote": "接的镖，一定要送到。",
    "keywords": ["孤傲", "守信", "强者为尊"]
  }
]
```

### 4.3 KV存储结构（可选，用于统计）

```
share:{character_id}:{date} -> count
```

## 5. 部署方案

### 5.1 Cloudflare Pages + Workers

```toml
# wrangler.toml
name = "biaoren-quiz"
compatibility_date = "2024-01-01"

[site]
bucket = "./"

[vars]
ENV = "production"

[[kv_namespaces]]
binding = "STATS"
id = "your-kv-namespace-id"
```

### 5.2 部署命令

```bash
# 安装CLI
npm install -g wrangler

# 登录
wrangler login

# 部署
wrangler pages deploy ./ --project-name=biaoren-quiz
```

### 5.3 自定义域名（可选）

```bash
wrangler pages project edit biaoren-quiz --production-branch=main
# 在Cloudflare控制台绑定域名
```

## 6. 开发步骤与时间

| 阶段 | 任务 | 时间 |
|------|------|------|
| 1 | 搭建项目骨架，静态页面 | 1h |
| 2 | 题目数据整理（15-20题）| 2h |
| 3 | 角色数据整理（8-10角色）| 1h |
| 4 | 交互逻辑实现 | 2h |
| 5 | 匹配算法实现 | 1h |
| 6 | 分享功能（生成海报/复制链接）| 1.5h |
| 7 | 样式优化、动效 | 1.5h |
| 8 | 部署上线 | 0.5h |
| **总计** | | **10.5h** |

## 7. 分享功能实现

### 7.1 微信分享（生成海报）

```javascript
// js/share.js
async function generatePoster(character) {
  const canvas = document.createElement('canvas');
  canvas.width = 750;
  canvas.height = 1334;
  const ctx = canvas.getContext('2d');
  
  // 背景渐变
  const gradient = ctx.createLinearGradient(0, 0, 0, 1334);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 750, 1334);
  
  // 绘制角色图片
  const img = await loadImage(`./assets/images/${character.id}.jpg`);
  ctx.drawImage(img, 75, 100, 600, 600);
  
  // 绘制文字
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 48px sans-serif';
  ctx.fillText(`我是${character.name}`, 75, 800);
  
  ctx.font = '28px sans-serif';
  ctx.fillStyle = '#aaa';
  ctx.fillText(character.quote, 75, 860);
  
  // 二维码
  const qr = await generateQRCode(window.location.href);
  ctx.drawImage(qr, 275, 1100, 200, 200);
  
  return canvas.toDataURL('image/jpeg', 0.9);
}
```

### 7.2 一键复制链接

```javascript
function copyLink() {
  const url = `${window.location.origin}?ref=${userId}`;
  navigator.clipboard.writeText(url).then(() => {
    alert('链接已复制');
  });
}
```

## 8. 关键文件示例

### index.html

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>测一测你是镖人中的哪个角色</title>
  <link href="./css/style.css" rel="stylesheet">
  <meta property="og:title" content="我是刀马！测测你是镖人中的哪个角色">
  <meta property="og:description" content="15道题测出你的镖人灵魂角色">
  <meta property="og:image" content="./assets/images/og-image.jpg">
</head>
<body>
  <div id="app">
    <section id="intro">
      <h1>测一测你是镖人中的哪个角色</h1>
      <button onclick="quiz.init()">开始测试</button>
    </section>
    <section id="quiz" class="hidden"></section>
    <section id="result" class="hidden"></section>
  </div>
  <script src="./js/app.js" type="module"></script>
</body>
</html>
```

---

**核心理念**：能静态就静态，能边缘就边缘，能简单就简单。先上线，再迭代。
