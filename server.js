const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/api/download', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).json({ error: 'URL이 필요합니다.' });

  try {
    const response = await axios.get('https://tiktok-download-without-watermark.p.rapidapi.com/analysis', {
      params: { url: videoUrl },
      headers: {
        'X-RapidAPI-Key': '307f19412emsh22f8be14ecefdc4p1f7d24jsn6ca73a5a433f', // <-- 여기에 키 입력
        'X-RapidAPI-Host': 'tiktok-download-without-watermark.p.rapidapi.com'
      },
      timeout: 10000
    });

    if (response.data && response.data.data) {
      const d = response.data.data;
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
    console.error(err);
  }

  res.json({ success: false, error: '영상 정보를 가져오지 못했습니다. 키 설정 또는 링크를 확인해 주세요.' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));