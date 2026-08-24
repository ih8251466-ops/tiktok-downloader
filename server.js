const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/api/download', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).json({ error: 'URL이 필요합니다.' });

  // 1차 시도: TikWM 메인 API
  try {
    const res1 = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(videoUrl)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 8000
    });

    if (res1.data && res1.data.data) {
      const d = res1.data.data;
      return res.json({
        success: true,
        title: d.title || 'TikTok Video',
        cover: d.cover,
        author: d.author?.nickname || d.author?.unique_id || 'TikTok User',
        views: d.play_count || 0,
        likes: d.digg_count || 0,
        videoUrl: d.play
      });
    }
  } catch (err) {
    console.log('1차 API 실패, 2차 API 시도 중...');
  }

  // 2차 시도: TikWM 서브 API
  try {
    const res2 = await axios.get(`https://api.tikwm.com/api/?url=${encodeURIComponent(videoUrl)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
      timeout: 8000
    });

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
  } catch (err) {
    console.log('2차 API 실패');
  }

  // 모든 API 실패 시 에러 응답
  res.json({ 
    success: false, 
    error: '틱톡 서버 응답이 지연되고 있습니다. 틱톡 앱의 [공유 -> 링크 복사] 주소인지 확인 후 잠시 후 다시 시도해주세요.' 
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));