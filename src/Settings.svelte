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

function togglecheckbox() {
    dispatch('togglecheckbox');
}

</script>

<div class="slidecontainer justify-content-start">
    <i class="fas fa-volume-down"></i>
    <i class="fas fa-volume-up" style="float: right"></i>
    <input type="range" min="0" max="100" class="slider" bind:value={slider} id="myRange">
</div>


<button type="button" id="playlistBtn" on:click={showPlaylist}
    class="btn btn-primary-outline btn-lg justify-content-end" >
    <i class="fas fa-bars fa-lg fa-inverse"></i>
</button>

{#if shuffle}
    <button type="button" id="shuffleBtn" on:click={toggleShuffle}
        class="btn btn-primary-outline btn-lg justify-content-end" >
        <i class="fas fa-random fa-lg fa-inverse"></i>
    </button>
{:else}
    <button type="button" id="shuffleBtn" on:click={toggleShuffle}
        class="btn btn-primary-outline btn-lg justify-content-end" >
        <i class="fas fa-sync-alt fa-lg fa-inverse"></i>
    </button>
{/if}


{#if mute}
    <button type="button" id="checkboxrn" on:click={togglecheckbox}
    class="btn btn-primary-outline btn-lg justify-content-end">
        <i class="fas fa-volume-off fa-lg fa-inverse"></i>
    </button>
{:else}
    <button type="button" id="checkboxrn" on:click={togglecheckbox}
    class="btn btn-primary-outline btn-lg justify-content-end">
        <i class="fas fa-volume-up fa-lg fa-inverse"></i>
    </button>
{/if}

