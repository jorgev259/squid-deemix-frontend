<script>
	import Search from './Search.svelte';
	import Album from './Album.svelte';
	import Download from './Download.svelte';

	import {albums, display, displays, downloading} from './stores';
</script>

<style>
	content {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
	}
</style>

<main>
	<content>
		{#if $display === displays.AlbumSearch}
			<Search/>
			<div id="albums">
				{#each $albums as album}
					<Album id={album.id} title={album.title} cover={album.cover} artist={album.artist.name}/><br>
				{/each}
			</div>
		{/if}
		{#if $display === displays.Download && $downloading}
			<Download id={$downloading.id} isAlbum={$downloading.isAlbum}/>
		{/if}
	</content>
</main>