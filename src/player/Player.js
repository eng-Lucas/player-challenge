const fs = require('fs');
const path = require('path');
const Logger = require('../helpers/Logger')

const video1 = document.getElementById('video1');
const video2 = document.getElementById('video2');
const description = document.getElementById('description');
const logger = new Logger('player.log', true)

let playlist = [];
let currentIndex = 0;
let currentVideo = video1;
let nextVideo = video2;

function loadPlaylist() {
    const data = fs.readFileSync(path.join(__dirname, '../../assets/playlist.json'), 'utf-8');
    const json = JSON.parse(data);
    playlist = json.playlist || [];

    logger.log(`Playlist carregada com ${playlist.length} itens.`);
}

function swapVideos() {
    const temp = currentVideo;
    currentVideo = nextVideo;
    nextVideo = temp;
}

function cleanupVideo(video) {
    video.pause();

    // avoid keeping reference in memory
    video.removeAttribute('src');

    // force cleanup
    video.load();

    video.classList.remove('visible');
    video.oncanplay = null;
    video.onplaying = null;
    video.onerror = null;
    video.onended = null;
}

function playNext() {
    if (playlist.length === 0) return;

    const item = playlist[currentIndex];
    description.textContent = item.description || '';

    // clean up before configuring
    cleanupVideo(nextVideo);

    nextVideo.src = item.url;
    nextVideo.load();

    nextVideo.oncanplay = () => {
        nextVideo.play().catch(err => {
            logger.error(`Erro ao iniciar o vídeo: ${item.description} - ${item.url} ${err}`);
            
            skipToNext();
        });
    };

    nextVideo.onplaying = () => {
        logger.debug(`Tocando: ${item.description} - ${item.url}`);

        // Visual transition
        nextVideo.classList.add('visible');
        currentVideo.classList.remove('visible');

        // After transition, swap and clean up
        setTimeout(() => {
            cleanupVideo(currentVideo);
            swapVideos();

            // Listen for ended on the new currentVideo
            currentVideo.onended = () => {
                logger.debug(`Vídeo finalizado: ${playlist[currentIndex].description}`);
                
                skipToNext();
            };
        }, 1000);
    };

    nextVideo.onerror = () => {
        logger.error(`Erro ao carregar vídeo: ${item.url}`);

        skipToNext();
    };
}

function skipToNext() {
    currentIndex = (currentIndex + 1) % playlist.length;
    playNext();
}

// Start
loadPlaylist();
playNext();
