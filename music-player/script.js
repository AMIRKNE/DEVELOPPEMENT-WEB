const STORAGE_KEYS = {
  library: "musicplayer_library",
  favorites: "musicplayer_favorites",
  playlists: "musicplayer_playlists",
  settings: "musicplayer_settings",
};

const ui = {
  libraryGrid: document.getElementById("libraryGrid"),
  favoritesGrid: document.getElementById("favoritesGrid"),
  playlistGrid: document.getElementById("playlistGrid"),
  searchResults: document.getElementById("searchResults"),
  headerSearch: document.getElementById("headerSearch"),
  librarySearch: document.getElementById("librarySearch"),
  fileInput: document.getElementById("fileInput"),
  fileImportButton: document.getElementById("fileImportButton"),
  themeToggle: document.getElementById("themeToggle"),
  totalTracks: document.getElementById("totalTracks"),
  favoriteCount: document.getElementById("favoriteCount"),
  playlistCount: document.getElementById("playlistCount"),
  playerCover: document.getElementById("playerCover"),
  playerTitle: document.getElementById("playerTitle"),
  playerArtist: document.getElementById("playerArtist"),
  currentTime: document.getElementById("currentTime"),
  totalTime: document.getElementById("totalTime"),
  progressBar: document.getElementById("progressBar"),
  volumeBar: document.getElementById("volumeBar"),
  playPauseButton: document.getElementById("playPauseButton"),
  prevButton: document.getElementById("prevButton"),
  nextButton: document.getElementById("nextButton"),
  shuffleButton: document.getElementById("shuffleButton"),
  repeatButton: document.getElementById("repeatButton"),
  muteButton: document.getElementById("muteButton"),
  newPlaylistButton: document.getElementById("newPlaylistButton"),
  playlistModal: document.getElementById("playlistModal"),
  playlistNameInput: document.getElementById("playlistNameInput"),
  confirmPlaylistButton: document.getElementById("confirmPlaylistButton"),
  cancelPlaylistButton: document.getElementById("cancelPlaylistButton"),
  closePlaylistModal: document.getElementById("closePlaylistModal"),
  trackPlaylistModal: document.getElementById("trackPlaylistModal"),
  playlistSelect: document.getElementById("playlistSelect"),
  confirmTrackPlaylistButton: document.getElementById("confirmTrackPlaylistButton"),
  cancelTrackPlaylistButton: document.getElementById("cancelTrackPlaylistButton"),
  closeTrackPlaylistModal: document.getElementById("closeTrackPlaylistModal"),
};

const state = {
  library: [],
  favorites: [],
  playlists: [],
  currentTrack: null,
  currentTrackIndex: -1,
  currentPlaylist: [],
  isPlaying: false,
  isShuffle: false,
  repeatMode: "off",
  volume: 0.8,
  muted: false,
  theme: "light",
  pendingTrackForPlaylist: null,
};

const audio = new Audio();
audio.volume = state.volume;

