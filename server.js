const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// ── 加载环境变量 ──
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── 数据目录 ──
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const HISTORY_FILE = path.join(DATA_DIR, 'history.json');
if (!fs.existsSync(HISTORY_FILE)) fs.writeFileSync(HISTORY_FILE, '[]', 'utf-8');

// ── 古诗词库 ──
const POETRY = require('./poetry.js');

// ═══════════════════════════════════════
// API: 随机诗词
// ═══════════════════════════════════════
app.get('/api/poetry', (req, res) => {
  const count = Math.min(parseInt(req.query.count) || 1, 5);
  const shuffled = [...POETRY].sort(() => Math.random() - 0.5);
  res.json(shuffled.slice(0, count));
});

// ═══════════════════════════════════════
// API: 代理 AI 请求（隐藏 Key）
// ═══════════════════════════════════════
app.post('/api/generate', async (req, res) => {
  const { personality, hobbies, gender, era, mbti, zodiac, chineseZodiac } = req.body;

  if (!personality && !hobbies && !mbti) {
    return res.status(400).json({ error: '请至少填写性格、爱好，或选择 MBTI' });
  }

  const apiKey = process.env.API_KEY;
  const apiBase = process.env.API_BASE_URL || 'https://api.deepseek.com/v1';
  const model = process.env.MODEL || 'deepseek-chat';

  if (!apiKey) {
    return res.status(500).json({ error: '服务端未配置 API Key，请在 .env 文件中设置 API_KEY' });
  }

  const genderHint = gender && gender !== '不限' ? `性别偏好：${gender}` : '性别不限，根据性格自然选择';
  const eraHint = era && era !== '不限' ? `偏好时代：${era}` : '时代不限，根据性格匹配最合适的朝代';

  // 构建性格描述
  let personalityDesc = '';
  if (mbti) personalityDesc += `MBTI人格类型：${mbti}；`;
  if (zodiac) personalityDesc += `星座：${zodiac}；`;
  if (chineseZodiac) personalityDesc += `生肖：${chineseZodiac}；`;
  if (personality) personalityDesc += `自我描述：${personality}；`;

  const prompt = `你是一位精通中国历史文化的学者，擅长根据现代人的性格描述，为其创造一个古代身份。你熟读《史记》《世说新语》《聊斋志异》等古典文学，对各朝代的文人逸事如数家珍。

请根据以下现代人的描述，创造一个古风身份：

【性格特征】${personalityDesc || '未提供'}
【兴趣爱好】${hobbies || '未提供'}
【${genderHint}】
【${eraHint}】

要求：
1. 名字要有典故出处，2-4个字，符合所选朝代的命名习惯。姓氏要丰富多样，每次生成必须使用不同的姓氏，优先选择不常见的姓氏（如：谢、陆、裴、崔、萧、卫、桓、庾、温、柳、白、元、韩、贺、顾、程、阮、陶、林、叶、秦、宋、楚、云、岳、龙、凤、慕容、上官、司马、欧阳、诸葛、独孤、长孙、宇文、令狐、公孙、端木、东方、南宫、百里、轩辕等），避免总是用沈、王、李、张等大姓。
2. 小传要用文言与白话结合的风格（类似《世说新语》），有具体轶事，150-250字
3. 古人知己必须是真实历史人物，要说明具体的人生阶段和相识故事
4. 赠言要仿写古人风格，有韵味

请严格按以下JSON格式返回，不要有其他文字：
{
  "name": "古风名字",
  "name_origin": "名字的典故、出处和含义（2-3句话）",
  "biography": "以古代传记风格书写的人物小传（150-250字）",
  "friend": "匹配的真实历史人物姓名",
  "friend_era": "历史人物的时代和身份简介",
  "friend_stage": "你们在人生哪个阶段相遇（如：年少求学/壮年游历/中年失意/晚年归隐）",
  "friend_story": "你们相识成为朋友的故事（60-100字）",
  "friend_reason": "为什么你们会成为知己（20-40字）",
  "friend_quote": "知己送你的一句话（仿古人风格，15-30字）",
  "scene": "用第二人称（'你'）描写你与这位知己相遇的那个瞬间，像一段微小说的开头，有画面感、有氛围、有对话，100-150字"
}`;

  try {
    const response = await fetch(`${apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: '你是一位精通中国历史文化的AI学者。请始终以JSON格式回复，不要包含任何其他文字或markdown标记。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.85,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      return res.status(response.status).json({ error: `AI 接口错误 (${response.status}): ${errBody}` });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(500).json({ error: 'AI 返回内容为空' });
    }

    // 解析 JSON
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          const cleaned = match[0].replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
          parsed = JSON.parse(cleaned);
        }
      }
    }

    if (!parsed || !parsed.name) {
      return res.status(500).json({ error: 'AI 返回数据格式异常，请重试' });
    }

    // 保存历史
    const record = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      timestamp: new Date().toISOString(),
      input: { personality, hobbies, gender, era },
      result: parsed,
    };

    try {
      const history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
      history.unshift(record);
      // 最多保存 100 条
      if (history.length > 100) history.length = 100;
      fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
    } catch (e) {
      console.error('保存历史失败:', e.message);
    }

    res.json(parsed);
  } catch (err) {
    console.error('API 调用失败:', err.message);
    res.status(500).json({ error: `请求失败: ${err.message}` });
  }
});

// ═══════════════════════════════════════
// API: 历史记录
// ═══════════════════════════════════════
app.get('/api/history', (req, res) => {
  try {
    const history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    res.json(history);
  } catch {
    res.json([]);
  }
});

app.delete('/api/history/:id', (req, res) => {
  try {
    let history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    history = history.filter(r => r.id !== req.params.id);
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), 'utf-8');
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: '删除失败' });
  }
});

// ── 启动 ──
app.listen(PORT, () => {
  console.log(`\n  如果我是古人 — 服务已启动`);
  console.log(`  http://localhost:${PORT}\n`);
});
