// YouTube API Konfigürasyon
const YT_API_URL = 'https://www.googleapis.com/youtube/v3';
let API_KEY = localStorage.getItem('ytApiKey') || '';

// DOM Elementleri
const settingsModal = document.getElementById('settingsModal');
const apiKeyInput = document.getElementById('apiKey');
const searchInput = document.getElementById('searchInput');
const videoGrid = document.getElementById('videoGrid');

// Ayarlar Fonksiyonları
function toggleSettings() {
    settingsModal.style.display = settingsModal.style.display === 'block' ? 'none' : 'block';
    apiKeyInput.value = API_KEY;
}

function saveSettings() {
    API_KEY = apiKeyInput.value;
    localStorage.setItem('ytApiKey', API_KEY);
    toggleSettings();
    loadTrendingVideos();
}

// Video İşlemleri
async function loadTrendingVideos() {
    if (!API_KEY) return alert('Lütfen API anahtarınızı ayarlayın');
    
    try {
        const url = new URL(`${YT_API_URL}/videos`);
        url.search = new URLSearchParams({
            part: 'snippet,statistics,contentDetails',
            chart: 'mostPopular',
            regionCode: 'TR',
            maxResults: 24,
            key: API_KEY
        });

        const response = await fetch(url);
        const data = await response.json();
        renderVideos(data.items);
    } catch (error) {
        console.error('API Hatası:', error);
        alert('Video yüklenirken hata oluştu');
    }
}

async function searchVideos(query) {
    if (!API_KEY) return alert('Lütfen API anahtarınızı ayarlayın');
    
    try {
        const searchUrl = new URL(`${YT_API_URL}/search`);
        searchUrl.search = new URLSearchParams({
            part: 'snippet',
            q: query,
            type: 'video',
            maxResults: 24,
            safeSearch: 'moderate',
            key: API_KEY
        });

        const searchResponse = await fetch(searchUrl);
        const searchData = await searchResponse.json();
        
        const videoIds = searchData.items.map(item => item.id.videoId);
        const videosUrl = new URL(`${YT_API_URL}/videos`);
        videosUrl.search = new URLSearchParams({
            part: 'snippet,statistics,contentDetails',
            id: videoIds.join(','),
            key: API_KEY
        });

        const videosResponse = await fetch(videosUrl);
        const videosData = await videosResponse.json();
        renderVideos(videosData.items);
    } catch (error) {
        console.error('Arama Hatası:', error);
        alert('Arama sırasında hata oluştu');
    }
}

function renderVideos(videos) {
    videoGrid.innerHTML = videos.map(video => `
        <div class="video-card" onclick="playVideo('${video.id}')">
            <img src="${video.snippet.thumbnails.medium.url}" 
                 class="thumbnail" 
                 alt="${video.snippet.title}">
            <div style="padding: 1rem">
                <h4>${video.snippet.title}</h4>
                <p>${video.snippet.channelTitle}</p>
                <small>
                    ${formatNumber(video.statistics.viewCount)} görüntülenme • 
                    ${formatDuration(video.contentDetails.duration)}
                </small>
            </div>
        </div>
    `).join('');
}

// Yardımcı Fonksiyonlar
function formatDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;
    
    return [
        hours > 0 ? hours.toString().padStart(2, '0') : null,
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0')
    ].filter(Boolean).join(':');
}

function formatNumber(num) {
    return parseInt(num).toLocaleString('tr-TR');
}

function playVideo(videoId) {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
}

function handleSearch(event) {
    if (event.key === 'Enter') {
        searchVideos(event.target.value);
    }
}

// Sayfa Yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    if (API_KEY) loadTrendingVideos();
});
