const API_KEY = localStorage.getItem('ytApiKey') || 'YOUR_API_KEY';
let settings = {
    theme: 'dark',
    maxResults: 24,
    order: 'date',
    country: 'TR',
    safeSearch: true
};

// TEMA YÖNETİMİ
function changeTheme(theme) {
    settings.theme = theme;
    document.getElementById('theme-style').href = `themes/${theme}.css`;
    localStorage.setItem('ytSettings', JSON.stringify(settings));
}

// VİDEO OYNATMA
function playVideo(videoId) {
    window.location.href = `video.html?id=${videoId}`;
}

// VİDEO LİSTELEME
async function loadContent() {
    try {
        const params = new URLSearchParams({
            part: 'snippet,contentDetails,statistics',
            chart: 'mostPopular',
            regionCode: settings.country,
            maxResults: settings.maxResults,
            key: API_KEY,
            safeSearch: settings.safeSearch ? 'strict' : 'none'
        });

        const response = await fetch(`${YT_API_URL}/videos?${params}`);
        const data = await response.json();
        renderVideos(data.items);
    } catch (error) {
        console.error('Hata:', error);
        showError('İçerik yüklenemedi');
    }
}

// VİDEO KARTLARI
function renderVideos(videos) {
    const container = document.getElementById('videoGrid');
    container.innerHTML = videos.map(video => `
        <div class="video-card" onclick="playVideo('${video.id}')">
            <img src="${video.snippet.thumbnails.medium.url}" class="thumbnail">
            <div class="video-info">
                <h4>${video.snippet.title}</h4>
                <p>${video.snippet.channelTitle}</p>
                <small>
                    ${new Date(video.snippet.publishedAt).toLocaleDateString('tr-TR')} • 
                    ${video.contentDetails.duration.replace('PT', '').toLowerCase()}
                </small>
            </div>
        </div>
    `).join('');
}

// AYARLAR YÖNETİMİ
function toggleSettings() {
    const modal = document.getElementById('settingsModal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
    document.getElementById('maxResults').value = settings.maxResults;
    document.getElementById('order').value = settings.order;
    document.getElementById('country').value = settings.country;
    document.getElementById('safeSearch').checked = settings.safeSearch;
}

function saveSettings() {
    settings = {
        ...settings,
        maxResults: document.getElementById('maxResults').value,
        order: document.getElementById('order').value,
        country: document.getElementById('country').value,
        safeSearch: document.getElementById('safeSearch').checked
    };
    localStorage.setItem('ytSettings', JSON.stringify(settings));
    loadContent();
    toggleSettings();
}

// BAŞLANGIÇ
document.addEventListener('DOMContentLoaded', () => {
    const savedSettings = localStorage.getItem('ytSettings');
    if(savedSettings) {
        settings = JSON.parse(savedSettings);
        changeTheme(settings.theme);
    }
    loadContent();
});
