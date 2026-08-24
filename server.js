const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.post('/api/download', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: '틱톡 링크를 입력해 주세요.' });

    try {
        const response = await axios.post('https://www.tikwm.com/api/', {
            url: url,
            hd: 1
        });

        const data = response.data;
        if (data.code === 0) {
            res.json({
                success: true,
                title: data.data.title || '틱톡 영상',
                videoUrl: data.data.play,
                author: data.data.author.nickname
            });
        } else {
            res.status(400).json({ error: '영상을 찾을 수 없습니다.' });
        }
    } catch (err) {
        res.status(500).json({ error: '서버 연결 실패' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 서버 실행 중: http://localhost:${PORT}`));