document.addEventListener("DOMContentLoaded", () => {
  const navbarHTML = `
    <div class="nav-container">
      <div class="logo" onclick="window.location.href='index.html'">AniTracker🌟</div>

      <div class="nav-links">
        <!-- Anime Links -->
        <div class="nav-row">
          <button onclick="window.location.href='index.html'">🏠 Home</button>
          <button onclick="window.location.href='popular.html'">🔥 Popular</button>
          <button onclick="window.location.href='watchlist.html'">🍿My Anime Watchlist</button>
          <button onclick="window.location.href='review.html'">🗨️ My Review</button>
          <button onclick="window.location.href='viewReview.html'">👀 Community Anime Review</button>
        </div>

        <!-- Manga Links -->
        <div class="nav-row">
          <button onclick="window.location.href='searchManga.html'">📚 Search Manga</button>
          <button onclick="window.location.href='readinglist.html'">🔖My Reading List</button>
          <button onclick="window.location.href='viewReviewManga.html'">🖋️Community Manga Review</button>
        </div>
      </div>
    </div>

    <div class="global-search">
      <input type="text" id="globalTitle" placeholder="Search title..">
      <button id="globalSearchBtn">Search</button>
    </div>

    <div id="globalResult" class="result grid"></div>
  `;

  document.body.insertAdjacentHTML("afterbegin", navbarHTML);

  const searchBtn = document.getElementById('globalSearchBtn');
  const titleInput = document.getElementById('globalTitle');
  const resultDiv = document.getElementById('globalResult');

  const currentPage = window.location.pathname.split("/").pop(); 

  searchBtn.addEventListener('click', async () => {
    const title = titleInput.value.trim();
    if (!title) return;

    resultDiv.innerHTML = '<p>Searching...</p>';

    try {
      let url;
      //directing based on anime or manga
      if (currentPage.includes("Manga")) {
        url = `https://api.jikan.moe/v4/manga?q=${encodeURIComponent(title)}&limit=12`;
      } else {
        url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=12`;
      }

      const res = await fetch(url);
      const data = await res.json();
      const itemList = data.data || [];

      if (!itemList.length) {
        resultDiv.innerHTML = '<p>No results found !</p>';
        return;
      }

      resultDiv.innerHTML = '';
      resultDiv.classList.add('anime-grid');

      itemList.forEach(item => {
        const card = document.createElement('div');
        card.classList.add('anime-card');
        card.innerHTML = `
          <img src="${item.images?.jpg?.image_url || ''}" alt="${item.title}">
          <h3>${item.title}</h3>
          <p>⭐ ${item.score ?? 'N/A'}</p>
        `;

        card.addEventListener('click', () => {
          if ((currentPage === "viewReview.html" || currentPage === "viewReviewManga.html") && typeof window.loadReviews === "function") {
            window.loadReviews(item.mal_id, item.title);
            document.getElementById('reviewList')?.scrollIntoView({ behavior: 'smooth' });
          } else if (currentPage === "searchManga.html" && typeof window.showMangaDetails === "function") {
            window.showMangaDetails([item], item.mal_id);
          } else if (typeof window.showAnimeDetails === "function") {
            window.showAnimeDetails([item], item.mal_id);
          }
        });

        resultDiv.appendChild(card);
      });
    } catch (err) {
      console.error(err);
      resultDiv.innerHTML = '<p style="color:red;">Error fetching data.</p>';
    }
  });

  titleInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') searchBtn.click();
  });
});
