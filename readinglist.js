const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('readingList');
  const template = document.getElementById('readinglist-template');

  if (!container || !template) return;

  //load all reading list items
  async function loadReadingList() {
    container.innerHTML = '';
    const readingList = await ipcRenderer.invoke('get-readinglist');

    readingList.forEach(item => {
      const card = template.content.cloneNode(true);
      const div = card.querySelector('.watchlist-card');

      div.querySelector('.poster').src = item.images?.jpg?.image_url || '';
      div.querySelector('.poster').alt = item.title;
      div.querySelector('.title').textContent = item.title;
      div.querySelector('.chaptersInput').value = item.chaptersRead || 0;
      div.querySelector('.ratingInput').value = item.userRating || '';
      div.querySelector('.statusSelect').value = item.status || 'Reading';

      const progressBar = div.querySelector('.progress-bar');
      const updateProgress = () => {
        const chaptersRead = Number(div.querySelector('.chaptersInput').value) || 0;
        const totalChapters = item.chapters || 1;
        const percent = Math.min((chaptersRead / totalChapters) * 100, 100);
        progressBar.style.width = percent + '%';
      };
      updateProgress();

      // Save button
      div.querySelector('.saveBtn').addEventListener('click', async () => {
        item.chaptersRead = Number(div.querySelector('.chaptersInput').value) || 0;
        item.userRating = Number(div.querySelector('.ratingInput').value) || null;
        item.status = div.querySelector('.statusSelect').value;

        const success = await ipcRenderer.invoke('save-readinglist', item);
        if (success) {
          alert(`✅ "${item.title}" updated!`);
          updateProgress();
        } else {
          alert(`❌ Failed to update "${item.title}"`);
        }
      });

      div.querySelector('.deleteBtn').addEventListener('click', async () => {
        const confirmed = confirm(`Are you sure you want to remove "${item.title}" from your reading list?`);
        if (!confirmed) return;

        const success = await ipcRenderer.invoke('delete-readinglist', item.mal_id);
        if (success) loadReadingList();
      });

      container.appendChild(div);
    });
  }

  loadReadingList();
});
