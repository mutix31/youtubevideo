const API_KEY = 'YOUR_API_KEY';
let settings = {
    theme: 'dark',
    maxResults: 24,
    order: 'date',
    country: 'TR',
    safeSearch: true
};

// Tema Yönetimi
function changeTheme(theme) {
    settings.theme = theme;
    document.getElementById('theme-style').href = `themes/${theme}.css`;
}

// Video Yükleme
async function loadContent() {
    const params = {
        part: 'snippet',
        chart: 'mostPopular',
        regionCode: settings.country,
        maxResults: settings.maxResults,
        order: settings.order,
        safeSearch: settings.safeSearch ? 'strict' : 'none',
        key: API_KEY
    };

    try {
        const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?${new URLSearchParams(params)}`);
        const data = await response.json();
        renderVideos(data.items);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Video Oynatıcı
function playVideo(videoId) {
    window.location.href = `video.html?id=${videoId}`;
}

// Video Detay Sayfası (video.js)
async function loadVideoDetails() {
    const videoId = new URLSearchParams(window.location.search).get('id');
    
    const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${API_KEY}`);
    const data = await response.json();
    
    const video = data.items[0];
    document.getElementById('videoTitle').textContent = video.snippet.title;
    document.getElementById('description').textContent = video.snippet.description;
    document.getElementById('viewCount').textContent = `${video.statistics.viewCount} görüntülenme`;
    document.getElementById('likeCount').textContent = `${video.statistics.likeCount} beğeni`;
    document.getElementById('publishDate').textContent = new Date(video.snippet.publishedAt).toLocaleDateString();

    // YouTube Player API
    new YT.Player('player', {
        height: '500',
        width: '100%',
        videoId: videoId,
        playerVars: {
            autoplay: 1,
            controls: 1,
            modestbranding: 1
        }
    });
}

// Ayarlar Yönetimi
function saveSettings() {
    settings.maxResults = document.getElementById('maxResults').value;
    settings.order = document.getElementById('order').value;
    localStorage.setItem('ytSettings', JSON.stringify(settings));
    loadContent();
}
