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

<div class="col d-flex align-items-center justify-content-center">
    <button
        type="button"
        id="prevBtn"
        class="btn btn-primary-outline"
        on:focus={(e) => e.target.blur()}
        on:click={prevSong}>
        <i class="fas fa-step-backward fa-inverse" style="font-size: 2rem;" />
    </button>

    {#if !songPlaying}
        <button
            type="button"
            id="playBtn"
            class="btn btn-primary-outline"
            on:focus={(e) => e.target.blur()}
            on:click={playMusic}>
            <i class="far fa-play-circle fa-inverse" style="font-size: 3rem;" />
        </button>
    {:else}
        <button
            type="button"
            id="pauseBtn"
            class="btn btn-primary-outline"
            on:focus={(e) => e.target.blur()}
            on:click={playMusic}>
            <i
                class="far fa-pause-circle fa-inverse"
                style="font-size: 3rem;" />
        </button>
    {/if}

    <button
        type="button"
        id="nextBtn"
        class="btn btn-primary-outline"
        on:focus={(e) => e.target.blur()}
        on:click={nextSong}>
        <i class="fas fa-step-forward fa-inverse" style="font-size: 2rem;" />
    </button>
</div>
