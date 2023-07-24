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

<div class="col-5 z-1 position-absolute d-flex flex-column h-100 p-0">
    <input
        type="search"
        class="sticky-top rounded-0 border border-0 p-2 bg-body bg-opacity-75"
        bind:value={search}
        placeholder="Search playlist" />

    <div
        class="list-group list-group-flush flex-grow-1 overflow-y-scroll rounded-0"
        style="backdrop-filter: blur(5px);">
        {#each list as song, index (song)}
            <button
                class="list-group-item list-group-item-action bg-body bg-opacity-75 border-light"
                on:click={changeSong(song.index)}>
                <h6 class="mb-0 text-truncate">{song.name}</h6>
                <small class="text-muted text-truncate">{song.artist}</small>
            </button>
        {/each}
    </div>
</div>
