<script>
import { createEventDispatcher } from 'svelte';

let search = '';
export let player;

$: list = player
    ? player.playlist.filter(
          (item) =>
              (item.name + item.artist)
                  .toLowerCase()
                  .indexOf(search.toLowerCase()) !== -1
      )
    : [];

const dispatch = createEventDispatcher();

function changeSong(number) {
    dispatch('changeSong', {
        index: number
    });
}
</script>

<input
    class="form-control"
    id="search"
    type="search"
    bind:value={search}
    placeholder="Search"
    aria-label="Search" />
<div id="playlist" class="list-group style-3">
    {#each list as song, index (song)}
        <a
            href="javascript:;"
            class="list-group-item list-group-item-action list"
            on:click={changeSong(song.index)}>
            <h6>
                {song.name}
                •
                <small class="text-muted">{song.artist}</small>
            </h6>
        </a>
    {/each}
</div>
