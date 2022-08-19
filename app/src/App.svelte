<script>
  import Album from './lib/Album.svelte';
  import Header from './lib/Header.svelte';
  import Loading from './lib/Loading.svelte';
  import Search from './lib/Search.svelte';
  import ThemeSwitcher from './lib/ThemeSwitcher.svelte';
  import { queue, saveOnDownload } from './lib/stores';
  import { get } from 'svelte/store';
  import { dev } from './lib/dev';
  import ProgressBar from './lib/ProgressBar.svelte';
  import { SvelteToast } from '@zerodevx/svelte-toast'

  let loading = false;

  let searchAlbums = [];
  let total;
  let next;
  let query;

  async function search(q) {
    query = q;

    searchAlbums = [];
    loading = true;

    try {
      let url = dev ? (new URL('http://localhost:4500/api/search')) : (new URL('/api/search', window.location.origin));
      url.searchParams.set('search', query);
      const response = await fetch(url);
      const data = await response.json();
      loading = false;
      searchAlbums = data.data;
      total = data.total;
      next = data.next;
    } catch (error) {
      console.error(error);
      loading = false;
    }
  }

  async function searchMore() {
    loading = true;

    try {
      let url = dev ? (new URL('http://localhost:4500/api/search')) : (new URL('/api/search', window.location.origin));
      url.searchParams.set('search', query);
      url.searchParams.set('index', next);
      const response = await fetch(url);
      const data = await response.json();
      loading = false;
      searchAlbums = [...searchAlbums, ...data.data];
      total = data.total;
      next = data.next;
    } catch (error) {
      console.error(error);
      loading = false;
    }
  }
</script>

<SvelteToast options={{
  theme: {
    '--toastBorderRadius': '0.75em',
    '--toastBackground': 'rgba(19, 19, 19, 0.7)'
  }
}}/>
<app>
  <main>
    <span class="main">
      <Header/>
      <Search onChange={search}/>
      {#if searchAlbums.length > 0}
        <div class="albums">
          {#each searchAlbums as album, i}
            <Album title={album.title} id={album.id} cover={album.cover} artist={album.artist}/>
          {/each}
        </div>

        {#if total > searchAlbums.length}
          <div style="padding: 1.5em">
            <button on:click={searchMore}>Load more</button>
          </div>
        {/if}
      {/if}
      {#if loading}
        <Loading/>
      {/if}
    </span>
  </main>
  <sidebar class:open={$queue.length > 0}>
    <h1>Download Queue</h1>
    <div class="queue">
      {#each $queue as dl}
        <div>
          <Album log={dl.log} short={true} hideDownload={true} butShowThisDownloadLinkInstead={dl.downloadLink} title={dl.title} artist={dl.artist} cover={dl.cover} id={dl.id} subtitle={!dl.isAlbum && `from ${dl.album}`} />
          <ProgressBar progress={dl.progress} success={dl.success}/>
        </div>
      {/each}
    </div>
    <form class="options">
      <input type="checkbox" id="auto-save" bind:checked={$saveOnDownload}/><label for="auto-save">Save songs on download <span class="small">(Doesn't work on all browsers)</span></label>
    </form>
  </sidebar>
</app>

<style>
  app {
    display: flex;
    flex-direction: row;
  }

  .main {
    display: flex;
    align-items: center;
    flex-direction: column;
  }
  main {
    flex: 1 1 0px;
    min-height: 100vh;
  }

  sidebar {
    padding: 1em;
    display: flex;
    flex-direction: column;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
    transition: width 0.2s ease-in-out, padding 0.2s ease-in-out, right 0.2s ease-in-out, height 0.2s ease-in-out;
  }

  @media (min-width: 1100px) {
    sidebar {
      height: calc(100vh - 2em);
      overflow: auto;
      overflow-x: hidden;
      position: sticky;
      top: 0px;
      width: 0px;
      right: 0px;
      padding: 0em;
    }
    sidebar.open {
      width: 450px;
      right: 8px;
      padding: 1em;
    }
  }

  @media (max-width: 1099px) {
    app {
      flex-direction: column;
    }
    sidebar {
      order: -1;
      align-items: center;
    }
    sidebar:not(.open) {
      height: 0px;
      padding: 0em;
      overflow: hidden;
    }
  }

  .queue {
    display: flex;
    flex-direction: column;
    gap: 1em;
    max-width: 380px;
  }
  .options {
    padding-top: 1em;
  }

  @media (prefers-color-scheme: dark) {
    sidebar {
      background-color: #161627;
    }
  }
  @media (prefers-color-scheme: light) {
    sidebar {
      background-color: #fafafa;
    }
  }

  .albums {
    margin-top: 20px;
    width: 600px;
    max-width: 98%;
    display: flex;
    flex-direction: column;
  }
</style>
