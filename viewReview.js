const { ipcRenderer } = require('electron');

//search anime via Jikan API
async function searchAnime(query) {
  const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=12`);
  const data = await res.json();
  return data.data;
}

//fetch community reviews based on MAL ID
async function fetchCommunityReviews(malId) {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime/${malId}/reviews`);
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.error('Error fetching community reviews:', err);
    return [];
  }
}

//load reviews
async function loadReviews(malId, animeTitle) {
  const reviewList = document.getElementById('reviewList');
  if (!reviewList) return;
  
  reviewList.innerHTML = `<h2>Reviews for "${animeTitle}"</h2>`;

  //local reviews
  try {
    const localReviews = await ipcRenderer.invoke('get-reviews');
    const animeLocalReviews = localReviews.filter(r => r.id == malId);
    
    if (animeLocalReviews.length === 0) {
      const noLocalDiv = document.createElement('div');
      noLocalDiv.classList.add('anime-review-card');
      noLocalDiv.innerHTML = `<p>No local reviews yet. Be the first to review!</p>`;
      reviewList.appendChild(noLocalDiv);
    } else {
      animeLocalReviews.forEach(r => {
        const div = document.createElement('div');
        div.classList.add('anime-review-card');
        div.innerHTML = `
          <h3>${r.title} - Your Review</h3>
          <p>${r.text}</p>
          <small>Your review</small>
        `;
        reviewList.appendChild(div);
      });
    }
  } catch (error) {
    console.error('Error loading local reviews:', error);
  }

  //community reviews
  try {
    const communityReviews = await fetchCommunityReviews(malId);
    
    if (communityReviews.length === 0) {
      const noCommunityDiv = document.createElement('div');
      noCommunityDiv.classList.add('anime-review-card', 'community-review');
      noCommunityDiv.innerHTML = `<p>No community reviews available yet.</p>`;
      reviewList.appendChild(noCommunityDiv);
    } else {
      communityReviews.forEach(r => {
        const div = document.createElement('div');
        div.classList.add('anime-review-card', 'community-review');
        // Limit review length for display
        const shortReview = r.review.length > 300 ? r.review.substring(0, 300) + '...' : r.review;
        div.innerHTML = `
          <h3>${r.user.username} ⭐ ${r.score || 'N/A'}</h3>
          <p>${shortReview}</p>
          <small>Community Review</small>
        `;
        reviewList.appendChild(div);
      });
    }
  } catch (error) {
    console.error('Error loading community reviews:', error);
  }
}

//render anime cards & attach click
function renderAnimeCards(animeList, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  animeList.forEach(anime => {
    const card = document.createElement('div');
    card.classList.add('anime-card');
    card.innerHTML = `
      <img src="${anime.images.jpg.image_url}" alt="${anime.title}">
      <h3>${anime.title}</h3>
      <p>Score: ${anime.score || 'N/A'}</p>
    `;
    card.addEventListener('click', () => {
      loadReviews(anime.mal_id, anime.title);
      document.getElementById('reviewList')?.scrollIntoView({ behavior: 'smooth' });
    });
    container.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const searchBtn = document.getElementById('globalSearchBtn');
  const searchInput = document.getElementById('globalTitle');
  
  if (searchBtn && searchInput) {
    //search button
    searchBtn.addEventListener('click', async () => {
      const query = searchInput.value.trim();
      if (!query) return;
      const results = await searchAnime(query);
      renderAnimeCards(results, 'searchResults');
    });

    //press enter
    searchInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') searchBtn.click();
    });
  }
});

//letting the function can be used by other file
window.loadReviews = loadReviews;
window.renderAnimeCards = renderAnimeCards;
