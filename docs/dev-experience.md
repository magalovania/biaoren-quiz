# 镖人角色测试 - 开发经验总结

## 项目概述
这是一个基于《镖人》漫画的角色性格测试Web应用，用户通过回答问题匹配角色。

## 技术栈
- 纯原生 HTML/CSS/JavaScript（无框架）
- 单页应用（SPA）架构
- Google Fonts (Noto Serif SC + Noto Sans SC)

## 开发过程中踩过的坑

### 1. 算法归一化问题（关键Bug）
**问题**：原始 `normalizeScores` 函数使用公式 `50 + score * 5`，将用户得分锁定在 40-100 范围，而角色属性是 0-100 完整范围。

```javascript
// 错误写法
normalized[key] = Math.min(100, Math.max(0, 50 + this.scores[key] * 5));
```

**后果**：燕子娘（社交95、智谋85）等高分角色更容易匹配，用户无论怎么选都是燕子娘。

**修复方案**：按维度分别归一化
```javascript
// 正确写法
normalizeScores() {
  const maxScores = this.getMaxPossibleScores();
  const normalized = {};
  Object.keys(this.scores).forEach(key => {
    const max = maxScores[key] || 1;
    normalized[key] = Math.round((this.scores[key] / max) * 100);
  });
  return normalized;
}
```

### 2. 题目选项权重偏向问题
**问题**：前几道题的 A 选项都是"武力/信义"方向，刀马正好是武力98+信义98，导致全选 A 就必定匹配刀马。

**修复**：
1. 重新设计题目选项，让 A/B/C/D 分别对应不同角色类型
2. 随机打乱选项显示顺序

```javascript
// 渲染时打乱选项顺序
this.currentShuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
```

### 3. JSON 数据错误
**问题**：手动编写 JSON 时出现语法错误，如：
- `"社交": 3,,` (双逗号)
- `"社交": 3weights` (缺少引号)

**教训**：编写 JSON 后一定要用 `JSON.parse()` 验证格式

### 4. 随机打乱顺序不一致问题
**问题**：在 `renderQuestion` 中打乱选项，但在 `selectOption` 中又重新打乱，导致顺序不一致。

**修复**：保存打乱后的顺序
```javascript
// renderQuestion 中保存
this.currentShuffledOptions = [...question.options].sort(() => Math.random() - 0.5);

// selectOption 中使用保存的值
const selectedOption = this.currentShuffledOptions[index];
```

## 项目结构
```
biaoren-quiz/
├── index.html          # 主入口
├── js/app.js           # 核心逻辑
├── css/style.css       # 样式
├── data/
│   ├── questions.json  # 50道题题库
│   └── characters.json # 7个角色数据
└── docs/
    └── dev-experience.md # 本文档
```

## 核心算法
1. 随机抽取12道题（从50道题库）
2. 用户选择选项时累加维度权重
3. 将用户得分归一化到 0-100
4. 计算用户与每个角色的欧几里得距离
5. 选择距离最小的角色作为匹配结果

## 经验总结
1. **测试要全面**：不仅要测正常流程，还要测边界情况（全选同一个选项）
2. **算法要考虑归一化**：用户输入范围和角色属性范围要一致
3. **题目设计要平衡**：每个选项应该代表不同类型，不能有固定偏向
4. **随机性要一致**：打乱顺序后要保存状态，否则会导致数据不一致
5. **JSON 要验证**：编写后一定要 parse 验证格式正确

## 分享图片功能经验

### Canvas 绘制完整结果页
分享图片需要呈现完整的测试结果，包括：
1. 标题 - 放在最上方突出
2. 角色 Emoji + 名称
3. 匹配度百分比
4. 经典语录（需要加引号装饰）
5. 角色描述
6. 关键词标签
7. 五维雷达图（武力、智谋、信义、仁心、自由）
8. 底部扫码信息

### 雷达图绘制要点
- 使用 Canvas 2D API 绘制
- 需要绘制背景网格、坐标轴、数据区域、数据点
- 颜色与页面主题一致（血红 #C41E3A）
- 文字换行处理：中文按字符分割，英文按单词分割
- Canvas 高度要足够容纳所有内容
