const { ipcRenderer } = require('electron');

async function showMangaDetails(mangaList, id) {
  let manga = mangaList.find(m => m.mal_id === id);

  // fetch data
  try {
    const res = await fetch(`https://api.jikan.moe/v4/manga/${id}`);
    const data = await res.json();
    if (data.data) manga = data.data;
  } catch (err) {
    console.error('Error fetching manga details:', err);
  }

  if (!manga) return alert("Manga not found!");

  const animeDetailsContent = document.getElementById('animeDetailsContent');
  if (!animeDetailsContent) return;

  animeDetailsContent.innerHTML = `
    <div class="anime-detail">
      <img src="${manga.images?.jpg?.image_url || ''}" alt="${manga.title}" class="anime-detail-img">
      <div class="anime-info">
        <h2>${manga.title}</h2>
        <p><strong>Synopsis:</strong> ${manga.synopsis || 'N/A'}</p>
        <p><strong>Score:</strong> ${manga.score ?? 'N/A'}</p>
        <p><strong>Chapters:</strong> ${manga.chapters ?? 'N/A'}</p>
        <p><strong>Status:</strong> ${manga.status || 'N/A'}</p>
        <p><strong>Genres:</strong> ${manga.genres?.map(g => g.name).join(', ') || 'N/A'}</p>
        <p><strong>MyAnimeList link:</strong> <a href="${manga.url}" target="_blank" style="color:#ff66c4;">Visit MAL Page</a></p>
        <div class="detail-btns">
          <button id="addReadingList">⭐ Add to Reading List</button>
          <button id="addReview">📝 Add Review</button>
          <button id="closeModal">⬅ Back</button>
        </div>
      </div>
    </div>
  `;

  const detailDiv = animeDetailsContent.querySelector('.anime-detail');
  detailDiv.classList.add('fullpage');
  detailDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.getElementById('addReadingList').addEventListener('click', async () => {
    const mangaObj = {
      mal_id: manga.mal_id,
      id: manga.mal_id,
      title: manga.title,
      images: manga.images,
      chapters: manga.chapters,
      chaptersRead: 0,
      status: 'Reading',
      userRating: null
    };
    const success = await ipcRenderer.invoke('save-readinglist', mangaObj);
    if (success) alert(`✅ "${manga.title}" added to Reading List!`);
    else alert('❌ Failed to add to Reading List!');
  });

  document.getElementById('addReview').addEventListener('click', () => {
    localStorage.setItem('selectedManga', JSON.stringify(manga));
    window.location.href = 'reviewManga.html';
  });

  document.getElementById('closeModal').addEventListener('click', () => {
    detailDiv.classList.remove('fullpage');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

window.showMangaDetails = showMangaDetails;
