const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  const manga = JSON.parse(localStorage.getItem('selectedManga'));
  if (!manga) return alert('No manga selected!');

  //setting image and title
  document.getElementById('mangaImage').src = manga.images?.jpg?.image_url;
  document.getElementById('mangaImage').alt = manga.title;
  document.getElementById('mangaTitle').textContent = manga.title;

  //submit review
  document.getElementById('submitReview').addEventListener('click', async () => {
    const review = {
      id: manga.mal_id,
      title: manga.title,
      text: document.getElementById('reviewText').value,
      image: manga.images?.jpg?.image_url
    };

    await ipcRenderer.send('save-review', review);
    alert('✅ Review saved!');
    window.location.href = 'viewReviewManga.html';
  });

  //back button
  document.querySelector('.back-btn').addEventListener('click', () => {
    window.location.href = 'mangaDetails.html'; // adjust kalau page lain
  });
});
