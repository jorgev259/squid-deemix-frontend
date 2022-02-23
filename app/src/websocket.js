/*
function getWebsocketLocation() {
  return window.window.location.toString().replace('https://', 'wss://').replace('http://', 'ws://');
}
*/
function getWebsocketLocation() {
  return 'ws://localhost:4500/';
}

export function startWebsocket(id, isAlbum, log, coverArt, title, artist, progress) {
  let type = isAlbum ? 'album' : 'track';
  const ws = new WebSocket(`${getWebsocketLocation()}api/${type}?id=${id}`);

  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    console.log(d);
    if (d.key === 'downloadInfo') {
      log(`[${d.data.data.title}] ${d.data.state}`);
    } else if (d.key === 'updateQueue') {
      progress(d.data.progress);
    } else if (d.key === 'coverArt') {
      log('Fetched cover art');
      coverArt(d.data);
    } else if (d.key === 'metadata') {
      log('Fetched metadata');
      title(d.data.title);
      artist(d.data.artist);
    } else if (d.key === 'download') {
      console.log(d.data);
      download(d.data);
    } else if (d.key === 'finishDownload') {
      log('Download finished');
    } else if (d.key === 'zipping') {
      log('Zipping up files');
    }
  };
}