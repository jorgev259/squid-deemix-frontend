<style>
.track .album-download {
  position: relative;
  top: 20px;
}

.track {
  padding: 10px;
  padding-top: 6px;
  padding-bottom: 6px;
  margin: none;
  display: flex;
  justify-content: space-between;
  font-size: large;
  transition: 0.05s background-color ease-out, 0.1s border-left ease-out;
}
.track:nth-last-child(1) {
  border-bottom: none;
  border-radius: 0px 0px 15px 15px;
}

.track .album-download {
  vertical-align: top;
}

.track-download-wrapper {
  position: relative;
  bottom: 20px;
  height: 50%;
  width: auto;
}

.album-download {
  width: 32px;
  height: 32px;
  cursor: pointer;
  transition: 0.1s filter ease-out;
  position: relative;
  top: 20px;
}

@media (prefers-color-scheme: dark) {
  .track {
    border-bottom: 3px solid #0a0a0f;
    border-left: 0rem solid rgb(131, 131, 243);
  }
  .track:hover {
    background-color: #161627;
    border-left: 0.25rem solid rgb(131, 131, 243);
  }
  .album-download {
    filter: invert(100%);
  }
  .album-download:hover {
    filter: invert(50%) sepia(58%) saturate(893%) hue-rotate(206deg) brightness(99%) contrast(92%) drop-shadow( 0px 0px 5px #8383F3);
  }
}

@media (prefers-color-scheme: light) {
  .track {
    border-bottom: 3px solid #f0f0f0;
    border-left: 0rem solid #ea74ac;
  }
  .track:hover {
    background-color: #fafafa;
    border-left: 0.25rem solid #ea74ac;
  }
  .album-download {
    filter: none;
  }
  .album-download:hover {
    filter: invert(65%) sepia(45%) saturate(772%) hue-rotate(295deg) brightness(103%) contrast(91%) drop-shadow( 0px 0px 5px #f484b6);
  }
}
</style>

<script>
  import {downloadTrack} from './download';

  export let id;
  export let title;
  export let artist;
  export let duration;

  function formatTime(s) {
    return Math.floor(s / 60).toString().padStart(2, '0') + ':' + (s % 60).toString().padStart(2, '0');
  }
</script>

<div class="track" id="track-{id}">
  <span>{artist} - {title}</span>
  <span>
    <span class="track-download-wrapper" on:click={downloadTrack}>
      <img class="album-download" width="32" height="32" src="assets/download.svg" alt="Download">
    </span>
     {formatTime(duration)}
  </span>
</div>