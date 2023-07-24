<script>
export let trackName;
export let trackArtist;
</script>

<h2
    class="card-title m-2 text-truncate text-shadow fw-bold"
    style="line-height: normal; min-width: 0">
    {trackName}
</h2>
<p class="card-text mt-2">
    <span id="artist" class="badge rounded-pill album-art mw-100 text-truncate">
        {trackArtist}
    </span>
</p>
