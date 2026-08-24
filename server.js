const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/api/download', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).json({ error: 'URL이 필요합니다.' });

  try {
    const apiRes = await axios.get(`https://tikwm.com/api/?url=${encodeURIComponent(videoUrl)}`);
    const data = apiRes.data.data;

    if (!data) return res.json({ success: false, error: '영상을 찾을 수 없습니다.' });

    res.json({
      success: true,
      title: data.title,
      cover: data.cover,
      author: data.author.nickname || data.author.unique_id,
      views: data.play_count,
      likes: data.digg_count,
      videoUrl: data.play // 워터마크 없는 영상 URL
    });
  } catch (error) {
    res.status(500).json({ success: false, error: '서버 에러가 발생했습니다.' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));