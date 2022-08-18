<script>
  export let id;
  export let title;
  export let artist;
  export let subtitle;
  export let cover;

  export let short;
  export let hideDownload;
  export let log;
  export let butShowThisDownloadLinkInstead;

  import { Icon } from 'svelte-fontawesome';
  import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload';

  import { inview } from 'svelte-inview';
  import Loading from './Loading.svelte';
  import Track from './Track.svelte';

  import { startDownload } from './download';

  const options = {};

  let album;
  let loadingTracks = false;
  async function loadTracks() {
    if (loadingTracks || album || short) return;
    loadingTracks = true;
    try {
      let url = new URL(`/api/album`, window.location.origin);
      url.searchParams.set('id', id);
      const response = await fetch(url);
      album = await response.json();
      loadingTracks = false;
    } catch(err) {
      loadingTracks = false;
      console.error(err);
    }
  }
</script>

<div class="album" class:short={short} id="album-{id}"
  use:inview={options}
  on:enter={loadTracks}
>
  <div class="album-metadata">
    <span class="metadata">
      <span class="big">{title}</span>
      {#if subtitle}
        <span class="small">{subtitle}</span>
      {/if}
      <br>
      <span class="small">{artist.name}</span>
    </span>
    {#if log}
      <div class="progress-state">
        {#each $log as line, i}
          <span style="order: {-i}">{line}</span>
        {/each}
      </div>
    {/if}
    {#if !hideDownload || $butShowThisDownloadLinkInstead}
      {#if $butShowThisDownloadLinkInstead}
        <a href={$butShowThisDownloadLinkInstead} target="_blank" rel="noopener" download="{$butShowThisDownloadLinkInstead.split('/').slice(-1)}">
          <div class="album-download" title="Download">
            <Icon icon={faDownload}/>
          </div>
        </a>
      {:else}
        <div class="album-download" title="Download" on:click={() => startDownload(id, {title, artist, cover}, true)}>
          <Icon icon={faDownload}/>
        </div>
      {/if}
    {/if}
  </div>
  <div class="album-image-wrapper">
    <img class="album-image" width="128" height="128" src="https://e-cdns-images.dzcdn.net/images/cover/{cover}/128x128-000000-80-0-0.jpg" alt="Cover for '{title}'">
  </div>
</div>

<div class="album-bottom" id="album-bottom-{id}">
  {#if loadingTracks}
    <Loading/>
  {/if}
  {#if album && !short}
    {#each album.tracks as track}
      <Track id={track.id} title={track.title} duration={track.duration} artist={track.artist} cover={cover} album={title}/>
    {/each}
  {/if}
</div>

<style>
  .album {
    padding: 15px;
    margin: 2px;
    font-size: large;
    border-radius: 10px 10px 0px 0px;
    transition: 0.1s border-left ease-out, 0.1s background-color ease-in-out;
    min-height: 96px;
    display: flex;
    justify-content: space-between;
    margin-top: 0.5em;
  }
  .album.short {
    border-radius: 10px 10px 10px 10px;
  }
  .album-image {
    width: auto;
    height: 100%;
    border-radius: 10px;
    transition: 0.1s border ease-out, 0.1s box-shadow ease-out;
    width: 96px;
    height: 96px;
  }
  .album-image-wrapper {
    transition: 0.1s border ease-out;
  }
  .album-metadata {
    display: flex;
    flex-direction: column;
    flex: 1 1 0px;
    align-items: flex-start;
    gap: 0.5em;
  }
  .album-download {
    cursor: pointer;
    transition: 0.1s filter ease-out, 0.1s color ease-out;
  }
  .album-download {
    font-size: 1.5em;
  }

  .album-bottom {
    padding: 0px;
    margin-left: 2px;
    margin-right: 2px;
    border-radius: 0px 0px 10px 10px;
    transition: 0.1s border-left ease-out;
    margin-bottom: 1em;
  }

  .metadata {
    flex: 1 1 0px;
  }

  .progress-state {
    font-family: monospace;
    font-size: 12px;
    border-radius: 10px;
    width: 80%;
    padding: 6px;
    height: 5.5em;
    overflow: hidden;
    overflow-y: auto;
    display: flex;
    flex-direction: column-reverse;
    align-self: stretch;
  }

  @media (prefers-color-scheme: dark) {
    .album-download {
      color: #fff;
      filter: none;
    }
    .album-download:hover {
      color: rgb(131, 131, 243);
      filter: drop-shadow( 0px 0px 6px #8383F3);
    }
    .album {
      background-color: #161627;
      box-shadow: 0px 0px 12px #000;
      border-left: 0rem solid rgb(131, 131, 243);
    }
    .album:hover {
      border-left: 0.25rem solid rgb(131, 131, 243);
      background-color: #181829;
    }
    .album-image {
      border: 0px solid rgb(131, 131, 243);
      box-shadow: 0px 0px 15px #000;
    }
    .album:hover .album-image {
      border: 2px solid rgb(131, 131, 243);
      box-shadow: 0px 0px 30px #000;
    }
    .album-image-wrapper {
      border: 2px solid rgba(0, 0, 0, 0);
    }
    .album:hover .album-image-wrapper {
      border: 0px solid rgba(0, 0, 0, 0);
    }
    .album-bottom {
      background-color: #112;
      border-left: 0rem solid rgb(131, 131, 243);
    }
    .progress-state {
      background-color: #0a0a0f;
    }
  }

  @media (prefers-color-scheme: light) {
    .album-download {
      color: #1e1e2d;
      filter: none;
    }
    .album-download:hover {
      color: #ea74ac;
      filter: drop-shadow( 0px 0px 6px #f484b6);
    }
    .album {
      background-color: #ffffff;
      box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.2);
      border-left: 0rem solid #ea74ac;
    }
    .album:hover {
      border-left: 0.25rem solid #ea74ac;
      background-color: #fafafa;
    }
    .album-image {
      border: 0px solid #ea74ac;
      box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.2);
    }
    .album:hover .album-image {
      border: 2px solid #ea74ac;
      box-shadow: 0px 0px 30px rgba(0, 0, 0, 0.2);
    }
    .album-image-wrapper {
      border: 2px solid rgba(0, 0, 0, 0);
    }
    .album:hover .album-image-wrapper {
      border: 0px solid rgba(0, 0, 0, 0);
    }
    .album-bottom {
      background-color: #ffffff;
      border-left: 0rem solid #ea74ac;
    }
    .progress-state {
      background-color: #fafafa;
    }
  }
</style>