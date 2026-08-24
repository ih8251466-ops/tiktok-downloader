const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/api/download', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).json({ error: 'URL이 필요합니다.' });

  const headers = {
    'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1',
    'Referer': 'https://www.tiktok.com/'
  };

  // 1차 시도: TikWM API (POST 요청 방식)
  try {
    const res1 = await axios.post('https://www.tikwm.com/api/', new URLSearchParams({ url: videoUrl, hd: 1 }).toString(), {
      headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      timeout: 7000
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
  } catch (e) {}

  // 2차 시도: Lovelytik API
  try {
    const res2 = await axios.get(`https://api.lovelytik.com/api/free/tiktok?url=${encodeURIComponent(videoUrl)}`, { headers, timeout: 7000 });
    if (res2.data && res2.data.status === 'success') {
      const d = res2.data.data;
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
  } catch (e) {}

  // 3차 시도: TikWM 대체 엔드포인트 GET 방식
  try {
    const res3 = await axios.get(`https://api.tikwm.com/api/?url=${encodeURIComponent(videoUrl)}`, { headers, timeout: 7000 });
    if (res3.data && res3.data.data) {
      const d = res3.data.data;
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
  } catch (e) {}

  res.json({
    success: false,
    error: '영상 정보를 가져오지 못했습니다. 링크를 다시 확인해주시거나 잠시 후 시도해주세요.'
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));