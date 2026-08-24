const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// 모바일 강제 다운로드 우회 라우트
app.get('/download', async (req, res) => {
  const videoUrl = req.query.url;
  if (!videoUrl) return res.status(400).send('URL이 필요합니다.');

  try {
    const response = await axios({
      method: 'get',
      url: videoUrl,
      responseType: 'stream',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    // 브라우저에게 비디오 재생이 아닌 파일 다운로드임을 강제 지정
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="tiktok_video_${Date.now()}.mp4"`);

    response.data.pipe(res);
  } catch (error) {
    console.error('Download proxy error:', error.message);
    res.status(500).send('다운로드 처리 중 오류가 발생했습니다.');
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));