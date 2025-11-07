const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

//DIRECTING TO JSON FILES
const DATA_DIR = path.join(__dirname, 'data');
const WATCHLIST_PATH = path.join(DATA_DIR, 'watchlist.json');      // Anime watchlist
const READINGLIST_PATH = path.join(DATA_DIR, 'readinglist.json');  // Manga reading list
const REVIEWS_PATH = path.join(DATA_DIR, 'reviews.json');           // Reviews (anime + manga)

let mainWindow;
let reviewWindow;
let watchlistWindow;
let readingListWindow;

//CREATE WINDOWS
function createMainWindow() {
  mainWindow = new BrowserWindow({
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });
  mainWindow.maximize();
  mainWindow.loadFile('renderer/index.html');
}

function createReviewWindow() {
  reviewWindow = new BrowserWindow({
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });
  reviewWindow.maximize();
  reviewWindow.loadFile('renderer/review.html');

  reviewWindow.on('closed', () => { reviewWindow = null; });
}


app.whenReady().then(createMainWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

//REVIEWS
ipcMain.on('open-review-window', (event, item) => {
  if (!reviewWindow || reviewWindow.isDestroyed()) createReviewWindow();
  reviewWindow.focus();
  reviewWindow.webContents.once('did-finish-load', () => {
    reviewWindow.webContents.send('load-item-review', item);
  });
});

ipcMain.on('save-review', (event, review) => {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  let reviews = fs.existsSync(REVIEWS_PATH)
    ? JSON.parse(fs.readFileSync(REVIEWS_PATH, 'utf-8'))
    : [];

  const index = reviews.findIndex(r => r.id === review.id);
  if (index >= 0) reviews[index] = review;
  else reviews.push(review);

  fs.writeFileSync(REVIEWS_PATH, JSON.stringify(reviews, null, 2), 'utf-8');
});

ipcMain.handle('get-reviews', async () => {
  return fs.existsSync(REVIEWS_PATH)
    ? JSON.parse(fs.readFileSync(REVIEWS_PATH, 'utf-8'))
    : [];
});

//ANIME WATCHLIST 
ipcMain.handle('save-watchlist', async (event, anime) => {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const malId = anime.mal_id || anime.id;
  if (!malId) return false;

  let watchlist = fs.existsSync(WATCHLIST_PATH)
    ? JSON.parse(fs.readFileSync(WATCHLIST_PATH, 'utf-8'))
    : [];

  const index = watchlist.findIndex(a => (a.mal_id || a.id) === malId);
  if (index >= 0) watchlist[index] = { ...anime, mal_id: malId };
  else watchlist.push({ ...anime, mal_id: malId });

  fs.writeFileSync(WATCHLIST_PATH, JSON.stringify(watchlist, null, 2), 'utf-8');

  if (watchlistWindow) watchlistWindow.webContents.send('watchlist-updated');
  return true;
});

ipcMain.handle('get-watchlist', async () => {
  return fs.existsSync(WATCHLIST_PATH)
    ? JSON.parse(fs.readFileSync(WATCHLIST_PATH, 'utf-8'))
    : [];
});

ipcMain.handle('delete-watchlist', async (event, mal_id) => {
  if (!fs.existsSync(WATCHLIST_PATH)) return false;

  let watchlist = JSON.parse(fs.readFileSync(WATCHLIST_PATH, 'utf-8'));
  watchlist = watchlist.filter(a => a.mal_id !== mal_id);
  fs.writeFileSync(WATCHLIST_PATH, JSON.stringify(watchlist, null, 2), 'utf-8');

  if (watchlistWindow) watchlistWindow.webContents.send('watchlist-updated');
  return true;
});

//MANGA READING LIST
ipcMain.handle('save-readinglist', async (event, item) => {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  const malId = item.mal_id || item.id;
  if (!malId) return false;

  let readingList = fs.existsSync(READINGLIST_PATH)
    ? JSON.parse(fs.readFileSync(READINGLIST_PATH, 'utf-8'))
    : [];

  const index = readingList.findIndex(a => (a.mal_id || a.id) === malId);
  if (index >= 0) readingList[index] = { ...item, mal_id: malId };
  else readingList.push({ ...item, mal_id: malId });

  fs.writeFileSync(READINGLIST_PATH, JSON.stringify(readingList, null, 2), 'utf-8');

  if (readingListWindow) readingListWindow.webContents.send('readinglist-updated');
  return true;
});

ipcMain.handle('get-readinglist', async () => {
  return fs.existsSync(READINGLIST_PATH)
    ? JSON.parse(fs.readFileSync(READINGLIST_PATH, 'utf-8'))
    : [];
});

ipcMain.handle('delete-readinglist', async (event, mal_id) => {
  if (!fs.existsSync(READINGLIST_PATH)) return false;

  let readingList = JSON.parse(fs.readFileSync(READINGLIST_PATH, 'utf-8'));
  readingList = readingList.filter(a => a.mal_id !== mal_id);
  fs.writeFileSync(READINGLIST_PATH, JSON.stringify(readingList, null, 2), 'utf-8');

  if (readingListWindow) readingListWindow.webContents.send('readinglist-updated');
  return true;
});
