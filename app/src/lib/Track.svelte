<script>
  export let id;
  export let artist;
  export let title;
  export let cover;
  export let duration;
  export let album;
  export let albumArtist;
  export let explicit;

  import { formatTime } from './format';

  import { Icon } from 'svelte-fontawesome';
  import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload';

  import { startDownload } from './download';
</script>

<div class="track" id="track-{id}">
  <span class="track-left">
    {#if artist !== albumArtist}
      {artist} - {title}
    {:else}
      {title}
    {/if}
  </span>
  <span class="track-right">
    {#if explicit}
      <div class="tag">EXPLICIT</div>
    {/if}
    <span class="small">{formatTime(duration)}</span>
    <span class="track-download" title="Download" on:click={() => startDownload(id, {title, artist: {name: artist}, cover, album}, false)}>
      <Icon icon={faDownload}/>
    </span>
  </span>
</div>

<style>
  .track {
    padding: 10px;
    padding-top: 6px;
    padding-bottom: 6px;
    margin: none;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    font-size: large;
    transition: 0.05s background-color ease-out, 0.1s border-left ease-out;
    margin-bottom: 3px;
  }
  .track:nth-last-child(1) {
    border-radius: 0px 0px 15px 15px;
  }

  .track-left {
    flex: 1 1 0px;
    overflow: hidden;
  }
  .track-right {
    flex: 0 0 auto;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5em;
  }

  .track-download {
    vertical-align: top;
    cursor: pointer;
    transition: 0.1s filter ease-out, 0.1s color ease-out;
  }

  .tag {
    text-transform: uppercase;
    border-radius: 10px;
    padding: 0.2em;
    font-size: small;
    font-weight: bold;
  }

  @media (prefers-color-scheme: dark) {
    .track-download {
      color: #fff;
      filter: none;
    }
    .track-download:hover {
      color: rgb(131, 131, 243);
      filter: drop-shadow( 0px 0px 6px #8383F3);
    }
    .track {
      border-left: 0rem solid rgb(131, 131, 243);
    }
    .track:hover {
      background-color: #161627;
      border-left: 0.25rem solid rgb(131, 131, 243);
    }
    .tag {
      background-color: #f0f0f0;
      color: #0a0a0f;
    }
    .track {
      background-color: #112;
    }
  }

  @media (prefers-color-scheme: light) {
    .track-download {
      color: #1e1e2d;
      filter: none;
    }
    .track-download:hover {
      color: #ea74ac;
      filter: drop-shadow( 0px 0px 6px #f484b6);
    }
    .track {
      border-left: 0rem solid #ea74ac;
    }
    .track:hover {
      background-color: #fafafa;
      border-left: 0.25rem solid #ea74ac;
    }
    .tag {
      background-color: #0a0a0f;
      color: #fff;
    }
    .track {
      background-color: #ffffff;
    }
  }
</style>