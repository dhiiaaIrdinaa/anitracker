const { ipcRenderer } = require('electron');

const animeImage = document.getElementById('animeImage');
const animeTitle = document.getElementById('animeTitle');
const reviewText = document.getElementById('reviewText');
const saveReviewBtn = document.getElementById('saveReview');
const backBtn = document.querySelector('.back-btn');
const reviewsListDiv = document.getElementById('reviewList'); // div untuk list semua review

let currentAnime = null;
let allReviews = [];

//update anime display
function updateAnimeDisplay() {
  if (!currentAnime) return;
  
  animeTitle.textContent = currentAnime.title || "Unknown Title";
  animeImage.src = currentAnime.images?.jpg?.image_url || currentAnime.image || "";
}

//load previous review for current anime
async function loadReviews() {
  allReviews = await ipcRenderer.invoke('get-reviews');
  const existing = allReviews.find(r => r.id === (currentAnime.mal_id || currentAnime.id));
  if (existing) reviewText.value = existing.text;
  renderReviewsList();
}

//render all reviews for this anime
function renderReviewsList() {
  if (!reviewsListDiv) return;
  reviewsListDiv.innerHTML = '';
  
  const animeReviews = allReviews.filter(r => r.id === (currentAnime.mal_id || currentAnime.id));
  
  if (animeReviews.length === 0) {
    reviewsListDiv.innerHTML = '<p>No reviews yet.</p>';
    return;
  }

  animeReviews.forEach(r => {
    const reviewDiv = document.createElement('div');
    reviewDiv.classList.add('single-review');
    reviewDiv.style.border = '1px solid #ccc';
    reviewDiv.style.padding = '8px';
    reviewDiv.style.marginBottom = '5px';
    reviewDiv.style.borderRadius = '5px';
    
    reviewDiv.innerHTML = `
      <strong>${r.title}</strong>
      <p>${r.text}</p>
      <button class="edit-btn">Edit</button>
    `;
    
    reviewDiv.querySelector('.edit-btn').addEventListener('click', () => {
      reviewText.value = r.text;
      reviewText.focus();
    });

    reviewsListDiv.appendChild(reviewDiv);
  });
}

// Save review (add/update)
saveReviewBtn.addEventListener('click', async () => {
  if (!currentAnime) {
    alert('No anime selected!');
    return;
  }

  const text = reviewText.value.trim();
  if (!text) {
    alert('Please write a review before saving!');
    return;
  }

  const review = {
    id: currentAnime.mal_id || currentAnime.id,
    title: currentAnime.title,
    image: currentAnime.images?.jpg?.image_url || currentAnime.image || "",
    text
  };

  ipcRenderer.send('save-review', review);

  alert('✅ Review saved! You can still edit or add more.');

  //reload reviews
  loadReviews();
});

backBtn.addEventListener('click', () => {
  window.location.href = 'index.html';
});

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const savedAnime = localStorage.getItem("selectedAnime");
    if (savedAnime) {
      currentAnime = JSON.parse(savedAnime);
      updateAnimeDisplay();
      await loadReviews();
    }
  } catch (error) {
    console.error('Error loading review page:', error);
  }
});

ipcRenderer.on('load-anime-review', async (event, anime) => {
  currentAnime = anime;
  updateAnimeDisplay();
  await loadReviews();
});