function safeParse(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEYS.library, JSON.stringify(state.library));
  localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(state.favorites));
  localStorage.setItem(STORAGE_KEYS.playlists, JSON.stringify(state.playlists));
  localStorage.setItem(
    STORAGE_KEYS.settings,
    JSON.stringify({
      theme: state.theme,
      volume: state.volume,
      muted: state.muted,
      repeatMode: state.repeatMode,
      isShuffle: state.isShuffle,
    })
  );
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function createArtPlaceholder(title = "Music") {
  const initials = title
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "MP";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#7c5cff"/>
          <stop offset="100%" stop-color="#ff7dc7"/>
        </linearGradient>
      </defs>
      <rect width="500" height="500" fill="url(#g)"/>
      <circle cx="250" cy="180" r="80" fill="rgba(255,255,255,0.18)"/>
      <path d="M230 125 L365 140 L365 370 L230 355 Z" fill="rgba(255,255,255,0.16)"/>
      <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="84" font-family="Arial, sans-serif" font-weight="700">${initials}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function getTrackCover(track) {
  return track.cover || createArtPlaceholder(track.title || "Music");
}

function normalizeImportedTrack(file, index = Date.now()) {
  const name = file.name.replace(/\.[^/.]+$/, "");
  const audioElement = document.createElement("audio");
  const src = URL.createObjectURL(file);

  return new Promise((resolve) => {
    audioElement.preload = "metadata";
    audioElement.src = src;

    audioElement.onloadedmetadata = () => {
      resolve({
        id: `local-${index}-${Math.random().toString(16).slice(2)}`,
        title: name || "Nouvelle piste",
        artist: "Artiste inconnu",
        album: "Musiques locales",
        duration: formatDuration(audioElement.duration),
        durationSeconds: audioElement.duration || 0,
        cover: createArtPlaceholder(name || "Music"),
        src,
        source: "local",
        isFavorite: false,
      });
    };

    audioElement.onerror = () => {
      resolve({
        id: `local-${index}-${Math.random().toString(16).slice(2)}`,
        title: name || "Nouvelle piste",
        artist: "Artiste inconnu",
        album: "Musiques locales",
        duration: "0:00",
        durationSeconds: 0,
        cover: createArtPlaceholder(name || "Music"),
        src,
        source: "local",
        isFavorite: false,
      });
    };
  });
}

function applyTheme(theme) {
  state.theme = theme;
  document.body.setAttribute("data-theme", theme);
  ui.themeToggle.textContent = theme === "dark" ? "🌙" : "☀️";
  saveState();
}

function loadSettings() {
  const settings = safeParse(STORAGE_KEYS.settings, {});
  state.theme = settings.theme || "light";
  state.volume = Number(settings.volume ?? 0.8);
  state.muted = Boolean(settings.muted);
  state.repeatMode = settings.repeatMode || "off";
  state.isShuffle = Boolean(settings.isShuffle);
  applyTheme(state.theme);
}

function saveLibrary() {
  localStorage.setItem(STORAGE_KEYS.library, JSON.stringify(state.library));
  localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(state.favorites));
  localStorage.setItem(STORAGE_KEYS.playlists, JSON.stringify(state.playlists));
}

async function fetchItunesResults(query) {
  const term = encodeURIComponent(query.trim());
  if (!term) {
    ui.searchResults.innerHTML = "";
    return;
  }

  try {
    const response = await fetch(`https://itunes.apple.com/search?term=${term}&entity=song&limit=8`);
    const data = await response.json();
    const tracks = (data.results || []).map((result) => ({
      id: `itunes-${result.trackId || `${Date.now()}-${Math.random()}`}`,
      title: result.trackName || "Titre inconnu",
      artist: result.artistName || "Artiste inconnu",
      album: result.collectionName || "Album inconnu",
      duration: formatDuration((result.trackTimeMillis || 0) / 1000),
      durationSeconds: (result.trackTimeMillis || 0) / 1000,
      cover: result.artworkUrl100 ? result.artworkUrl100.replace("100x100", "400x400") : createArtPlaceholder(result.trackName || "Music"),
      src: result.previewUrl || "",
      source: "itunes",
      isFavorite: false,
      previewUrl: result.previewUrl || "",
    }));

    window.__itunesSearchResults = tracks;
    renderSearchResults(tracks);
  } catch (error) {
    window.__itunesSearchResults = [];
    ui.searchResults.innerHTML = '<div class="empty-state">Impossible de contacter l’API iTunes pour le moment.</div>';
    console.error(error);
  }
}

