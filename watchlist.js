const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  const listDiv = document.getElementById('list');
  const template = document.getElementById('watchlist-template');

  async function loadWatchlist() {
    const watchlist = await ipcRenderer.invoke('get-watchlist');
    listDiv.innerHTML = '';

    if (!watchlist.length) {
      listDiv.innerHTML = '<p>No anime in your watchlist yet (/ω＼)</p>';
      return;
    }

    watchlist.forEach(anime => {
      const clone = template.content.cloneNode(true);
      const card = clone.querySelector('.watchlist-card');

      card.querySelector('.poster').src = anime.images.jpg.image_url || '';
      card.querySelector('.title').textContent = anime.title;
      card.querySelector('.episodesInput').value = anime.episodesWatched ?? 0;
      card.querySelector('.ratingInput').value = anime.userRating ?? '';
      card.querySelector('.statusSelect').value = anime.status ?? 'Watching';

      const progressBar = card.querySelector('.progress-bar');
      const totalEpisodes = anime.episodes ?? 12;

      function updateProgressBar() {
        const watched = parseInt(card.querySelector('.episodesInput').value) || 0;
        const percent = Math.min(100, (watched / totalEpisodes) * 100);
        progressBar.style.width = percent + '%';
        progressBar.textContent = `${watched}/${totalEpisodes}`;
      }
      updateProgressBar();

      card.querySelector('.saveBtn').addEventListener('click', async () => {
        anime.episodesWatched = parseInt(card.querySelector('.episodesInput').value) || 0;
        anime.userRating = parseInt(card.querySelector('.ratingInput').value) || null;
        anime.status = card.querySelector('.statusSelect').value;

        const success = await ipcRenderer.invoke('save-watchlist', anime);
        if (success) {
          updateProgressBar();
          alert(`✅ Your progress for "${anime.title}" saved!`);
        } else {
          alert(`❌ Failed to save "${anime.title}".`);
        }
      });

      card.querySelector('.deleteBtn').addEventListener('click', async () => {
        if (confirm(`Remove "${anime.title}" from watchlist?`)) {
          const success = await ipcRenderer.invoke('delete-watchlist', anime.mal_id);
          if (success) loadWatchlist();
          else alert(`❌ Failed to delete "${anime.title}".`);
        }
      });

      card.querySelector('.episodesInput').addEventListener('input', updateProgressBar);

      listDiv.appendChild(clone);
    });
  }

  loadWatchlist();
  ipcRenderer.on('watchlist-updated', loadWatchlist);
});
