// API Anahtarını localStorage'dan al
const API_KEY = localStorage.getItem('ytApiKey') || 'YOUR_API_KEY';

// YouTube Player instance'ı
let player;

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    const videoId = getVideoIdFromURL();
    if(videoId) {
        loadVideoDetails(videoId);
        loadRelatedVideos(videoId);
    } else {
        showError('Video bulunamadı');
    }
});

// URL'den video ID'sini alma
function getVideoIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

// Video detaylarını yükle
async function loadVideoDetails(videoId) {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${API_KEY}`
        );
        const data = await response.json();
        
        if(data.items.length === 0) throw new Error('Video bulunamadı');
        
        const video = data.items[0];
        updateVideoInfo(video);
        initializePlayer(videoId);
        loadChannelInfo(video.snippet.channelId);
    } catch (error) {
        showError(error.message);
    }
}

// Kanal bilgilerini yükle
async function loadChannelInfo(channelId) {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${API_KEY}`
        );
        const data = await response.json();
        
        const channel = data.items[0];
        document.getElementById('channel-thumbnail').src = channel.snippet.thumbnails.default.url;
        document.getElementById('channel-title').textContent = channel.snippet.title;
        document.getElementById('subscribers').textContent = 
            `${formatNumber(channel.statistics.subscriberCount)} abone`;
    } catch (error) {
        console.error('Kanal bilgileri yüklenemedi:', error);
    }
}

// İlgili videoları yükle
async function loadRelatedVideos(videoId) {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&relatedToVideoId=${videoId}&maxResults=5&key=${API_KEY}`
        );
        const data = await response.json();
        
        const relatedVideos = data.items;
        const list = document.getElementById('related-videos-list');
        
        list.innerHTML = relatedVideos.map(video => `
            <div class="related-video" onclick="window.location.href='video.html?id=${video.id.videoId}'">
                <img src="${video.snippet.thumbnails.medium.url}" alt="${video.snippet.title}">
                <h4>${video.snippet.title}</h4>
                <p>${video.snippet.channelTitle}</p>
            </div>
        `).join('');
    } catch (error) {
        console.error('İlgili videolar yüklenemedi:', error);
    }
}

// Video oynatıcıyı başlat
function initializePlayer(videoId) {
    player = new YT.Player('player', {
        height: '500',
        width: '100%',
        videoId: videoId,
        playerVars: {
            autoplay: 1,
            controls: 1,
            modestbranding: 1,
            rel: 0
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// Oynatıcı hazır olduğunda
function onPlayerReady(event) {
    event.target.playVideo();
}

// Oynatıcı durum değişiklikleri
function onPlayerStateChange(event) {
    // İsteğe bağlı: Oynatma durumu takibi
}

// Video bilgilerini güncelle
function updateVideoInfo(video) {
    document.getElementById('video-title').textContent = video.snippet.title;
    document.getElementById('description').textContent = video.snippet.description;
    document.getElementById('views').textContent = 
        `${formatNumber(video.statistics.viewCount)} görüntülenme`;
    document.getElementById('likes').textContent = 
        `${formatNumber(video.statistics.likeCount)} beğeni`;
    document.getElementById('date').textContent = 
        new Date(video.snippet.publishedAt).toLocaleDateString('tr-TR');
}

// Hata gösterimi
function showError(message) {
    document.body.innerHTML = `
        <div class="error-container">
            <h2>⚠️ Hata Oluştu</h2>
            <p>${message}</p>
            <button onclick="window.history.back()">Geri Dön</button>
        </div>
    `;
}

// Sayı formatlama
function formatNumber(num) {
    return Intl.NumberFormat('tr-TR').format(num);
}