function renderSearchResults(results) {
  window.__itunesSearchResults = results;
  if (!results.length) {
    ui.searchResults.innerHTML = '<div class="empty-state">Aucun résultat trouvé.</div>';
    return;
  }

  ui.searchResults.innerHTML = results
    .map(
      (track) => `
        <article class="music-card">
          <div class="artwork" style="background-image: url('${track.cover}')"></div>
          <div class="meta">
            <div class="title">${escapeHtml(track.title)}</div>
            <div class="artist">${escapeHtml(track.artist)}</div>
            <div class="duration">${track.duration}</div>
          </div>
          <div class="actions">
            <button class="action-button primary add-search-track" data-id="${track.id}">Ajouter</button>
          </div>
        </article>
      `
    )
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderLibrary() {
  const query = ui.librarySearch.value.trim().toLowerCase();
  const visibleTracks = state.library.filter((track) => {
    if (!query) return true;
    return `${track.title} ${track.artist} ${track.album}`.toLowerCase().includes(query);
  });

  if (!visibleTracks.length) {
    ui.libraryGrid.innerHTML = '<div class="empty-state">Aucune musique dans la bibliothèque. Importez vos titres pour commencer.</div>';
    return;
  }

  ui.libraryGrid.innerHTML = visibleTracks
    .map(
      (track) => `
        <article class="music-card" data-track-id="${track.id}">
          <div class="artwork" style="background-image: url('${getTrackCover(track)}')"></div>
          <div class="meta">
            <div class="title">${escapeHtml(track.title)}</div>
            <div class="artist">${escapeHtml(track.artist)}</div>
            <div class="duration">${track.duration}</div>
          </div>
          <div class="actions">
            <button class="action-button primary play-track" data-track-id="${track.id}">Lecture</button>
            <button class="action-button favorite-toggle" data-track-id="${track.id}">${track.isFavorite ? "♥" : "♡"}</button>
            <button class="action-button add-to-playlist" data-track-id="${track.id}">+ Playlist</button>
            <button class="action-button danger remove-track" data-track-id="${track.id}">Suppr.</button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderFavorites() {
  const favorites = state.library.filter((track) => state.favorites.includes(track.id));
  if (!favorites.length) {
    ui.favoritesGrid.innerHTML = '<div class="empty-state">Aucun favori pour le moment.</div>';
    return;
  }

  ui.favoritesGrid.innerHTML = favorites
    .map(
      (track) => `
        <article class="music-card">
          <div class="artwork" style="background-image: url('${getTrackCover(track)}')"></div>
          <div class="meta">
            <div class="title">${escapeHtml(track.title)}</div>
            <div class="artist">${escapeHtml(track.artist)}</div>
            <div class="duration">${track.duration}</div>
          </div>
          <div class="actions">
            <button class="action-button primary play-track" data-track-id="${track.id}">Lire</button>
            <button class="action-button favorite-toggle" data-track-id="${track.id}">♥</button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderPlaylists() {
  if (!state.playlists.length) {
    ui.playlistGrid.innerHTML = '<div class="empty-state">Aucune playlist créée. Créez votre première liste.</div>';
    return;
  }

  ui.playlistGrid.innerHTML = state.playlists
    .map(
      (playlist) => `
        <article class="playlist-card">
          <h3>${escapeHtml(playlist.name)}</h3>
          <small>${playlist.tracks.length} morceau${playlist.tracks.length > 1 ? "x" : ""}</small>
          <div class="playlist-actions">
            <button class="action-button primary play-playlist" data-playlist-id="${playlist.id}">Lire</button>
            <button class="action-button danger delete-playlist" data-playlist-id="${playlist.id}">Suppr.</button>
          </div>
        </article>
      `
    )
    .join("");
}

function renderStats() {
  ui.totalTracks.textContent = state.library.length;
  ui.favoriteCount.textContent = state.favorites.length;
  ui.playlistCount.textContent = state.playlists.length;
}

function setPlayer(track) {
  if (!track) {
    ui.playerTitle.textContent = "Aucune piste";
    ui.playerArtist.textContent = "Sélectionnez une musique";
    ui.playerCover.style.backgroundImage = "linear-gradient(135deg, rgba(124, 92, 255, 0.8), rgba(255, 125, 199, 0.7))";
    ui.playPauseButton.textContent = "▶️";
    ui.currentTime.textContent = "0:00";
    ui.totalTime.textContent = "0:00";
    ui.progressBar.value = 0;
    return;
  }

  ui.playerTitle.textContent = track.title;
  ui.playerArtist.textContent = track.artist;
  ui.playerCover.style.backgroundImage = `url('${getTrackCover(track)}')`;
  ui.totalTime.textContent = track.duration || formatDuration(track.durationSeconds || 0);
}

function getCurrentTrack() {
  if (state.currentTrackIndex >= 0 && state.currentTrackIndex < state.library.length) {
    return state.library[state.currentTrackIndex];
  }
  return state.currentTrack;
}

function setCurrentTrack(track, index = -1) {
  state.currentTrack = track;
  state.currentTrackIndex = index;
  setPlayer(track);

  if (track && track.src) {
    audio.src = track.src;
    audio.load();
  }
}

function togglePlayState() {
  if (!state.currentTrack) {
    const firstTrack = state.library[0];
    if (!firstTrack) return;
    state.currentTrackIndex = 0;
    setCurrentTrack(firstTrack, 0);
  }

  if (audio.paused) {
    audio.play();
    state.isPlaying = true;
    ui.playPauseButton.textContent = "⏸";
  } else {
    audio.pause();
    state.isPlaying = false;
    ui.playPauseButton.textContent = "▶️";
  }
}

function getNextTrackIndex() {
  if (!state.library.length) return -1;
  if (state.isShuffle) {
    let randomIndex = Math.floor(Math.random() * state.library.length);
    if (state.library.length > 1) {
      while (randomIndex === state.currentTrackIndex) {
        randomIndex = Math.floor(Math.random() * state.library.length);
      }
    }
    return randomIndex;
  }

  if (state.currentTrackIndex === -1) return 0;
  return (state.currentTrackIndex + 1) % state.library.length;
}

function getPreviousTrackIndex() {
  if (!state.library.length) return -1;
  if (state.currentTrackIndex === -1) return 0;
  if (state.isShuffle) {
    return getNextTrackIndex();
  }
  return (state.currentTrackIndex - 1 + state.library.length) % state.library.length;
}

function playTrackById(trackId) {
  const index = state.library.findIndex((track) => track.id === trackId);
  if (index < 0) return;
  const track = state.library[index];
  state.currentTrackIndex = index;
  state.currentTrack = track;
  setCurrentTrack(track, index);
  audio.src = track.src || track.previewUrl || "";
  audio.play();
  state.isPlaying = true;
  ui.playPauseButton.textContent = "⏸";
}

function playPlaylist(playlistId) {
  const playlist = state.playlists.find((item) => item.id === playlistId);
  if (!playlist) return;

  const playableTracks = playlist.tracks
    .map((trackId) => state.library.find((track) => track.id === trackId))
    .filter(Boolean);

  if (!playableTracks.length) return;

  state.currentTrackIndex = state.library.findIndex((track) => track.id === playableTracks[0].id);
  state.currentTrack = playableTracks[0];
  setCurrentTrack(playableTracks[0], state.currentTrackIndex);
  audio.src = playableTracks[0].src || playableTracks[0].previewUrl || "";
  audio.play();
  state.isPlaying = true;
  ui.playPauseButton.textContent = "⏸";
}

function nextTrack() {
  const nextIndex = getNextTrackIndex();
  if (nextIndex === -1) return;
  const track = state.library[nextIndex];
  state.currentTrackIndex = nextIndex;
  setCurrentTrack(track, nextIndex);
  if (track.src || track.previewUrl) {
    audio.src = track.src || track.previewUrl;
    audio.play();
  }
  state.isPlaying = true;
  ui.playPauseButton.textContent = "⏸";
}

function previousTrack() {
  const previousIndex = getPreviousTrackIndex();
  if (previousIndex === -1) return;
  const track = state.library[previousIndex];
  state.currentTrackIndex = previousIndex;
  setCurrentTrack(track, previousIndex);
  if (track.src || track.previewUrl) {
    audio.src = track.src || track.previewUrl;
    audio.play();
  }
  state.isPlaying = true;
  ui.playPauseButton.textContent = "⏸";
}

function handleTrackEnd() {
  if (state.repeatMode === "one") {
    audio.currentTime = 0;
    audio.play();
    return;
  }

  if (state.repeatMode === "all" || state.isShuffle || state.currentTrackIndex < state.library.length - 1) {
    nextTrack();
    return;
  }

  state.isPlaying = false;
  ui.playPauseButton.textContent = "▶️";
}

function syncFavoriteStatus(trackId) {
  const isFavorite = state.favorites.includes(trackId);
  const target = state.library.find((track) => track.id === trackId);
  if (target) {
    target.isFavorite = isFavorite;
  }
}

function toggleFavorite(trackId) {
  if (state.favorites.includes(trackId)) {
    state.favorites = state.favorites.filter((id) => id !== trackId);
  } else {
    state.favorites.push(trackId);
  }

  syncFavoriteStatus(trackId);
  saveState();
  renderLibrary();
  renderFavorites();
  renderStats();
}

function removeTrack(trackId) {
  state.library = state.library.filter((track) => track.id !== trackId);
  state.favorites = state.favorites.filter((id) => id !== trackId);

  state.playlists = state.playlists.map((playlist) => ({
    ...playlist,
    tracks: playlist.tracks.filter((id) => id !== trackId),
  }));

  if (state.currentTrack && state.currentTrack.id === trackId) {
    state.currentTrack = null;
    state.currentTrackIndex = -1;
    audio.pause();
    audio.removeAttribute("src");
    setPlayer(null);
  }

  saveState();
  renderLibrary();
  renderFavorites();
  renderPlaylists();
  renderStats();
}

function openPlaylistModal() {
  ui.playlistModal.classList.remove("hidden");
  ui.playlistNameInput.value = "";
  ui.playlistNameInput.focus();
}

function closePlaylistModal() {
  ui.playlistModal.classList.add("hidden");
}

function createPlaylist() {
  const name = ui.playlistNameInput.value.trim();
  if (!name) return;

  state.playlists.push({
    id: `playlist-${Date.now()}`,
    name,
    tracks: [],
  });

  saveState();
  renderPlaylists();
  renderStats();
  closePlaylistModal();
}

function removePlaylist(playlistId) {
  state.playlists = state.playlists.filter((playlist) => playlist.id !== playlistId);
  saveState();
  renderPlaylists();
  renderStats();
}

function openTrackPlaylistModal(trackId) {
  state.pendingTrackForPlaylist = trackId;
  ui.playlistSelect.innerHTML = state.playlists.length
    ? state.playlists
        .map(
          (playlist) => `
            <option value="${playlist.id}">${escapeHtml(playlist.name)}</option>
          `
        )
        .join("")
    : '<option value="">Créer une playlist</option>';

  if (!state.playlists.length) {
    ui.trackPlaylistModal.classList.add("hidden");
    openPlaylistModal();
    return;
  }

  ui.trackPlaylistModal.classList.remove("hidden");
}

function closeTrackPlaylistModal() {
  ui.trackPlaylistModal.classList.add("hidden");
  state.pendingTrackForPlaylist = null;
}

function addTrackToSelectedPlaylist() {
  if (!state.pendingTrackForPlaylist) return;
  const playlistId = ui.playlistSelect.value;
  if (!playlistId) return;

  const playlist = state.playlists.find((item) => item.id === playlistId);
  if (!playlist) return;

  if (!playlist.tracks.includes(state.pendingTrackForPlaylist)) {
    playlist.tracks.push(state.pendingTrackForPlaylist);
  }

  saveState();
  renderPlaylists();
  closeTrackPlaylistModal();
}

function handleImport(files) {
  const audioFiles = Array.from(files).filter((file) => file.type.startsWith("audio/"));
  if (!audioFiles.length) return;

  Promise.all(audioFiles.map((file, index) => normalizeImportedTrack(file, index))).then((tracks) => {
    state.library.unshift(...tracks);
    state.library = state.library.filter((track, index, arr) => index === arr.findIndex((item) => item.id === track.id));
    saveState();
    renderLibrary();
    renderFavorites();
    renderStats();
  });
}

function updateProgress() {
  const duration = audio.duration || 0;
  const current = audio.currentTime || 0;
  ui.currentTime.textContent = formatDuration(current);
  ui.totalTime.textContent = formatDuration(duration);
  ui.progressBar.value = duration ? (current / duration) * 100 : 0;
}

function cycleRepeatMode() {
  const order = ["off", "all", "one"];
  const currentIndex = order.indexOf(state.repeatMode);
  state.repeatMode = order[(currentIndex + 1) % order.length];
  ui.repeatButton.textContent = state.repeatMode === "off" ? "🔁" : state.repeatMode === "all" ? "🔁" : "🔂";
  saveState();
}

function syncVolume() {
  state.volume = Number(ui.volumeBar.value);
  audio.volume = state.volume;
  state.muted = state.volume === 0;
  ui.muteButton.textContent = state.muted ? "🔇" : "🔊";
  saveState();
}

function toggleMute() {
  state.muted = !state.muted;
  if (state.muted) {
    audio.volume = 0;
    ui.volumeBar.value = 0;
  } else {
    audio.volume = state.volume || 0.8;
    ui.volumeBar.value = String(audio.volume);
  }
  ui.muteButton.textContent = state.muted ? "🔇" : "🔊";
  saveState();
}

function bindEvents() {
  ui.fileImportButton.addEventListener("click", () => ui.fileInput.click());
  ui.fileInput.addEventListener("change", (event) => handleImport(event.target.files));

  ui.themeToggle.addEventListener("click", () => {
    applyTheme(state.theme === "dark" ? "light" : "dark");
  });

  ui.headerSearch.addEventListener("input", async (event) => {
    const query = event.target.value.trim();
    if (!query) {
      ui.searchResults.innerHTML = "";
      return;
    }
    await fetchItunesResults(query);
  });

  ui.librarySearch.addEventListener("input", renderLibrary);

  ui.playPauseButton.addEventListener("click", togglePlayState);
  ui.prevButton.addEventListener("click", previousTrack);
  ui.nextButton.addEventListener("click", nextTrack);
  ui.shuffleButton.addEventListener("click", () => {
    state.isShuffle = !state.isShuffle;
    ui.shuffleButton.style.filter = state.isShuffle ? "drop-shadow(0 0 12px rgba(124, 92, 255, 0.9))" : "none";
    saveState();
  });
  ui.repeatButton.addEventListener("click", cycleRepeatMode);
  ui.muteButton.addEventListener("click", toggleMute);
  ui.volumeBar.addEventListener("input", syncVolume);
  ui.progressBar.addEventListener("input", (event) => {
    if (!audio.duration) return;
    audio.currentTime = (+event.target.value / 100) * audio.duration;
  });

  ui.newPlaylistButton.addEventListener("click", openPlaylistModal);
  ui.confirmPlaylistButton.addEventListener("click", createPlaylist);
  ui.cancelPlaylistButton.addEventListener("click", closePlaylistModal);
  ui.closePlaylistModal.addEventListener("click", closePlaylistModal);

  ui.confirmTrackPlaylistButton.addEventListener("click", addTrackToSelectedPlaylist);
  ui.cancelTrackPlaylistButton.addEventListener("click", closeTrackPlaylistModal);
  ui.closeTrackPlaylistModal.addEventListener("click", closeTrackPlaylistModal);

  document.addEventListener("click", (event) => {
    const button = event.target.closest(".play-track");
    if (button) {
      playTrackById(button.dataset.trackId);
      return;
    }

    const favoriteToggle = event.target.closest(".favorite-toggle");
    if (favoriteToggle) {
      toggleFavorite(favoriteToggle.dataset.trackId);
      return;
    }

    const removeTrackButton = event.target.closest(".remove-track");
    if (removeTrackButton) {
      removeTrack(removeTrackButton.dataset.trackId);
      return;
    }

    const addToPlaylistButton = event.target.closest(".add-to-playlist");
    if (addToPlaylistButton) {
      openTrackPlaylistModal(addToPlaylistButton.dataset.trackId);
      return;
    }

    const addSearchTrackButton = event.target.closest(".add-search-track");
    if (addSearchTrackButton) {
      const foundTrack = (window.__itunesSearchResults || []).find((item) => item.id === addSearchTrackButton.dataset.id);
      const trackToAdd = foundTrack || null;
      if (!trackToAdd) return;
      const duplicate = state.library.find((libTrack) => libTrack.id === trackToAdd.id);
      if (!duplicate) {
        state.library.push(trackToAdd);
        saveState();
        renderLibrary();
        renderStats();
      }
      return;
    }

    const playlistPlayButton = event.target.closest(".play-playlist");
    if (playlistPlayButton) {
      playPlaylist(playlistPlayButton.dataset.playlistId);
      return;
    }

    const deletePlaylistButton = event.target.closest(".delete-playlist");
    if (deletePlaylistButton) {
      removePlaylist(deletePlaylistButton.dataset.playlistId);
      return;
    }
  });

  audio.addEventListener("timeupdate", updateProgress);
  audio.addEventListener("ended", handleTrackEnd);
  audio.addEventListener("loadedmetadata", () => {
    if (!state.currentTrack) return;
    state.currentTrack.durationSeconds = audio.duration || state.currentTrack.durationSeconds || 0;
    state.currentTrack.duration = formatDuration(state.currentTrack.durationSeconds);
    ui.totalTime.textContent = formatDuration(audio.duration || 0);
  });
  audio.addEventListener("play", () => {
    state.isPlaying = true;
    ui.playPauseButton.textContent = "⏸";
  });
  audio.addEventListener("pause", () => {
    state.isPlaying = false;
    ui.playPauseButton.textContent = "▶️";
  });
}

async function boot() {
  loadSettings();
  const storedLibrary = safeParse(STORAGE_KEYS.library, []);
  const storedFavorites = safeParse(STORAGE_KEYS.favorites, []);
  const storedPlaylists = safeParse(STORAGE_KEYS.playlists, []);

  state.library = storedLibrary;
  state.favorites = storedFavorites;
  state.playlists = storedPlaylists;

  if (!state.library.length) {
    try {
      const response = await fetch("https://itunes.apple.com/search?term=eminem&entity=song&limit=5");
      const data = await response.json();
      const defaultTracks = (data.results || []).map((result) => ({
        id: `itunes-${result.trackId || `${Date.now()}-${Math.random()}`}`,
        title: result.trackName || "Titre inconnu",
        artist: result.artistName || "Artiste inconnu",
        album: result.collectionName || "Album inconnu",
        duration: formatDuration((result.trackTimeMillis || 0) / 1000),
        durationSeconds: (result.trackTimeMillis || 0) / 1000,
        cover: result.artworkUrl100 ? result.artworkUrl100.replace("100x100", "400x400") : createArtPlaceholder(result.trackName || "Music"),
        src: result.previewUrl || "",
        source: "itunes",
        isFavorite: false,
      }));

      state.library = defaultTracks;
      saveLibrary();
    } catch (error) {
      console.error("Unable to load default iTunes tracks", error);
    }
  }

  bindEvents();
  renderLibrary();
  renderFavorites();
  renderPlaylists();
  renderStats();
  setPlayer(state.library[0] || null);
  ui.volumeBar.value = String(state.volume);
  ui.muteButton.textContent = state.muted ? "🔇" : "🔊";
  ui.repeatButton.textContent = state.repeatMode === "off" ? "🔁" : state.repeatMode === "all" ? "🔁" : "🔂";
  ui.shuffleButton.style.filter = state.isShuffle ? "drop-shadow(0 0 12px rgba(124, 92, 255, 0.9))" : "none";
  window.__itunesSearchResults = [];
  audio.volume = state.muted ? 0 : state.volume;
}

ui.headerSearch.addEventListener("keydown", async (event) => {
  if (event.key === "Enter") {
    const query = ui.headerSearch.value.trim();
    if (query) {
      const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=8`);
      const data = await response.json();
      const results = (data.results || []).map((result) => ({
        id: `itunes-${result.trackId || `${Date.now()}-${Math.random()}`}`,
        title: result.trackName || "Titre inconnu",
        artist: result.artistName || "Artiste inconnu",
        album: result.collectionName || "Album inconnu",
        duration: formatDuration((result.trackTimeMillis || 0) / 1000),
        durationSeconds: (result.trackTimeMillis || 0) / 1000,
        cover: result.artworkUrl100 ? result.artworkUrl100.replace("100x100", "400x400") : createArtPlaceholder(result.trackName || "Music"),
        src: result.previewUrl || "",
        source: "itunes",
        isFavorite: false,
      }));
      window.__itunesSearchResults = results;
      renderSearchResults(results);
    }
  }
});

boot();
