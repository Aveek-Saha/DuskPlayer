<script>
export let trackName;
export let trackArtist;
export let trackAlbum;
export let theme;
</script>

<div id="title">
    <h1 id="track">{trackName}</h1>
    <h3 id="artist">
        {trackArtist}
        •
        <small
            id="album"
            class:text-muted={theme != 'disco'}
            class:text-white={theme == 'disco'}>{trackAlbum}</small>
    </h3><br />
</div>
