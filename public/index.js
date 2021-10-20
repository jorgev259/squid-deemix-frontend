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
    if (theme == "system") return
    let match = e.conditionText.match(/prefers-color-scheme:\s*(light|dark)/i)
    if (!match) return;
    e.conditionText = e.conditionText.replace(match[0], (match[1].toLowerCase() == theme ? 'min' : 'max') + '-width: 0')
  });
}

function getWebsocketLocation() {
  return window.window.location.replace('https://', 'wss://').replace('http://', 'ws://');
}

window.onload = () => {
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

  async function change() {
    const value = document.getElementById('album-search').value;
    if (value === '') return document.getElementById('albums').innerHTML = '';
    document.getElementById('progress-album').innerHTML = '';
    document.getElementById('progress-bar-wrapper').innerHTML = '';
    document.getElementById('albums').innerHTML = '<div class="lds-ring"><div></div><div></div><div></div><div></div></div>';
    const d = await axios.get('/api/search', {params: {search: value}});
    document.getElementById('albums').innerHTML = d.data.map(d =>
      `<div class="album" id="album-${d.id}"><span class="album-image-wrapper"><img class="album-image" width="128" height="128" src="https://e-cdns-images.dzcdn.net/images/cover/${d.cover}/128x128-000000-80-0-0.jpg"></span><span class="big">${d.title}</span><br><span class="small">by ${d.artist.name}</span><br><img class="album-download" width="48" height="48" src="https://img.icons8.com/material-sharp/48/000000/download--v1.png"></div><div class="album-bottom" id="album-bottom-${d.id}"></div>`
    ).join('<br>');

    if (d.data.length === 0) return document.getElementById('albums').innerHTML = '<span class="small">Not found!</span>';

    for (c of document.getElementById('albums').children) {
      if (c.children[5]) {
        let id = c.id.split('-')[1];
        c.children[5].onclick = (a) => {
          let coverArt
          document.getElementById('albums').innerHTML = '';
          document.getElementById('progress-album').innerHTML = '<div class="lds-ring"><div></div><div></div><div></div><div></div></div>';
          const ws = new WebSocket(getWebsocketLocation() + 'api/album?id=' + id);
          ws.onmessage = (m) => {
            const d = JSON.parse(m.data);

            if (d.key === 'downloadInfo') {
              document.getElementById('progress-album').innerHTML = `<div class="album" id="album-${d.data.data.id}"><span class="album-image-wrapper"><img class="album-image" width="128" height="128" src="${coverArt}"></span><span class="big">${d.data.data.title}</span><br><span class="small">by ${d.data.data.artist}</span><br><span class="small" id="progress-state">${d.data.state}</span></div>`;
            } else if (d.key === 'updateQueue') {
              if (d.data.progress) {
                document.getElementById('progress-bar-wrapper').innerHTML = `<br><div id="progress-bar"><div id="progress-bar-inner" style="height:100%;width:${d.data.progress}%"></div></div>`
              }
            } else if (d.key === 'coverArt') {
              coverArt = d.data;
            } else if (d.key === 'download') {
              download(d.data);
            }
          }
        }
      }
      let id = c.id.split('-')[1];
      if (document.getElementById('album-bottom-' + id)) {
        document.getElementById('album-bottom-' + id).innerHTML = '<div class="lds-ring"><div></div><div></div><div></div><div></div></div>';
        const album = await axios.get('/api/album', {params: {id: id}});
        document.getElementById('album-bottom-' + id).innerHTML = album.data.tracks.map(d =>
          `<div class="track" id="track-${d.id}"><span>${d.artist} - ${d.title}</span><span><span class="track-download-wrapper"><img class="album-download" width="32" height="32" src="https://img.icons8.com/material-sharp/48/000000/download--v1.png"></span> ${formatTime(d.duration)}</span></div>`
        ).join('');
        for (track of document.getElementById('album-bottom-' + id).children) {
          let trackId = track.id.split('-')[1];
          track.children[1].children[0].onclick = () => {
            console.log(trackId);

            let coverArt
            document.getElementById('albums').innerHTML = '';
            document.getElementById('progress-album').innerHTML = '<div class="lds-ring"><div></div><div></div><div></div><div></div></div>';
            const ws = new WebSocket(getWebsocketLocation() + 'api/track?id=' + trackId);
            ws.onmessage = (m) => {
              const d = JSON.parse(m.data);
              console.log(d);

              if (d.key === 'downloadInfo') {
                document.getElementById('progress-album').innerHTML = `<div class="album" id="album-${d.data.data.id}"><span class="album-image-wrapper"><img class="album-image" width="128" height="128" src="${coverArt}"></span><span class="big">${d.data.data.title}</span><br><span class="small">by ${d.data.data.artist}</span><br><span class="small" id="progress-state">${d.data.state}</span></div>`;
              } else if (d.key === 'updateQueue') {
                if (d.data.progress) {
                  document.getElementById('progress-bar-wrapper').innerHTML = `<br><div id="progress-bar"><div id="progress-bar-inner" style="height:100%;width:${d.data.progress}%"></div></div>`
                }
              } else if (d.key === 'coverArt') {
                coverArt = d.data;
              } else if (d.key === 'download') {
                download(d.data);
              } else if (d.key === 'finishDownload') {
                change();
              }
            }
          }
        }
      }
    }
  }

  search.addEventListener('change', change);
};