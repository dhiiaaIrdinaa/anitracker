const { ipcRenderer } = require('electron');

async function fetchCommunityReviews(malId) {
  try {
    const res = await fetch(`https://api.jikan.moe/v4/manga/${malId}/reviews`);
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

async function loadReviews(malId, mangaTitle) {
  const container = document.getElementById('reviewList');
  if (!container) return;
  container.innerHTML = `<h2>Reviews for "${mangaTitle}"</h2>`;

  const localReviews = await ipcRenderer.invoke('get-reviews');
  const mangaLocal = localReviews.filter(r => r.id == malId);

  if (mangaLocal.length) {
    mangaLocal.forEach(r => {
      const div = document.createElement('div');
      div.classList.add('anime-review-card');
      div.innerHTML = `
        <img src="${r.images?.jpg?.image_url || ''}" width="120">
        <h3>${r.mangaTitle}</h3>
        <p>${r.text}</p>
      `;
      container.appendChild(div);
    });
  } else {
    container.innerHTML += '<p>No local reviews yet.</p>';
  }

  const communityReviews = await fetchCommunityReviews(malId);
  if (communityReviews.length) {
    communityReviews.forEach(r => {
      const div = document.createElement('div');
      div.classList.add('anime-review-card', 'community-review');
      const shortReview = r.review.length > 300 ? r.review.substring(0, 300) + '...' : r.review;
      div.innerHTML = `
        <h3>${r.user.username} ⭐ ${r.score || 'N/A'}</h3>
        <p>${shortReview}</p>
      `;
      container.appendChild(div);
    });
  } else {
    container.innerHTML += '<p>No community reviews yet.</p>';
  }
}

window.loadReviews = loadReviews;

//if redirected from review submission
document.addEventListener('DOMContentLoaded', () => {
  const manga = JSON.parse(localStorage.getItem('selectedManga'));
  if (manga) loadReviews(manga.mal_id, manga.title);
});
