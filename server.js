const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/api/download', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).json({ error: 'URL이 필요합니다.' });

  try {
    // Cobalt 오픈소스 공용 엔드포인트 활용
    const response = await axios.post('https://co.wuk.sh/api/json', {
      url: videoUrl,
      vCodec: 'h264',
      isNoWatermark: true
    }, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    if (response.data && response.data.url) {
      return res.json({
        success: true,
        title: 'TikTok Video',
        cover: '',
        author: 'TikTok User',
        views: 0,
        likes: 0,
        videoUrl: response.data.url
      });
    }
  } catch (err) {
    console.log('Cobalt API 시도 실패:', err.message);
  }

  // 대체 2차 API 시도
  try {
    const res2 = await axios.get(`https://api.v2.tikwm.com/api/?url=${encodeURIComponent(videoUrl)}`, { timeout: 8000 });
    if (res2.data && res2.data.data) {
      const d = res2.data.data;
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
    error: '현재 틱톡 서버 보안 강화로 인해 추출이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.'
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));