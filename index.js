const { ipcRenderer } = require('electron');

async function showAnimeDetails(animeList, id) {
  let anime = animeList.find(a => a.mal_id === id);

  // fetch data
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
    const data = await res.json();
    if (data.data) anime = data.data;
  } catch (err) {
    console.error('Error fetching anime details:', err);
  }

  if (!anime) return alert("Anime not found!");

  const animeDetailsModal = document.getElementById('animeDetailsModal');
  const animeDetailsContent = document.getElementById('animeDetailsContent');
  if (!animeDetailsModal || !animeDetailsContent) return;

  animeDetailsContent.innerHTML = `
    <div class="anime-detail">
      <img src="${anime.images?.jpg?.image_url || ''}" alt="${anime.title}" class="anime-detail-img">
      <div class="anime-info">
        <h2>${anime.title}</h2>
        <p><strong>Synopsis:</strong> ${anime.synopsis || 'N/A'}</p>
        <p><strong>Score:</strong> ${anime.score ?? 'N/A'}</p>
        <p><strong>Rank:</strong> ${anime.rank ?? 'N/A'}</p>
        <p><strong>Popularity:</strong> ${anime.popularity ?? 'N/A'}</p>
        <p><strong>Genres:</strong> ${anime.genres?.map(g => g.name).join(', ') || 'N/A'}</p>
        <p><strong>Producers:</strong> ${anime.producers?.map(p => p.name).join(', ') || 'N/A'}</p>
        <p><strong>Source:</strong> ${anime.source || 'N/A'}</p>
        <p><strong>Rating:</strong> ${anime.rating || 'N/A'}</p>
        <p><strong>Releases:</strong> ${anime.aired?.string || 'N/A'}</p>
        <p><strong>Schedules:</strong> ${anime.broadcast?.string || 'N/A'}</p>
        <p><strong>MyAnimeList link:</strong> <a href="${anime.url}" target="_blank" style="color:#ff66c4;">Visit MAL Page</a></p>
        <div class="detail-btns">
          <button id="addWatchlist">⭐ Add to list</button>
          <button id="addReview">📝 Add Review</button>
          <button id="closeModal">⬅ Back</button>
        </div>
      </div>
    </div>
  `;

  const detailDiv = animeDetailsContent.querySelector('.anime-detail');
  detailDiv.classList.add('fullpage');
  detailDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const addWatchlistBtn = animeDetailsContent.querySelector('#addWatchlist');
  const addReviewBtn = animeDetailsContent.querySelector('#addReview');
  const closeModalBtn = animeDetailsContent.querySelector('#closeModal');

  addWatchlistBtn?.addEventListener('click', async () => {
    try {
      const animeObj = {
        mal_id: anime.mal_id,
        id: anime.mal_id,
        title: anime.title,
        images: anime.images,
        genres: anime.genres,
        score: anime.score,
        episodes: anime.episodes, 
        status: 'Watching', 
        episodesWatched: 0, 
        userRating: null 
      };
      
      const success = await ipcRenderer.invoke('save-watchlist', animeObj);
      if (success) {
        alert(`✅ "${anime.title}" added to watchlist!`);
      } else {
        alert('❌ Failed to add to watchlist!');
      }
    } catch (err) {
      console.error('Error adding to watchlist:', err);
      alert('❌ Failed to add to watchlist!');
    }
  });

  addReviewBtn?.addEventListener('click', () => {
    localStorage.setItem("selectedAnime", JSON.stringify(anime));
    window.location.href = "review.html";
  });

  closeModalBtn?.addEventListener('click', () => {
    detailDiv.classList.remove('fullpage');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

window.showAnimeDetails = showAnimeDetails;
