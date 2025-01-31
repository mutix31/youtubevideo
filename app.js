const API_INSTANCES = {
    piped: [
        'https://pipedapi.leptons.xyz/',
        'https://pipedapi.adminforge.de',
        'https://api.piped.yt',
        'https://pipedapi.drgns.space',
        'https://piapi.ggtyler.dev',
        'https://api.piped.private.coffee',
        'https://pipedapi.ducks.party'
    ],
    invidious: [
        'https://inv.nadeko.net',
        'https://yewtu.be',
        'https://invidious.0011.lt'
    ]
};

let currentSettings = {
    theme: 'dark',
    apiType: 'piped',
    country: 'TR',
    safeSearch: false,
    currentInstance: ''
};

// API Bağlantı Yönetimi
async function findWorkingInstance(apiType) {
    const instances = API_INSTANCES[apiType];
    for (const instance of instances) {
        try {
            const testUrl = `${instance}/trending`;
            const response = await fetch(testUrl, {signal: AbortSignal.timeout(3000)});
            if (response.ok) {
                currentSettings.currentInstance = instance;
                updateApiStatus();
                return instance;
            }
        } catch (error) {
            console.log(`${instance} çalışmıyor: ${error}`);
        }
    }
    throw new Error('Tüm API instance\'ları çalışmıyor');
}

async function initializeApi() {
    try {
        await findWorkingInstance(currentSettings.apiType);
        loadContent();
    } catch (error) {
        document.getElementById('apiStatus').textContent = '❌ API Bağlantı Hatası';
        console.error(error);
    }
}

// Video Yükleme
async function loadContent() {
    try {
        const endpoint = currentSettings.apiType === 'piped' ? '/trending' : '/api/v1/trending';
        const url = new URL(currentSettings.currentInstance + endpoint);
        url.searchParams.set('region', currentSettings.country);
        
        const response = await fetch(url);
        const data = await response.json();
        renderVideos(data);
    } catch (error) {
        console.error('İçerik yüklenirken hata:', error);
    }
}

// Ayarlar Yönetimi
function toggleSettings() {
    const modal = document.getElementById('settingsModal');
    modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
    document.getElementById('themeSelect').value = currentSettings.theme;
    document.getElementById('apiTypeSelect').value = currentSettings.apiType;
    document.getElementById('countrySelect').value = currentSettings.country;
    document.getElementById('safeSearch').checked = currentSettings.safeSearch;
}

function saveSettings() {
    currentSettings = {
        theme: document.getElementById('themeSelect').value,
        apiType: document.getElementById('apiTypeSelect').value,
        country: document.getElementById('countrySelect').value,
        safeSearch: document.getElementById('safeSearch').checked,
        currentInstance: currentSettings.currentInstance
    };
    
    document.documentElement.setAttribute('data-theme', currentSettings.theme);
    localStorage.setItem('ytSettings', JSON.stringify(currentSettings));
    initializeApi();
    toggleSettings();
}

// Diğer Fonksiyonlar
function handleSearch(event) {
    if (event.key === 'Enter') {
        const query = event.target.value;
        search(query);
    }
}

function renderVideos(videos) {
    const container = document.getElementById('videoGrid');
    container.innerHTML = videos.map(video => `
        <div class="video-card" onclick="playVideo('${video.videoId}')">
            <img src="${getThumbnail(video)}" class="thumbnail">
            <div style="padding: 1rem">
                <h4>${video.title}</h4>
                <p>${video.author || video.uploaderName}</p>
                <small>${formatDuration(video.duration || video.lengthSeconds)}</small>
            </div>
        </div>
    `).join('');
}

function getThumbnail(video) {
    return currentSettings.apiType === 'piped' 
        ? video.thumbnailUrl 
        : video.videoThumbnails?.[3]?.url || '';
}

function formatDuration(seconds) {
    if (!seconds) return '--:--';
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;
    return `${minutes}:${remaining.toString().padStart(2, '0')}`;
}

// Başlatma
document.addEventListener('DOMContentLoaded', () => {
    const savedSettings = localStorage.getItem('ytSettings');
    if (savedSettings) currentSettings = JSON.parse(savedSettings);
    document.documentElement.setAttribute('data-theme', currentSettings.theme);
    initializeApi();
});

// Service Worker Kayıt
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(() => console.log('Çevrimdışı destek aktif'))
        .catch(err => console.log('Service Worker hatası:', err));
}
