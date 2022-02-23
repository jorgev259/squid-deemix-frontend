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
    width: 100%;
  }
  .metadata {
    height: 100%;
  }

  .album-download {
    width: 32px;
    height: 32px;
    cursor: pointer;
    transition: 0.1s filter ease-out;
  }

  .album-bottom {
    padding: 0px;
    margin-left: 2px;
    margin-right: 2px;
    border-radius: 0px 0px 10px 10px;
    transition: 0.1s border-left ease-out;
  }

  .album-download {
    vertical-align: top;
  }

  @media (prefers-color-scheme: dark) {
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
    .album-download {
      filter: invert(100%);
    }
    .album-download:hover {
      filter: invert(50%) sepia(58%) saturate(893%) hue-rotate(206deg) brightness(99%) contrast(92%) drop-shadow( 0px 0px 5px #8383F3);
    }
    .album-bottom {
      background-color: #112;
      border-left: 0rem solid rgb(131, 131, 243);
    }
  }
  @media (prefers-color-scheme: light) {
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
    .album-download {
      filter: none;
    }
    .album-download:hover {
      filter: invert(65%) sepia(45%) saturate(772%) hue-rotate(295deg) brightness(103%) contrast(91%) drop-shadow( 0px 0px 5px #f484b6);
    }
    .album-bottom {
      background-color: #ffffff;
      border-left: 0rem solid #ea74ac;
    }
  }
</style>

<script>
  import {onMount} from 'svelte/internal';
  import Track from './Track.svelte';
  import {queryTracks} from './api';
  import {downloadAlbum} from './download';
import Loading from './Loading.svelte';

  export let id;
  export let title;
  export let cover;
  export let artist;

  let tracks = [];

  onMount(async () => {
    let album = await queryTracks(id);
    tracks = album.tracks;
  });
</script>

<div class="album" id="album-{id}">
  <div class="album-metadata">
    <span class="metadata">
      <span class="big">{title}</span>
      <br>
      <span class="small">by {artist}</span>
    </span>
    <img class="album-download" width="48" height="48" src="assets/download.svg" alt="Download" on:click={() => downloadAlbum(id)}>
  </div>
  <div class="album-image-wrapper">
    <img class="album-image" width="128" height="128" src="https://e-cdns-images.dzcdn.net/images/cover/{cover}/128x128-000000-80-0-0.jpg" alt="Cover">
  </div>
</div>

<div class="album-bottom" id="album-bottom-{id}">
  {#if tracks.length === 0}
    <Loading/>
  {:else}
    {#each tracks as track}
      <Track id={track.id} title={track.title} artist={track.artist} duration={track.duration}/>
    {/each}
  {/if}
</div>