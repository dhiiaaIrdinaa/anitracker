const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById('searchBtn');
  const resultDiv = document.getElementById('result');

  searchBtn.addEventListener('click', async () => {
    const title = document.getElementById('title').value.trim();
    if (!title) return alert('Please enter manga title!');

    resultDiv.innerHTML = '<p>Searching...</p>';

    try {
      const res = await fetch(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(title)}&limit=12`);
      const data = await res.json();

      if (!data.data.length) {
        resultDiv.innerHTML = '<p>No results found.</p>';
        return;
      }

      resultDiv.innerHTML = '';
      resultDiv.classList.add('anime-grid');

      data.data.forEach(manga => {
        const card = document.createElement('div');
        card.className = 'anime-card';
        card.innerHTML = `
            <img src="${manga.images.jpg.image_url}" alt="${manga.title}">
            <h4>${manga.title}</h4>
            <p>⭐ ${manga.score ?? 'N/A'}</p>
            <button class="addReadingListBtn">➕ Add to Reading List</button>
        `;

        //click card to show details
        card.addEventListener('click', () => {
          if (typeof window.showMangaDetails === 'function') {
            window.showMangaDetails(data.data, manga.mal_id);
          } else {
            alert('Manga details system not loaded yet!');
          }
        });

        //add to reading list button
        const addBtn = card.querySelector('.addReadingListBtn');
        addBtn?.addEventListener('click', async (e) => {
          e.stopPropagation(); // prevent opening modal
          const success = await ipcRenderer.invoke('save-reading-list', manga);
          if (success) alert(`✅ "${manga.title}" added to your reading list!`);
          else alert(`❌ Failed to add "${manga.title}".`);
        });

        resultDiv.appendChild(card);
      });

    } catch (err) {
      console.error(err);
      resultDiv.innerHTML = '<p style="color:red;">Error fetching data.</p>';
    }
  });
});
