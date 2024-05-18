import { get, writable } from 'svelte/store';
import { queue, saveOnDownload } from './stores';
import { dev } from './dev';
import { toast } from '@zerodevx/svelte-toast'
import { saveAs } from 'file-saver';

const successTheme = {'--toastBarBackground': 'rgb(131, 243, 131)'};
const failureTheme = {'--toastBarBackground': 'rgb(243, 131, 131)'};

function getWebsocketLocation() {
  if (dev) return 'ws://localhost:4500/';
  return window.window.location.toString().replace('https://', 'wss://').replace('http://', 'ws://');
}

export function startDownload(id, metadata, isAlbum) {
  let log = writable(['Connecting to WebSocket...']);
  let logLocal = ['Connecting to WebSocket...'];
  let progress = writable(0);
  let success = writable(null);
  let downloadLink = writable(null);

  let queueItem = {
    id: id,
    ...metadata,
    log,
    progress,
    isAlbum,
    success,
    downloadLink
  };

  toast.push(`Started download for <b>${metadata.artist.name} - ${metadata.title}</b>`);

  queue.set([...get(queue), queueItem]);

  let type = isAlbum ? 'album' : 'track'
  const ws = new WebSocket(`${getWebsocketLocation()}api/${type}?id=${id}`);
  ws.onmessage = (m) => {
    const d = JSON.parse(m.data);
    //console.log(d);
    if (d.key === 'downloadInfo') {
      logLocal.push(`[${d.data.data.title}] ${d.data.state}`);
      log.set(logLocal);
    } else if (d.key === 'updateQueue') {
      if (d.data.progress) {
        progress.set(Math.max(d.data.progress, get(progress)));
      }
    } else if (d.key === 'download') {
      success.set(true);
      progress.set(100);
      downloadLink.set(d.data);
      toast.push(`Downloaded <b>${metadata.artist.name} - ${metadata.title}</b>!`, {theme: successTheme});
      if (get(saveOnDownload)) {
        saveAs(d.data, d.data.split('/').pop());
      }
    } else if (d.key === 'finishDownload') {
      setTimeout(() => {
        if (!get(success)) {
          success.set(false);
          toast.push(`Downloading <b>${metadata.artist.name} - ${metadata.title}</b> failed!`, {theme: failureTheme});
          logLocal.push('Server didn\'t send a download link back!');
          logLocal.push('This may be due to errors during the download or temporary connection issues');
          logLocal.push('Try again, and if it still doesn\'t work, annoy Chito until it does again');
          log.set(logLocal);
        }
      }, 1000);
    } else if (d.key === 'zipping') {
      logLocal.push('Creating zip archive');
      log.set(logLocal);
    }
  }
  ws.onopen = () => {
    logLocal.push('WebSocket connected!');
    logLocal.push('Initializing download');
    log.set(logLocal);
  }
  ws.onerror = (e) => {
    console.error(e);
    logLocal.push(`${e}`);
    log.set(logLocal);
    success.set(false);
    toast.push(`Downloading <b>${metadata.artist.name} - ${metadata.title}</b> failed!`, {theme: failureTheme});
  }
  ws.onclose = (e) => {
    if (e.code !== 1000) {
      console.error(`websocket closed unexpectedly with code ${e.code}\n${e.reason}`);
      logLocal.push(`websocket closed unexpectedly with code ${e.code}`, `${e.reason}`);
      log.set(logLocal);
      success.set(false);
      toast.push(`Downloading <b>${metadata.artist.name} - ${metadata.title}</b> failed!`, {theme: failureTheme});
    }
  }
}