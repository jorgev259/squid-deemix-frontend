function download(url) {
  console.log(url);
  fetch(url)
    .then(response => response.blob())
    .then(blob => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = url.split('/').pop();
      link.target = '_blank';
      link.click();
  })
  .catch(console.error);
}

function formatTime(s) {
  return Math.floor(s / 60).toString().padStart(2, '0') + ':' + (s % 60).toString().padStart(2, '0');
}

// this is literally a find replace in the css
function setTheme(theme) {
  Array.from(document.styleSheets).map(e => {
    try {
      return Array.from(e.cssRules)
    } catch (e) {
      return []
    }
  }).flat().map(e => {
    if (e.constructor != CSSMediaRule) return;
    if (e.originalConditionText) e.conditionText = e.originalConditionText;
    else e.originalConditionText = e.conditionText
    if (theme === 'system') return
    let match = e.conditionText.match(/prefers-color-scheme:\s*(light|dark)/i)
    if (!match) return;
    e.conditionText = e.conditionText.replace(match[0], (match[1].toLowerCase() == theme ? 'min' : 'max') + '-width: 0')
  });
}

function getWebsocketLocation() {
  return window.window.location.toString().replace('https://', 'wss://').replace('http://', 'ws://');
}

function addlog(log, text) {
  log += `<br>${text}`;
  log = log.split('<br>').slice(-3).join('<br>');
  if (log.startsWith('<br>')) log = log.replace('<br>', '');
  return log;
}

function startDownload(id, isAlbum) {
  let log = '';

  let coverArt;
  let title;
  let artist;

  let type = isAlbum ? 'album' : 'track'
  document.getElementById('albums').innerHTML = '';
  document.getElementById('progress-album').innerHTML = '<div class="lds-ring"><div></div><div></div><div></div><div></div></div>';
  const ws = new WebSocket(`${getWebsocketLocation()}api/${type}?id=${id}`);
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    console.log(d);
    if (d.key === 'downloadInfo') {
      log = addlog(log, `[${d.data.data.title}] ${d.data.state}`);
    } else if (d.key === 'updateQueue') {
      if (d.data.progress) {
        document.getElementById('progress-bar-wrapper').innerHTML = `<br><div id="progress-bar"><div id="progress-bar-inner" style="height:100%;width:${d.data.progress}%"></div></div>`
      }
    } else if (d.key === 'coverArt') {
      log = addlog(log, 'Fetched cover art');
      coverArt = d.data;
    } else if (d.key === 'metadata') {
      log = addlog(log, 'Fetched metadata');
      title = d.data.title;
      artist = d.data.artist;
    } else if (d.key === 'download') {
      download(d.data);
    } else if (d.key === 'finishDownload') {
      log = addlog(log, 'Download finished');
    }

    document.getElementById('progress-album').innerHTML = `<div class="album album-downloading" id="album-${id}"><span class="album-image-wrapper"><img class="album-image" width="128" height="128" src="${coverArt}"></span><span class="big">${title || ''}</span><br><span class="small">by ${artist || ''}</span><br><div id="progress-state">${log || ''}</div></div>`;
  }
  ws.onerror = (e) => {
    console.log('error: ' + e);
    error(e.toString());
  }
  ws.onclose = (e) => {
    change();
    if (e.code !== 1000) error(`websocket closed unexpectedly with code ${e.code}\n${e.reason}`);
  }
}

function error(e) {
  document.getElementById('error').innerHTML = `<div class="big">error!</div>${e.split('\n').join('<br>')}`;
  document.getElementById('error').style.display = 'block';
  console.error(e);
}
function clearError() {
  document.getElementById('error').innerHTML = '';
  document.getElementById('error').style.display = 'none';
}

let change; // fuck off js

window.onload = () => {
  clearError();

  // dirty theme hacks :tm:

  const color = window.getComputedStyle(document.querySelector('body')).getPropertyValue('color');
  const rgbRegex = /rgb\((\d+), ?(\d+), ?(\d+)\)/;
  const r = rgbRegex.exec(color);

  let brightness = (Number(r[1]) + Number(r[2]) + Number(r[3])) / (255 * 3);

  if (brightness > 0.5) { // light text, dark theme
    document.getElementById('theme-switch').checked = true
  } else { // dark text, light theme
    document.getElementById('theme-switch').checked = false
  }

  document.getElementById('theme-switch').addEventListener('click', () => {
    setTheme(document.getElementById('theme-switch').checked ? 'dark' : 'light');
  });

  const placeholders = [
    'xilent - we are dust',
    'joyryde - brave',
    'phaseone - the risen ep',
    'blanke & godlands - hellraiser',
    'camellia - blackmagik blazing',
    't+pazolite - without permission',
    'the brig - vindicate',
    'bossfight - next wave'
  ];

  const search = document.getElementById('album-search');
  search.setAttribute('placeholder', placeholders[Math.floor(Math.random() * placeholders.length)]);

  change = async () => {
    clearError();
    const value = document.getElementById('album-search').value;
    if (value === '') return document.getElementById('albums').innerHTML = '';
    document.getElementById('progress-album').innerHTML = '';
    document.getElementById('progress-bar-wrapper').innerHTML = '';
    document.getElementById('albums').innerHTML = '<div class="lds-ring"><div></div><div></div><div></div><div></div></div>';
    let d;
    try {
      d = await axios.get('/api/search', {params: {search: value}});
    } catch(err) {
      error(err.toString());
      document.getElementById('albums').innerHTML = '';
      return;
    }
    document.getElementById('albums').innerHTML = d.data.map(d =>
      `<div class="album" id="album-${d.id}"><span class="album-image-wrapper"><img class="album-image" width="128" height="128" src="https://e-cdns-images.dzcdn.net/images/cover/${d.cover}/128x128-000000-80-0-0.jpg"></span><span class="big">${d.title}</span><br><span class="small">by ${d.artist.name}</span><br><img class="album-download" width="48" height="48" src="https://img.icons8.com/material-sharp/48/000000/download--v1.png"></div><div class="album-bottom" id="album-bottom-${d.id}"></div>`
    ).join('<br>');

    if (d.data.length === 0) return document.getElementById('albums').innerHTML = '<span class="small">Not found!</span>';

    for (c of document.getElementById('albums').children) {
      if (c.children[5]) {
        let id = c.id.split('-')[1];
        c.children[5].onclick = () => {
          clearError();
          startDownload(id, true);
        }
      }
      let id = c.id.split('-')[1];
      if (document.getElementById('album-bottom-' + id)) {
        document.getElementById('album-bottom-' + id).innerHTML = '<div class="lds-ring"><div></div><div></div><div></div><div></div></div>';
        let album;
        try {
          album = await axios.get('/api/album', {params: {id: id}});
        } catch(err) {
          error(err.toString());
          document.getElementById('album-bottom-' + id).innerHTML = '';
          return;
        }

        document.getElementById('album-bottom-' + id).innerHTML = album.data.tracks.map(d =>
          `<div class="track" id="track-${d.id}"><span>${d.artist} - ${d.title}</span><span><span class="track-download-wrapper"><img class="album-download" width="32" height="32" src="https://img.icons8.com/material-sharp/48/000000/download--v1.png"></span> ${formatTime(d.duration)}</span></div>`
        ).join('');
        for (track of document.getElementById('album-bottom-' + id).children) {
          let trackId = track.id.split('-')[1];
          track.children[1].children[0].onclick = () => {
            clearError();
            startDownload(trackId, false);
          }
        }
      }
    }
  }

  search.addEventListener('change', change);
};