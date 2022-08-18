import { writable } from "svelte/store";

export let queue = writable([]);
export let saveOnDownload = writable(false);