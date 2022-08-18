import { get, writable } from "svelte/store";
import { queue } from "./stores";

function getWebsocketLocation() {
  return window.window.location.toString().replace('https://', 'wss://').replace('http://', 'ws://');
}

export function startDownload(id, metadata, isAlbum) {
  let log = writable(['Connecting to WebSocket...']);
  let logLocal = ['Connecting to WebSocket...'];
  let progress = writable(0);
  let success = writable(null);
  let downloadLink = writable(null);

  let coverArt;
  let title;
  let artist;

  let queueItem = {
    id: id,
    ...metadata,
    log,
    progress,
    isAlbum,
    success,
    downloadLink
  };

  queue.set([...get(queue), queueItem]);

  let type = isAlbum ? 'album' : 'track'
  const ws = new WebSocket(`${getWebsocketLocation()}api/${type}?id=${id}`);
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    console.log(d);
    if (d.key === 'downloadInfo') {
      logLocal.push(`[${d.data.data.title}] ${d.data.state}`);
      log.set(logLocal);
    } else if (d.key === 'updateQueue') {
      if (d.data.progress) {
        progress.set(d.data.progress);
      }
    } else if (d.key === 'download') {
      downloadLink.set(d.data);
    } else if (d.key === 'finishDownload') {
      logLocal.push('Download finished');
      log.set(logLocal);
      success.set(true);
    } else if (d.key === 'zipping') {
      logLocal.push('Creating zip archive');
      log.set(logLocal);
    }
  }
  ws.onopen = () => {
    logLocal.push('WebSocket connected!');
    logLocal.push('Server shooould start downloading the files now');
    log.set(logLocal);
  }
  ws.onerror = (e) => {
    console.error(e);
    logLocal.push(`${e}`);
    log.set(logLocal);
    success.set(false);
  }
  ws.onclose = (e) => {
    if (e.code !== 1000) {
      console.error(`websocket closed unexpectedly with code ${e.code}\n${e.reason}`);
      logLocal.push(`websocket closed unexpectedly with code ${e.code}`, `${e.reason}`);
      log.set(logLocal);
      success.set(false);
    }
  }
}