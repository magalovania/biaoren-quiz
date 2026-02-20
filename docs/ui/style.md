# 镖人角色测试 - 视觉风格设计规范

## 1. 视觉风格定位

**核心关键词：** 硬派 · 苍凉 · 热血 · 留白

设计理念源自《镖人》漫画的黑白水墨质感，融合现代极简主义。通过强烈的黑白对比、粗犷的笔触线条、克制的红色点缀，营造江湖肃杀氛围。界面如卷轴展开，交互如刀锋过境——干脆利落，不留余墨。

---

## 2. 配色方案

### 主色系

| 名称 | 色值 | 用途 |
|------|------|------|
| 墨黑 | `#0A0A0A` | 主背景、标题 |
| 玄青 | `#1A1A1A` | 次级背景、卡片 |
| 铁灰 | `#2D2D2D` | 边框、分割线 |
| 霜白 | `#F5F5F0` | 主文字、反白元素 |
| 宣纸 | `#E8E4DC` | 次级文字、禁用态 |

### 点缀色

| 名称 | 色值 | 用途 |
|------|------|------|
| 殇红 | `#C41E3A` | 强调、选中态、血量/进度 |
| 暗红 | `#8B1A1A` | 悬停态、按压反馈 |
| 金砂 | `#B8860B` | 成就、稀有标识（慎用） |

### 渐变

```
/* 墨晕渐变 - 卡片背景 */
background: linear-gradient(180deg, #1A1A1A 0%, #0A0A0A 100%);

/* 血染渐变 - 进度条 */
background: linear-gradient(90deg, #8B1A1A 0%, #C41E3A 100%);

/* 边缘淡出 - 页面底部 */
background: linear-gradient(180deg, transparent 0%, #0A0A0A 100%);
```

---

## 3. 字体系统

### 中文字体

| 字重 | 字体 | 用途 |
|------|------|------|
| 标题 | **思源黑体 Heavy** / 站酷高端黑 | 主标题、角色名 |
| 正文 | **思源黑体 Regular** | 选项文字、描述 |
| 辅助 | **思源宋体 Light** | 引用语、氛围文字 |

### 英文/数字字体

| 字重 | 字体 | 用途 |
|------|------|------|
| 标题 | **Bebas Neue** | 进度数字、章节标号 |
| 正文 | **Inter** | 界面文字 |
| 装饰 | **Cinzel** | 英文装饰性标题 |

### 字号规范

```css
/* 标题层级 */
--font-hero: 72px;      /* 首屏大标题 */
--font-h1: 48px;        /* 章节标题 */
--font-h2: 32px;        /* 卡片标题 */
--font-h3: 24px;        /* 小标题 */
--font-body: 16px;      /* 正文 */
--font-caption: 12px;   /* 辅助说明 */

/* 行高 */
--leading-tight: 1.2;   /* 标题 */
--leading-normal: 1.6;  /* 正文 */
--leading-loose: 2.0;   /* 引用 */
```

---

## 4. 核心组件样式

### 4.1 按钮

**主按钮（选中/确认）**
```css
.btn-primary {
  background: #C41E3A;
  color: #F5F5F0;
  border: 2px solid #C41E3A;
  padding: 16px 48px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 4px;
  position: relative;
  overflow: hidden;
}

/* 墨迹边框效果 */
.btn-primary::before {
  content: '';
  position: absolute;
  inset: -2px;
  border: 2px solid #F5F5F0;
  opacity: 0;
  transition: opacity 0.3s;
}

.btn-primary:hover::before {
  opacity: 1;
}

/* 按压效果 */
.btn-primary:active {
  background: #8B1A1A;
  transform: scale(0.98);
}
```

**次级按钮（选项）**
```css
.btn-secondary {
  background: transparent;
  color: #F5F5F0;
  border: 1px solid #2D2D2D;
  padding: 20px 32px;
  font-size: 16px;
  transition: all 0.2s ease;
}

.btn-secondary:hover {
  border-color: #F5F5F0;
  background: rgba(245, 245, 240, 0.05);
}

.btn-secondary.selected {
  border-color: #C41E3A;
  background: rgba(196, 30, 58, 0.1);
}
```

### 4.2 卡片

**问题卡片**
```css
.card-question {
  background: linear-gradient(180deg, #1A1A1A 0%, #0A0A0A 100%);
  border: 1px solid #2D2D2D;
  padding: 48px;
  position: relative;
}

/* 角落装饰线 */
.card-question::before,
.card-question::after {
  content: '';
  position: absolute;
  width: 24px;
  height: 24px;
  border: 1px solid #C41E3A;
}

.card-question::before {
  top: -1px;
  left: -1px;
  border-right: none;
  border-bottom: none;
}

.card-question::after {
  bottom: -1px;
  right: -1px;
  border-left: none;
  border-top: none;
}
```

