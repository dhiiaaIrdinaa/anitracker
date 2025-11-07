document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById('searchBtn');
  const resultDiv = document.getElementById('result');

  searchBtn.addEventListener('click', async () => {
    const title = document.getElementById('title').value.trim();
    if (!title) return alert('Please enter anime !');

    resultDiv.innerHTML = '<p>Searching...</p>';

    try {
      const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=12`);
      const data = await res.json();

      if (!data.data.length) {
        resultDiv.innerHTML = '<p>No results found.</p>';
        return;
      }

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
        card.addEventListener('click', () => showAnimeDetails(data.data, anime.mal_id));
        resultDiv.appendChild(card);
      });
    } catch (err) {
      console.error(err);
      resultDiv.innerHTML = '<p style="color:red;">Error fetching data.</p>';
    }
  });
});
