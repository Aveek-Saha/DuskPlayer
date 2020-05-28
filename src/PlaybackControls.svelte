<script>
import { createEventDispatcher } from 'svelte';
export let songPlaying;

const dispatch = createEventDispatcher();

function prevSong() {
    dispatch('prevSong');
}

function playMusic() {
    dispatch('playMusic');
}

function nextSong() {
    dispatch('nextSong');
}
</script>

<button type="button" id="prevBtn" class="btn btn-primary-outline btn-lg" on:click={prevSong}>
    <i class="fas fa-step-backward fa-2x fa-inverse"></i>
</button>
{#if !songPlaying}
    <button type="button" id="playBtn" class="btn btn-primary-outline btn-lg" on:click={playMusic}>
        <i class="far fa-play-circle fa-4x fa-inverse"></i>
    </button>
{:else}

    <button type="button" id="pauseBtn" class="btn btn-primary-outline btn-lg" on:click={playMusic}>
        <i class="far fa-pause-circle fa-4x fa-inverse"></i>
    </button>
{/if}
<button type="button" id="nextBtn" class="btn btn-primary-outline btn-lg" on:click={nextSong}>
    <i class="fas fa-step-forward fa-2x fa-inverse"></i>
</button>