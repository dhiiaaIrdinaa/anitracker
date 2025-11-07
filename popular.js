document.addEventListener('DOMContentLoaded', async () => {
  const resultDiv = document.getElementById('popularResult');
  if (!resultDiv) return;

  resultDiv.innerHTML = "<p>Loading popular anime...</p>";

  try {
    const res = await fetch('https://api.jikan.moe/v4/top/anime?limit=24');
    const data = await res.json();

    resultDiv.innerHTML = '';
    resultDiv.classList.add('anime-grid');

    data.data.forEach(anime => {
      const card = document.createElement('div');
      card.className = 'anime-card';
      card.innerHTML = `
        <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
        <h4>${anime.title}</h4>
        <p>⭐ ${anime.score ?? 'N/A'}</p>
      `;
      
      card.addEventListener('click', () => {
        if (typeof window.showAnimeDetails === 'function') {
          window.showAnimeDetails(data.data, anime.mal_id);
        } else {
          alert('Anime info system not loaded yet!');
        }
      });

      resultDiv.appendChild(card);
    });
  } catch (err) {
    console.error(err);
    resultDiv.innerHTML = '<p style="color:red;">Failed to load popular anime 😢</p>';
  }
});
