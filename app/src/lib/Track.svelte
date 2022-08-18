<script>
  export let id;
  export let artist;
  export let title;
  export let cover;
  export let duration;
  export let album;

  import { formatTime } from './format';

  import { Icon } from 'svelte-fontawesome';
  import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload';

  import { startDownload } from './download';
</script>

<div class="track" id="track-{id}">
  <span class="track-left">{artist} - {title}</span>
  <span class="track-right">
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
  }
  .track:nth-last-child(1) {
    border-bottom: none;
    border-radius: 0px 0px 15px 15px;
  }

  .track-left {
    flex: 1 1 0px;
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
      border-bottom: 3px solid #0a0a0f;
      border-left: 0rem solid rgb(131, 131, 243);
    }
    .track:hover {
      background-color: #161627;
      border-left: 0.25rem solid rgb(131, 131, 243);
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
      border-bottom: 3px solid #f0f0f0;
      border-left: 0rem solid #ea74ac;
    }
    .track:hover {
      background-color: #fafafa;
      border-left: 0.25rem solid #ea74ac;
    }
  }
</style>