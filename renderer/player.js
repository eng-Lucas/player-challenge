const fs = require('fs');
const path = require('path');

const video = document.getElementById('videoPlayer');
const description = document.getElementById('description');

let playlist = [];
let currentIndex = 0;

function loadPlaylist() {
  const data = fs.readFileSync(path.join(__dirname, '../assets/playlist.json'), 'utf-8');
  const json = JSON.parse(data);
  playlist = json.playlist || [];
}

function playNext() {
  if (playlist.length === 0) return;

  const item = playlist[currentIndex];
  description.textContent = item.description || '';

  video.src = item.url;
  video.load();
  video.play().catch((err) => {
    console.error('Erro ao iniciar vídeo:', err);
    skipToNext();
  });
}

function skipToNext() {
  currentIndex = (currentIndex + 1) % playlist.length;
  playNext();
}

video.addEventListener('ended', skipToNext);
video.addEventListener('error', () => {
  console.error('Erro de reprodução, pulando...');
  skipToNext();
});

loadPlaylist();
playNext();
