<script>
  import { onMount } from 'svelte/internal';
  import { writable } from 'svelte/store';
  import Loading from './Loading.svelte';
  import { startWebsocket } from './websocket'

  export let id;
  export let isAlbum;

  let title;
  let artist;
  let coverArt;
  let log = writable([]);
  let progress = writable(0);

  onMount(async () => {
    startWebsocket(id, isAlbum, s => {log.update(l => {return [...l, s].slice(-5)})}, c => {coverArt = c}, t => {title = t}, a => {artist = a}, p => {progress.set(p)});
  });
</script>

{#if title && artist && coverArt}
  <div class="album album-downloading" id="album-{id}">
    <div class="album-metadata">
      <span class="metadata">
        <span class="big">{title}</span>
        <br>
        <span class="small">by {artist}</span>
      </span>
      <div id="progress-state">
        {#each $log as l}
          <br>{l}
        {/each}
      </div>
    </div>
    <div class="album-image-wrapper">
      <img class="album-image" width="128" height="128" src="{coverArt}" alt="Cover">
    </div>
  </div>

  {#if $progress > 0}
    <div id="progress-bar"><div id="progress-bar-inner" style="height:100%;width:{$progress}%"></div></div>
  {/if}
{:else}
  <Loading/>
{/if}