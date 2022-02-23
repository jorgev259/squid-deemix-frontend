<script>
  import {clearAlbums, pushAlbum} from './stores';
  import {querySearch} from './api';

  let searchbar;

  async function search() {
    const value = searchbar.value;
    clearAlbums();
    if (value !== '') {
      let albums = await querySearch(value);
      albums.forEach(pushAlbum);
    }
  }
</script>

<style>
  @media (prefers-color-scheme: dark) {
    input {
      background-color: #112;
      color: #fff;
      box-shadow: 0px 0px 15px #000;
      border-bottom: 0rem solid  rgb(131, 131, 243);
    }
    input:focus, input:hover {
      border-bottom: 0.25rem solid  rgb(131, 131, 243);
      background-color: #161626;
    }
  }
  @media (prefers-color-scheme: light) {
    input {
      background-color: #ffffff;
      color: #1e1e2d;
      box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.2);
      border-bottom: 0rem solid  #ea74ac;
    }
    input:focus, input:hover {
      border-bottom: 0.25rem solid  #ea74ac;
      background-color: #fafafa;
    }
  }

  input {
    margin: 5px;
    width: 550px;
    max-width: 98%;
    padding: 15px;
    font-size: x-large;
    border: none;
    border-radius: 7px;
    transition: 0.1s border-bottom ease-out, 0.1s background-color ease-in-out;
  }
</style>

<input type="search" id="album-search" name="q" bind:this={searchbar} on:change={search}>