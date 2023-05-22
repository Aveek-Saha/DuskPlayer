<script>
import { createEventDispatcher } from 'svelte';

export let slider;
export let mute;
export let shuffle;

const dispatch = createEventDispatcher();

function showPlaylist() {
    dispatch('showPlaylist');
}

function toggleShuffle() {
    dispatch('toggleShuffle');
}

function togglemute() {
    dispatch('togglemute');
}
</script>

<div class="col-6">
    <div class="row">
        <div class="col d-flex justify-content-between">
            <i class="fas fa-volume-down" style="font-size: 1rem;" />
            <i class="fas fa-volume-up" style="font-size: 1rem;" />
        </div>
    </div>
    <div class="row">
        <div class="col">
            <input
                type="range"
                min="0"
                max="100"
                class="slider"
                bind:value={slider}
                id="myRange" />
        </div>
    </div>
</div>

<div class="col-6 d-flex justify-content-evenly">
    <i class="bi bi-volume-mute-fill" style="font-size: 1.5rem;" />
    <i class="bi bi-shuffle" style="font-size: 1.5rem;" />

    <i class="bi bi-music-note-list" style="font-size: 1.5rem;" />

    {#if mute}
        <button
            type="button"
            id="checkboxrn"
            on:focus={(e) => e.target.blur()}
            on:click={togglemute}
            class="btn btn-primary-outline">
            <i
                class="fas fa-volume-off fa-inverse"
                style="font-size: 1.5rem;" />
        </button>
    {:else}
        <button
            type="button"
            id="checkboxrn"
            on:focus={(e) => e.target.blur()}
            on:click={togglemute}
            class="btn btn-primary-outline">
            <i class="fas fa-volume-up fa-inverse" style="font-size: 1.5rem;" />
        </button>
    {/if}

    {#if shuffle}
        <button
            type="button"
            id="shuffleBtn"
            on:focus={(e) => e.target.blur()}
            on:click={toggleShuffle}
            class="btn btn-primary-outline">
            <i class="fas fa-random fa-inverse" style="font-size: 1.5rem;" />
        </button>
    {:else}
        <button
            type="button"
            id="shuffleBtn"
            on:focus={(e) => e.target.blur()}
            on:click={toggleShuffle}
            class="btn btn-primary-outline">
            <i class="fas fa-sync-alt fa-inverse" style="font-size: 1.5rem;" />
        </button>
    {/if}

    <button
        type="button"
        id="playlistBtn"
        on:focus={(e) => e.target.blur()}
        on:click={showPlaylist}
        class="btn btn-primary-outline">
        <i class="fas fa-bars fa-inverse" style="font-size: 1.5rem;" />
    </button>
</div>
