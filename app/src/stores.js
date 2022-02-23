import {writable} from 'svelte/store';

export const albums = writable([]);

export function clearAlbums() {
  albums.set([]);
}
export function pushAlbum(id) {
  albums.update((l) => [...l, id]);
}

export const displays = {
  AlbumSearch: 0,
  Download: 1,
}

export let display = writable(displays.AlbumSearch);

export let downloading = writable(null);