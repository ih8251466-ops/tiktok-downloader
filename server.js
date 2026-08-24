const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/api/download', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).json({ error: 'URL이 필요합니다.' });

  try {
    // 1차 API 시도 (TikWM)
    let response = await axios.get(`https://api.tikwm.com/api/?url=${encodeURIComponent(videoUrl)}`, { timeout: 5000 }).catch(() => null);
    
    if (response && response.data && response.data.data) {
      const data = response.data.data;
      return res.json({
        success: true,
        title: data.title || 'TikTok Video',
        cover: data.cover,
        author: data.author?.nickname || data.author?.unique_id || 'TikTok User',
        views: data.play_count || 0,
        likes: data.digg_count || 0,
        videoUrl: data.play
      });
    }

    // 2차 API 시도 (대체 API)
    const altResponse = await axios.get(`https://www.tikwm.com/api/?url=${encodeURIComponent(videoUrl)}`);
    if (altResponse.data && altResponse.data.data) {
      const data = altResponse.data.data;
      return res.json({
        success: true,
        title: data.title || 'TikTok Video',
        cover: data.cover,
        author: data.author?.nickname || 'TikTok User',
        views: data.play_count || 0,
        likes: data.digg_count || 0,
        videoUrl: data.play
      });
    }

    res.json({ success: false, error: '영상 정보를 가져오지 못했습니다. 링크를 다시 확인해주세요.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: '서버 에러가 발생했습니다. 잠시 후 다시 시도해주세요.' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));