**结果卡片（角色展示）**
```css
.card-result {
  background: #0A0A0A;
  border: 2px solid #F5F5F0;
  position: relative;
}

/* 角色剪影容器 */
.card-result .silhouette {
  filter: drop-shadow(0 0 40px rgba(196, 30, 58, 0.3));
}
```

### 4.3 进度条

```css
.progress-bar {
  height: 2px;
  background: #2D2D2D;
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8B1A1A, #C41E3A);
  transition: width 0.5s ease;
}

/* 进度节点 */
.progress-dot {
  width: 8px;
  height: 8px;
  background: #F5F5F0;
  border-radius: 50%;
}

.progress-dot.active {
  background: #C41E3A;
  box-shadow: 0 0 12px rgba(196, 30, 58, 0.6);
}
```

### 4.4 分割线

```css
/* 墨迹分割线 - 使用SVG或伪元素模拟 */
.divider {
  height: 1px;
  background: linear-gradient(90deg, 
    transparent 0%, 
    #2D2D2D 20%, 
    #F5F5F0 50%, 
    #2D2D2D 80%, 
    transparent 100%
  );
  opacity: 0.6;
}
```

---

## 5. 动效设计建议

### 核心原则
- **快准狠**：动效时长控制在 200-400ms
- **有始有终**：避免循环动画，每帧都有目的
- **留白过渡**：状态切换时给予呼吸空间

### 页面转场

```css
/* 问题切换 - 黑场过渡 */
.page-transition {
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* 结果揭晓 - 红光闪现 */
.result-reveal {
  animation: bloodFlash 0.6s ease;
}

@keyframes bloodFlash {
  0% { opacity: 0; }
  30% { opacity: 1; background: rgba(196, 30, 58, 0.3); }
  100% { opacity: 1; background: transparent; }
}
```

### 交互反馈

```css
/* 选项悬停 - 墨迹扩散 */
.option:hover {
  animation: inkSpread 0.3s ease forwards;
}

@keyframes inkSpread {
  to {
    border-color: #F5F5F0;
    box-shadow: inset 0 0 30px rgba(196, 30, 58, 0.1);
  }
}

/* 选中确认 - 刀痕效果 */
.option.selected {
  animation: slash 0.4s ease;
}

@keyframes slash {
  0% { clip-path: inset(0 100% 0 0); }
  100% { clip-path: inset(0 0 0 0); }
}
```

### 装饰动效

```css
/* 标题墨迹下落 */
.title-ink {
  animation: inkDrop 1s ease-out;
}

@keyframes inkDrop {
  0% { 
    opacity: 0; 
    transform: translateY(-100%);
    filter: blur(4px);
  }
  60% { 
    filter: blur(0);
  }
  100% { 
    opacity: 1; 
    transform: translateY(0);
  }
}

/* 结果角色浮现 - 从剪影到清晰 */
.character-reveal {
  animation: silhouetteReveal 1.2s ease-out;
}

@keyframes silhouetteReveal {
  0% {
    filter: brightness(0) blur(10px);
    transform: scale(1.1);
  }
  50% {
    filter: brightness(0.5) blur(5px);
  }
  100% {
    filter: brightness(1) blur(0);
    transform: scale(1);
  }
}
```

### 微交互

| 场景 | 动效 | 时长 |
|------|------|------|
| 按钮悬停 | 边框渐显 + 轻微上移(2px) | 200ms |
| 选项点击 | 红色填充从左至右 | 300ms |
| 进度更新 | 进度条弹性增长 | 500ms ease-out |
| 结果生成 | Loading 旋转 → 消失 → 结果浮现 | 1.5s |

---

## 6. 布局建议

### 首页
- 全屏黑色背景
- 居中大标题「镖人」
- 底部单按钮「开始测试」

### 问题页
- 顶部：进度条 + 题号
- 中部：问题文字 + 选项列表（垂直排列，间距适中）
- 底部：留白呼吸

### 结果页
- 角色剪影/立绘（大）
- 角色名（粗体大字）
- 性格描述（引用样式）
- 分享按钮

---

## 7. 设计禁忌

1. ❌ 禁止使用彩色渐变背景
2. ❌ 禁止圆角超过 4px（保持锋利感）
3. ❌ 禁止使用阴影代替边框
4. ❌ 禁止红色面积超过 15%
5. ❌ 禁止使用卡通/可爱风格图标

---

*设计规范 v1.0 | 硬派武侠 · 苍凉热血*
