const QuizApp = {
  questions: [],
  characters: [],
  currentIndex: 0,
  answers: [],
  scores: {
    '武力': 0,
    '智谋': 0,
    '信义': 0,
    '仁心': 0,
    '自由': 0,
    '社交': 0,
    '野心': 0,
    '冷静': 0
  },

  async init() {
    await this.loadData();
    this.bindEvents();
    this.updateStats();
  },

  async loadData() {
    try {
      const [questionsRes, charactersRes] = await Promise.all([
        fetch('./data/questions.json'),
        fetch('./data/characters.json')
      ]);
      this.questions = await questionsRes.json();
      this.characters = await charactersRes.json();
    } catch (error) {
      console.error('数据加载失败:', error);
    }
  },

  bindEvents() {
    document.getElementById('startBtn').addEventListener('click', () => this.startQuiz());
    document.getElementById('retryBtn').addEventListener('click', () => this.retry());
    document.getElementById('shareBtn').addEventListener('click', () => this.showShareModal());
    document.getElementById('closeModal').addEventListener('click', () => this.hideShareModal());
    document.getElementById('saveImageBtn').addEventListener('click', () => this.saveImage());
    document.getElementById('copyLinkBtn').addEventListener('click', () => this.copyLink());
    
    document.getElementById('shareModal').addEventListener('click', (e) => {
      if (e.target.id === 'shareModal') this.hideShareModal();
    });
  },

  updateStats() {
    const base = 12847;
    const random = Math.floor(Math.random() * 100);
    document.getElementById('totalUsers').textContent = (base + random).toLocaleString();
  },

  startQuiz() {
    this.currentIndex = 0;
    this.answers = [];
    Object.keys(this.scores).forEach(key => this.scores[key] = 0);
    
    // 从题库中随机抽取12道题
    this.selectedQuestions = this.getRandomQuestions(12);
    
    this.showPage('quiz');
    this.renderQuestion();
  },

  getRandomQuestions(count) {
    const shuffled = [...this.questions].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  },

  renderQuestion() {
    const question = this.selectedQuestions[this.currentIndex];
    const questionNumber = String(this.currentIndex + 1).padStart(2, '0');
    
    document.getElementById('questionNumber').textContent = questionNumber;
    document.getElementById('questionText').textContent = question.question;
    document.getElementById('progressText').textContent = `${this.currentIndex + 1}/${this.selectedQuestions.length}`;
    
    const progressPercent = ((this.currentIndex + 1) / this.selectedQuestions.length) * 100;
    document.getElementById('progressFill').style.width = `${progressPercent}%`;
    
    // 随机打乱选项顺序，并保存
    this.currentShuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
    
    const optionsHtml = this.currentShuffledOptions.map((opt, idx) => {
      const labels = ['A', 'B', 'C', 'D'];
      return `
        <button class="option-btn" data-index="${idx}">
          <span class="option-label">${labels[idx]}</span>
          <span class="option-text">${opt.text}</span>
        </button>
      `;
    }).join('');
    
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = optionsHtml;
    
    optionsContainer.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.selectOption(parseInt(btn.dataset.index)));
    });
    
    this.animateQuestionCard();
  },

  animateQuestionCard() {
    const card = document.getElementById('questionCard');
    card.classList.remove('fade-in');
    void card.offsetWidth;
    card.classList.add('fade-in');
  },

  selectOption(index) {
    const question = this.selectedQuestions[this.currentIndex];
    // 使用保存的打乱后的选项
    const selectedOption = this.currentShuffledOptions[index];
    
    document.querySelectorAll('.option-btn').forEach((btn, idx) => {
      if (idx === index) {
        btn.classList.add('selected');
      }
    });
    
    this.answers.push(index);
    
    Object.entries(selectedOption.weights).forEach(([dim, weight]) => {
      if (this.scores.hasOwnProperty(dim)) {
        this.scores[dim] += weight;
      }
    });
    
    setTimeout(() => {
      this.currentIndex++;
      if (this.currentIndex < this.selectedQuestions.length) {
        this.renderQuestion();
      } else {
        this.showLoading();
      }
    }, 300);
  },

  showLoading() {
    this.showPage('loading');
    setTimeout(() => {
      const result = this.calculateResult();
      this.showResult(result);
    }, 2000);
  },

  calculateResult() {
    const normalizedScores = this.normalizeScores();
    
    let bestMatch = null;
    let bestDistance = Infinity;
    let allDistances = [];
    
    this.characters.forEach(character => {
      const distance = this.calculateDistance(normalizedScores, character.attributes);
      allDistances.push({ character, distance });
      
      if (distance < bestDistance) {
        bestDistance = distance;
        bestMatch = character;
      }
    });
    
    allDistances.sort((a, b) => a.distance - b.distance);
    
    const maxDistance = Math.sqrt(8 * 10000);
    const matchPercent = Math.round((1 - bestDistance / maxDistance) * 100);
    
    return {
      character: bestMatch,
      matchPercent: Math.max(70, Math.min(98, matchPercent)),
      scores: normalizedScores
    };
  },

  // 计算每个维度在题目中的最大可能得分（基于随机抽取的题目）
  getMaxPossibleScores() {
    const maxScores = {};
    const dimensions = ['武力', '智谋', '信义', '仁心', '自由', '社交', '野心', '冷静'];
    
    dimensions.forEach(dim => maxScores[dim] = 0);
    
    // 使用随机抽取的题目计算最大得分
    const questionsToUse = this.selectedQuestions || this.questions;
    
    questionsToUse.forEach(q => {
      q.options.forEach(opt => {
        Object.entries(opt.weights).forEach(([dim, weight]) => {
          if (maxScores.hasOwnProperty(dim) && weight > 0) {
            maxScores[dim] += weight;
          }
        });
      });
    });
    
    return maxScores;
  },

  normalizeScores() {
    const maxScores = this.getMaxPossibleScores();
    const normalized = {};
    
    Object.keys(this.scores).forEach(key => {
      const max = maxScores[key] || 1;
      // 将用户得分归一化到 0-100 范围
      normalized[key] = Math.round((this.scores[key] / max) * 100);
    });
    
    return normalized;
  },

  calculateDistance(userScores, characterAttributes) {
    const dimensions = ['武力', '智谋', '信义', '仁心', '自由', '社交', '野心', '冷静'];
    let sumSquares = 0;
    
    dimensions.forEach(dim => {
      const userVal = userScores[dim] || 50;
      const charVal = characterAttributes[dim] || 50;
      sumSquares += Math.pow(userVal - charVal, 2);
    });
    
    return Math.sqrt(sumSquares);
  },

  showResult(result) {
    const { character, matchPercent, scores } = result;
    
    document.getElementById('resultImage').textContent = character.emoji;
    document.getElementById('resultName').textContent = character.name;
    document.getElementById('matchNumber').textContent = matchPercent;
    document.getElementById('resultQuote').textContent = character.quote;
    document.getElementById('introName').textContent = character.name;
    document.getElementById('introDesc').textContent = character.description;
    
    const traitsHtml = character.keywords.map(k => `<span class="trait-tag">${k}</span>`).join('');
    document.getElementById('resultTraits').innerHTML = traitsHtml;
    
    this.showPage('result');
    
    setTimeout(() => {
      this.drawRadarChart(character.attributes);
    }, 500);
    
    this.currentResult = result;
  },

  drawRadarChart(attributes) {
    const canvas = document.getElementById('radarChart');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 90;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const dimensions = ['武力', '智谋', '信义', '仁心', '自由'];
    const angleStep = (Math.PI * 2) / dimensions.length;
    
    ctx.strokeStyle = '#2D2D2D';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      const r = radius * (i / 5);
      for (let j = 0; j <= dimensions.length; j++) {
        const angle = angleStep * j - Math.PI / 2;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }
    
    ctx.strokeStyle = '#3D3D3D';
    dimensions.forEach((dim, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
      
      ctx.fillStyle = '#E8E4DC';
      ctx.font = '12px Noto Sans SC';
      ctx.textAlign = 'center';
      const labelX = centerX + (radius + 20) * Math.cos(angle);
      const labelY = centerY + (radius + 20) * Math.sin(angle);
      ctx.fillText(dim, labelX, labelY + 4);
    });
    
    ctx.beginPath();
    ctx.fillStyle = 'rgba(196, 30, 58, 0.3)';
    ctx.strokeStyle = '#C41E3A';
    ctx.lineWidth = 2;
    
    dimensions.forEach((dim, i) => {
      const value = attributes[dim] || 50;
      const r = radius * (value / 100);
      const angle = angleStep * i - Math.PI / 2;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    dimensions.forEach((dim, i) => {
      const value = attributes[dim] || 50;
      const r = radius * (value / 100);
      const angle = angleStep * i - Math.PI / 2;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#C41E3A';
      ctx.fill();
    });
  },

  showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
  },

  retry() {
    this.startQuiz();
  },

  showShareModal() {
    document.getElementById('shareModal').classList.add('active');
  },

  hideShareModal() {
    document.getElementById('shareModal').classList.remove('active');
  },

  async saveImage() {
    const character = this.currentResult.character;
    const canvas = document.getElementById('posterCanvas');
    const ctx = canvas.getContext('2d');
    
    // 增加画布高度以容纳更多信息
    canvas.width = 750;
    canvas.height = 1500;
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 1500);
    gradient.addColorStop(0, '#1A1A1A');
    gradient.addColorStop(1, '#0A0A0A');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 750, 1500);
    
    // 标题在最上面
    ctx.font = 'bold 36px Noto Serif SC, serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#C41E3A';
    ctx.fillText('测一测你是镖人中的哪个角色', 375, 80);
    
    // 分隔线
    ctx.strokeStyle = '#2D2D2D';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, 100);
    ctx.lineTo(650, 100);
    ctx.stroke();
    
    // 角色 Emoji
    ctx.font = '120px serif';
    ctx.textAlign = 'center';
    ctx.fillText(character.emoji, 375, 260);
    
    // 角色名称
    ctx.font = 'bold 56px Noto Serif SC, serif';
    ctx.fillStyle = '#F5F5F0';
    ctx.fillText(character.name, 375, 380);
    
    // 匹配度
    ctx.font = 'bold 72px Noto Sans SC';
    ctx.fillStyle = '#C41E3A';
    ctx.fillText(`${this.currentResult.matchPercent}%`, 375, 480);
    ctx.font = '24px Noto Sans SC';
    ctx.fillStyle = '#888';
    ctx.fillText('匹配度', 375, 520);
    
    // 经典语录（加引号）
    ctx.font = 'italic 24px Noto Serif SC, serif';
    ctx.fillStyle = '#999';
    ctx.textAlign = 'center';
    ctx.fillText('"', 375 - 280, 600);
    
    ctx.font = '24px Noto Serif SC, serif';
    ctx.fillStyle = '#E8E4DC';
    ctx.textAlign = 'center';
    
    const quote = character.quote;
    const maxWidth = 600;
    const words = quote.split('');
    let line = '';
    let y = 620;
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, 375, y);
        line = words[n];
        y += 40;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 375, y);
    
    // 结束引号
    ctx.font = 'italic 24px Noto Serif SC, serif';
    ctx.fillStyle = '#999';
    ctx.fillText('"', 375 + 280, y);
    
    // 角色描述
    y += 60;
    ctx.font = '22px Noto Sans SC';
    ctx.fillStyle = '#999';
    const desc = character.description;
    const descLines = [];
    line = '';
    for (let n = 0; n < desc.length; n++) {
      const testLine = line + desc[n];
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        descLines.push(line);
        line = desc[n];
      } else {
        line = testLine;
      }
    }
    descLines.push(line);
    
    descLines.forEach((descLine, i) => {
      ctx.fillText(descLine, 375, y + i * 34);
    });
    
    // 关键词标签
    y += descLines.length * 34 + 40;
    ctx.font = '20px Noto Sans SC';
    ctx.fillStyle = '#E8E4DC';
    const keywords = character.keywords || [];
    keywords.forEach((keyword, i) => {
      const tagWidth = ctx.measureText(keyword).width + 30;
      const startX = 375 - (keywords.length * 100 / 2) + i * 100;
      
      // 标签背景
      ctx.fillStyle = '#2D2D2D';
      ctx.fillRect(startX - ctx.measureText(keyword).width/2 - 15, y - 25, ctx.measureText(keyword).width + 30, 36);
      
      // 标签文字
      ctx.fillStyle = '#E8E4DC';
      ctx.fillText(keyword, startX, y);
    });
    
    // 绘制雷达图
    this.drawPosterRadar(ctx, character.attributes, 375, y + 100);
    
    // 底部信息
    ctx.font = '24px Noto Sans SC';
    ctx.fillStyle = '#666';
    ctx.fillText('扫码参与测试', 375, 1350);
    ctx.font = '18px Noto Sans SC';
    ctx.fillStyle = '#444';
    ctx.fillText('12道题 · 揭示你的江湖灵魂', 375, 1380);
    
    try {
      const link = document.createElement('a');
      link.download = `镖人测试-${character.name}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      this.showToast('图片已保存');
    } catch (error) {
      console.error('保存失败:', error);
      this.showToast('保存失败，请重试');
    }
    
    this.hideShareModal();
  },

  // 绘制海报雷达图
  drawPosterRadar(ctx, attributes, centerX, centerY) {
    const radius = 70;
    const dimensions = ['武力', '智谋', '信义', '仁心', '自由'];
    const angleStep = (Math.PI * 2) / dimensions.length;
    
    // 背景网格
    ctx.strokeStyle = '#2D2D2D';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      const r = radius * (i / 4);
      for (let j = 0; j <= dimensions.length; j++) {
        const angle = angleStep * j - Math.PI / 2;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }
    
    // 坐标轴
    dimensions.forEach((dim, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
      
      // 标签
      ctx.fillStyle = '#888';
      ctx.font = '14px Noto Sans SC';
      ctx.textAlign = 'center';
      const labelX = centerX + (radius + 18) * Math.cos(angle);
      const labelY = centerY + (radius + 18) * Math.sin(angle);
      ctx.fillText(dim, labelX, labelY + 4);
    });
    
    // 数据区域
    ctx.beginPath();
    ctx.fillStyle = 'rgba(196, 30, 58, 0.25)';
    ctx.strokeStyle = '#C41E3A';
    ctx.lineWidth = 2;
    
    dimensions.forEach((dim, i) => {
      const value = attributes[dim] || 50;
      const r = radius * (value / 100);
      const angle = angleStep * i - Math.PI / 2;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // 数据点
    dimensions.forEach((dim, i) => {
      const value = attributes[dim] || 50;
      const r = radius * (value / 100);
      const angle = angleStep * i - Math.PI / 2;
      const x = centerX + r * Math.cos(angle);
      const y = centerY + r * Math.sin(angle);
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#C41E3A';
      ctx.fill();
    });
  },

  async copyLink() {
    const text = `我是【${this.currentResult.character.name}】！测一测你是镖人中的哪个角色 → ${window.location.href}`;
    
    try {
      await navigator.clipboard.writeText(text);
      this.showToast('链接已复制');
    } catch (error) {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.showToast('链接已复制');
    }
    
    this.hideShareModal();
  },

  showToast(message) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(26, 26, 26, 0.95);
      color: #F5F5F0;
      padding: 12px 24px;
      border: 1px solid #2D2D2D;
      font-size: 14px;
      z-index: 200;
      animation: fadeIn 0.3s ease;
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  QuizApp.init();
});

window.QuizApp = QuizApp;
