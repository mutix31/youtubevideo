let player;

window.onYouTubeIframeAPIReady = () => {
    const videoId = new URLSearchParams(window.location.search).get('id');
    if(videoId) initializePlayer(videoId);
};

async function loadVideoDetails(videoId) {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${API_KEY}`
        );
        const data = await response.json();
        updateVideoInfo(data.items[0]);
    } catch (error) {
        console.error('Hata:', error);
    }
}

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
            'onReady': event => event.target.playVideo(),
            'onStateChange': onPlayerStateChange
        }
    });
    loadVideoDetails(videoId);
}
