const POETRY = [
  { text: '大漠孤烟直，长河落日圆。', author: '王维', source: '使至塞上' },
  { text: '举头望明月，低头思故乡。', author: '李白', source: '静夜思' },
  { text: '海内存知己，天涯若比邻。', author: '王勃', source: '送杜少府之任蜀州' },
  { text: '天生我材必有用，千金散尽还复来。', author: '李白', source: '将进酒' },
  { text: '长风破浪会有时，直挂云帆济沧海。', author: '李白', source: '行路难' },
  { text: '会当凌绝顶，一览众山小。', author: '杜甫', source: '望岳' },
  { text: '无边落木萧萧下，不尽长江滚滚来。', author: '杜甫', source: '登高' },
  { text: '千山鸟飞绝，万径人踪灭。', author: '柳宗元', source: '江雪' },
  { text: '同是天涯沦落人，相逢何必曾相识。', author: '白居易', source: '琵琶行' },
  { text: '春蚕到死丝方尽，蜡炬成灰泪始干。', author: '李商隐', source: '无题' },
  { text: '夕阳无限好，只是近黄昏。', author: '李商隐', source: '乐游原' },
  { text: '独在异乡为异客，每逢佳节倍思亲。', author: '王维', source: '九月九日忆山东兄弟' },
  { text: '行到水穷处，坐看云起时。', author: '王维', source: '终南别业' },
  { text: '桃花潭水深千尺，不及汪伦送我情。', author: '李白', source: '赠汪伦' },
  { text: '安能摧眉折腰事权贵，使我不得开心颜。', author: '李白', source: '梦游天姥吟留别' },
  { text: '今人不见古时月，今月曾经照古人。', author: '李白', source: '把酒问月' },
  { text: '沉舟侧畔千帆过，病树前头万木春。', author: '刘禹锡', source: '酬乐天扬州初逢' },
  { text: '欲穷千里目，更上一层楼。', author: '王之涣', source: '登鹳雀楼' },
  { text: '莫愁前路无知己，天下谁人不识君。', author: '高适', source: '别董大' },
  { text: '曾经沧海难为水，除却巫山不是云。', author: '元稹', source: '离思' },
  { text: '大江东去，浪淘尽，千古风流人物。', author: '苏轼', source: '念奴娇·赤壁怀古' },
  { text: '但愿人长久，千里共婵娟。', author: '苏轼', source: '水调歌头' },
  { text: '竹杖芒鞋轻胜马，谁怕？一蓑烟雨任平生。', author: '苏轼', source: '定风波' },
  { text: '十年生死两茫茫，不思量，自难忘。', author: '苏轼', source: '江城子' },
  { text: '寻寻觅觅，冷冷清清，凄凄惨惨戚戚。', author: '李清照', source: '声声慢' },
  { text: '生当作人杰，死亦为鬼雄。', author: '李清照', source: '夏日绝句' },
  { text: '众里寻他千百度，蓦然回首，那人却在，灯火阑珊处。', author: '辛弃疾', source: '青玉案' },
  { text: '醉里挑灯看剑，梦回吹角连营。', author: '辛弃疾', source: '破阵子' },
  { text: '落花人独立，微雨燕双飞。', author: '晏几道', source: '临江仙' },
  { text: '两情若是久长时，又岂在朝朝暮暮。', author: '秦观', source: '鹊桥仙' },
  { text: '问君能有几多愁？恰似一江春水向东流。', author: '李煜', source: '虞美人' },
  { text: '怒发冲冠，凭栏处、潇潇雨歇。', author: '岳飞', source: '满江红' },
  { text: '山重水复疑无路，柳暗花明又一村。', author: '陆游', source: '游山西村' },
  { text: '人生自古谁无死？留取丹心照汗青。', author: '文天祥', source: '过零丁洋' },
  { text: '先天下之忧而忧，后天下之乐而乐。', author: '范仲淹', source: '岳阳楼记' },
  { text: '路漫漫其修远兮，吾将上下而求索。', author: '屈原', source: '离骚' },
  { text: '逝者如斯夫，不舍昼夜。', author: '孔子', source: '论语' },
  { text: '上善若水，水善利万物而不争。', author: '老子', source: '道德经' },
  { text: '天行健，君子以自强不息。', author: '周易', source: '易经' },
  { text: '落红不是无情物，化作春泥更护花。', author: '龚自珍', source: '己亥杂诗' },
  { text: '滚滚长江东逝水，浪花淘尽英雄。', author: '杨慎', source: '临江仙' },
  { text: '数风流人物，还看今朝。', author: '毛泽东', source: '沁园春·雪' },
];

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
