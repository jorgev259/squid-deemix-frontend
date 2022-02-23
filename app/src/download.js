import {downloading, display, displays} from './stores';

export function downloadAlbum(id) {
  display.set(displays.Download);
  downloading.set({id: id, isAlbum: true});
}
export function downloadTrack(id) {
  display.set(displays.Download);
  downloading.set({id: id, isAlbum: false});
}