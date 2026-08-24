const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/api/download', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).json({ error: 'URL이 필요합니다.' });

  // 1차 시도: Lovelytik API
  try {
    const api1 = await axios.get(`https://api.lovelytik.com/api/free/tiktok?url=${encodeURIComponent(videoUrl)}`, { timeout: 6000 });
    if (api1.data && api1.data.status === 'success') {
      const d = api1.data.data;
      return res.json({
        success: true,
        title: d.title || 'TikTok Video',
        cover: d.cover,
        author: d.author || 'TikTok User',
        views: d.play_count || 0,
        likes: d.digg_count || 0,
        videoUrl: d.nowatermark || d.play
      });
    }
  } catch (err) {}

  // 2차 시도: TikWM API 우회 헤더 적용
  try {
    const api2 = await axios.post('https://www.tikwm.com/api/', new URLSearchParams({ url: videoUrl }).toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15'
      },
      timeout: 6000
    });

    if (api2.data && api2.data.data) {
      const d = api2.data.data;
      return res.json({
        success: true,
        title: d.title || 'TikTok Video',
        cover: d.cover,
        author: d.author?.nickname || 'TikTok User',
        views: d.play_count || 0,
        likes: d.digg_count || 0,
        videoUrl: d.play
      });
    }
  } catch (err) {}

  res.json({
    success: false,
    error: '외부 틱톡 API 서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해보시거나 링크를 다시 확인해주세요.'
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));