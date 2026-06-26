const path = require('path');
const POETRY = require('../poetry.js');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { pathname } = new URL(req.url, `http://${req.headers.host}`);

  // ── GET /api/poetry ──
  if (pathname === '/api/poetry' && req.method === 'GET') {
    const count = parseInt(req.query.count) || POETRY.length;
    const shuffled = [...POETRY].sort(() => Math.random() - 0.5);
    return res.json(shuffled.slice(0, count));
  }

  // ── POST /api/generate ──
  if (pathname === '/api/generate' && req.method === 'POST') {
    const { name, personality, hobbies, gender, era, mbti, zodiac, chineseZodiac } = req.body;

    if (!personality && !hobbies && !mbti) {
      return res.status(400).json({ error: '请至少填写性格、爱好，或选择 MBTI' });
    }

    const apiKey = process.env.API_KEY;
    const apiBase = process.env.API_BASE_URL || 'https://api.deepseek.com/v1';
    const model = process.env.MODEL || 'deepseek-chat';

    if (!apiKey) return res.status(500).json({ error: '未配置 API Key' });

    const genderHint = gender && gender !== '不限' ? `性别偏好：${gender}` : '性别不限，根据性格自然选择';
    const eraHint = era && era !== '不限' ? `偏好时代：${era}` : '时代不限，根据性格匹配最合适的朝代';

    let personalityDesc = '';
    if (mbti) personalityDesc += `MBTI人格类型：${mbti}；`;
    if (zodiac) personalityDesc += `星座：${zodiac}；`;
    if (chineseZodiac) personalityDesc += `生肖：${chineseZodiac}；`;
    if (personality) personalityDesc += `自我描述：${personality}；`;

    const nameHint = name ? `【真实姓名】${name}` : '';

    const prompt = `你是一位精通中国历史文化的学者。请根据以下现代人的描述，创造一个古风身份：

${nameHint}
【性格特征】${personalityDesc || '未提供'}
【兴趣爱好】${hobbies || '未提供'}
【${genderHint}】
【${eraHint}】

要求：
1. 名字要有典故出处，2-4个字。${name ? `古风名与用户真名"${name}"的关联方式要灵活多变。` : '姓氏要丰富多样，优先选择不常见的姓氏。'}
2. name_origin 解释名字典故和含义（2-3句话）
3. 小传用文言与白话结合风格，有具体轶事，150-250字
4. 古人知己必须是真实历史人物。friend_stage 格式严格为"阶段·朝代年号"（如"壮年游历·开元年间"），时期必须是真实历史年号。
5. friend_era 简短一句话（如"唐代诗人"）
6. 赠言仿古人风格

请严格按JSON格式返回：
{
  "name": "古风名字",
  "name_origin": "名字典故出处（2-3句话）",
  "biography": "人物小传（150-250字）",
  "friend": "历史人物姓名",
  "friend_era": "时代身份（简短一句话）",
  "friend_stage": "阶段·朝代年号",
  "friend_story": "相识故事（60-100字）",
  "friend_reason": "为何成为知己（20-40字）",
  "friend_quote": "知己赠言（15-30字）",
  "scene": "相遇场景描写（100-150字）"
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
            { role: 'system', content: '你是一位精通中国历史文化的AI学者。请始终以JSON格式回复。' },
            { role: 'user', content: prompt },
          ],
          temperature: 0.85,
          max_tokens: 3000,
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        return res.status(response.status).json({ error: `AI 接口错误: ${errBody}` });
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) return res.status(500).json({ error: 'AI 返回内容为空' });

      let parsed;
      let cleaned = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
          try { parsed = JSON.parse(match[0]); }
          catch { parsed = JSON.parse(match[0].replace(/,\s*}/g, '}').replace(/,\s*]/g, ']')); }
        }
      }

      if (!parsed || !parsed.name) return res.status(500).json({ error: 'AI 返回格式异常，请重试' });

      return res.json(parsed);
    } catch (err) {
      return res.status(500).json({ error: `请求失败: ${err.message}` });
    }
  }

  // ── 其他路径 → 404 ──
  res.status(404).json({ error: 'Not found' });
};
