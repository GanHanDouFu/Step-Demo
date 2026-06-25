require('dotenv').config();

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, personality, hobbies, gender, era, mbti, zodiac, chineseZodiac } = req.body;

  if (!personality && !hobbies && !mbti) {
    return res.status(400).json({ error: '请至少填写性格、爱好，或选择 MBTI' });
  }

  const apiKey = process.env.API_KEY;
  const apiBase = process.env.API_BASE_URL || 'https://api.deepseek.com/v1';
  const model = process.env.MODEL || 'deepseek-chat';

  if (!apiKey) {
    return res.status(500).json({ error: '服务端未配置 API Key，请在 Vercel 环境变量中设置 API_KEY' });
  }

  const genderHint = gender && gender !== '不限' ? `性别偏好：${gender}` : '性别不限，根据性格自然选择';
  const eraHint = era && era !== '不限' ? `偏好时代：${era}` : '时代不限，根据性格匹配最合适的朝代';

  let personalityDesc = '';
  if (mbti) personalityDesc += `MBTI人格类型：${mbti}；`;
  if (zodiac) personalityDesc += `星座：${zodiac}；`;
  if (chineseZodiac) personalityDesc += `生肖：${chineseZodiac}；`;
  if (personality) personalityDesc += `自我描述：${personality}；`;

  const nameHint = name ? `【真实姓名】${name}` : '';

  const prompt = `你是一位精通中国历史文化的学者，擅长根据现代人的性格描述，为其创造一个古代身份。你熟读《史记》《世说新语》《聊斋志异》等古典文学，对各朝代的文人逸事如数家珍。

请根据以下现代人的描述，创造一个古风身份：

${nameHint}
【性格特征】${personalityDesc || '未提供'}
【兴趣爱好】${hobbies || '未提供'}
【${genderHint}】
【${eraHint}】

要求：
1. 名字要有典故出处，2-4个字，符合所选朝代的命名习惯。${name ? `古风名与用户真名"${name}"的关联方式要灵活多变，每次从不同角度切入：有时沿用姓氏、取名字中的一字谐音或化用；有时取名字中某个字的含义进行古风转化（如"明"化为"昭"、"浩"化为"沧"）；有时根据名字的整体意境重新演绎。不要每次都用同一种方式。` : '姓氏要丰富多样，每次生成必须使用不同的姓氏，优先选择不常见的姓氏。'}
2. name_origin 要解释古风名字与${name ? `用户真名"${name}"的渊源关系` : ''}，以及典故出处和含义（2-3句话）
3. 小传要用文言与白话结合的风格（类似《世说新语》），有具体轶事，150-250字${name ? '。小传中可以自然提及此人与"' + name + '"的关联，但不要每次都用同样的方式。' : ''}
4. 古人知己必须是真实历史人物，要说明具体的人生阶段和相识故事。friend_stage 格式严格为"阶段·朝代年号"（如"壮年游历·开元年间"），不可只写阶段不写时期。阶段要多样化。时期必须是真实历史年号。
5. 赠言要仿写古人风格，有韵味

请严格按以下JSON格式返回，不要有其他文字：
{
  "name": "古风名字",
  "name_origin": "名字的典故、出处和含义（2-3句话）",
  "biography": "以古代传记风格书写的人物小传（150-250字）",
  "friend": "匹配的真实历史人物姓名",
  "friend_era": "历史人物的时代和身份，简短一句话",
  "friend_stage": "你们在人生哪个阶段相遇（如：壮年游历·开元年间）",
  "friend_story": "你们相识成为朋友的故事（60-100字）",
  "friend_reason": "为什么你们会成为知己（20-40字）",
  "friend_quote": "知己送你的一句话（仿古人风格，15-30字）",
  "scene": "用第二人称（'你'）描写你与这位知己相遇的那个瞬间，100-150字"
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
      return res.status(response.status).json({ error: `AI 接口错误 (${response.status}): ${errBody}` });
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
        try {
          parsed = JSON.parse(match[0]);
        } catch {
          const cleaned2 = match[0].replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
          parsed = JSON.parse(cleaned2);
        }
      }
    }

    if (!parsed || !parsed.name) {
      return res.status(500).json({ error: 'AI 返回数据格式异常，请重试' });
    }

    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: `请求失败: ${err.message}` });
  }
};
