<script>
import Playlist from './Playlist.svelte';
import TrackDetails from './TrackDetails.svelte';
import PLaybackControls from './PlaybackControls.svelte';
import Settings from './Settings.svelte';

const ipc = require('electron').ipcRenderer;
const fs = require('fs');
const path = require('path');
const storage = require('electron-json-storage');
const mm = require('music-metadata');
const chokidar = require('chokidar');

let watcher;

storage.getDataPath();

let trackName = 'Unknown';
let trackArtist = 'Unknown';
let trackAlbum = 'Unknown';
let songList = null;
let songPlaying = false;
let playListVisible = false;
let loading = false;
let theme = 'dark';

let duration = '00:00';
let timer = '00:00';

let files = null;
let player = null;

let offsetWidth;

let shuffle = false;
let mute = false;
let slider = 100;

storage.has('settings', function (error, hasKey) {
    if (error) throw error;
    if (hasKey) {
        storage.get('settings', function (error, data) {
            if (error) throw error;
            if (data.shuffle) shuffle = true;
            if (data.volume) slider = data.volume;
        });
    }
});

storage.has('path', function (error, hasKey) {
    if (error) throw error;
    if (hasKey) {
        storage.get('path', function (error, data) {
            if (error) throw error;
            scanDir(data.path.toString());
        });
    }
});

function setTheme(data) {
    var icons = document.body.querySelectorAll('svg');
    var artistBadge = document.body.querySelector('#artist');
    if (data.theme == 'light') {
        theme = 'light';
        document.body.style.backgroundColor = '#ffffff';
        document.body.style.color = '#212529';
        artistBadge.style.backgroundColor = '#999999';

        icons.forEach((icon) => {
            icon.style.color = '#212529';
        });
    } else if (data.theme == 'dark') {
        theme = 'dark';
        document.body.style.backgroundColor = '#212121';
        document.body.style.color = 'azure';

        icons.forEach((icon) => {
            icon.style.color = 'azure';
        });
    } else if (data.theme == 'disco') {
        theme = 'disco';
        document.body.style.backgroundColor = '#212121';
        document.body.style.color = 'azure';
        icons.forEach((icon) => {
            icon.style.color = 'azure';
        });
    }
}

storage.has('theme', function (error, hasKey) {
    if (error) throw error;
    if (hasKey) {
        storage.get('theme', function (error, data) {
            if (error) throw error;
            setTheme(data);
        });
    }
});

var walkSync = function (dir, filelist) {
    files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function (file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
            filelist = walkSync(path.join(dir, file), filelist);
        } else {
            if (
                file.endsWith('.mp3') ||
                file.endsWith('.m4a') ||
                file.endsWith('.webm') ||
                file.endsWith('.wav') ||
                file.endsWith('.aac') ||
                file.endsWith('.ogg') ||
                file.endsWith('.opus')
            ) {
                filelist.push(path.join(dir, file));
            }
        }
    });
    return filelist;
};

async function parseFiles(audioFiles) {
    var titles = [];

    loading = true;

    for (const audioFile of audioFiles) {
        // await will ensure the metadata parsing is completed before we move on to the next file
        const metadata = await mm.parseFile(audioFile, { skipCovers: true });
        const stats = fs.statSync(audioFile);
        var data = {};
        var title = metadata.common.title;
        var artist = metadata.common.artist;
        if (title) data.title = metadata.common.title;
        else data.title = audioFile.split(path.sep).slice(-1)[0];
        if (artist) data.artist = metadata.common.artist;
        else data.artist = '';
        data.modDate = stats.mtime;

        titles.push(data);
    }
    loading = false;

    return titles;
}

async function scanDir(filePath) {
    if (!filePath || filePath == 'undefined') return;

    watcher = chokidar.watch(filePath, {
        ignored: /[\/\\]\./,
        persistent: true
    });

    var arr = walkSync(filePath);
    var arg = {};
    var names = await parseFiles(arr);

    arg.files = arr;
    arg.path = filePath;
    arg.names = names;

    startPlayer(arg);
}

function themeChange(data) {
    setTheme(data);
}

ipc.on('theme-change', function (event, arg) {
    themeChange(arg);
});

function sortByTitle(arr, des = false) {
    arr.sort((a, b) => {
        let fa, fb;
        if (!des) {
            fa = a.name.toLowerCase();
            fb = b.name.toLowerCase();
        } else {
            fa = b.name.toLowerCase();
            fb = a.name.toLowerCase();
        }
        if (fa < fb) return -1;
        if (fa > fb) return 1;
        return 0;
    });
    return arr;
}

function sortByArtist(arr, des = false) {
    arr.sort((a, b) => {
        let fa, fb;
        if (!des) {
            fa = a.artist.toLowerCase();
            fb = b.artist.toLowerCase();
        } else {
            fa = b.artist.toLowerCase();
            fb = a.artist.toLowerCase();
        }
        if (fa < fb) return -1;
        if (fa > fb) return 1;
        return 0;
    });
    return arr;
}

function sortByDate(arr, des = false) {
    arr.sort((a, b) => {
        if (!des) return b.date - a.date;
        return a.date - b.date;
    });
    return arr;
}

function sortDefault(arr, des = false) {
    arr.sort((a, b) => {
        if (!des) return a.index - b.index;
        return b.index - a.index;
    });
    return arr;
}

ipc.on('sort-change', function (event, arg) {
    if (player) {
        var index = player.playlist[player.index].index;

        if (arg.items[0].checked)
            player.playlist = sortByDate(player.playlist, arg.items[6].checked);
        else if (arg.items[1].checked)
            player.playlist = sortByTitle(
                player.playlist,
                arg.items[6].checked
            );
        else if (arg.items[2].checked)
            player.playlist = sortByArtist(
                player.playlist,
                arg.items[6].checked
            );
        else if (arg.items[3].checked)
            player.playlist = sortDefault(
                player.playlist,
                arg.items[6].checked
            );

        player.index = player.playlist.findIndex((x) => x.index == index);
    }
});

ipc.on('save-settings', function (event, arg) {
    storage.set(
        'settings',
        { shuffle: shuffle, mute: mute, volume: slider },
        function (error) {
            ipc.send('closed');
        }
    );
});

ipc.on('selected-files', function (event, arg) {
    scanDir(arg);
});

async function addSongToPlaylist(path) {
    if (player) {
        const metadata = await mm.parseFile(path, { skipCovers: true });
        const stats = fs.statSync(audioFile);
        var data = {};
        var title = metadata.common.title;
        var artist = metadata.common.artist;
        if (title) data.title = metadata.common.title;
        else data.title = path.split(path.sep).slice(-1)[0];
        if (artist) data.artist = metadata.common.artist;
        else data.artist = '';
        data.modDate = stats.mtime;

        var len = player.playlist.length;

        player.playlist.push({
            title: path,
            file: path,
            name: data.title,
            artist: data.artist,
            date: data.modDate,
            howl: null,
            index: len
        });
    }
}

function removeSongFromPlaylist(path) {
    if (player) {
        var remIndex = player.playlist.findIndex((x) => x.file == path);
        if (remIndex != -1) {
            player.playlist.splice(remIndex, 1);
            player.randomArray = randomize(
                Array.from({ length: player.playlist.length }, (_, i) => i)
            );
        }
    }
}

function startPlayer(arg) {
    if (songPlaying) {
        player.pause();
        songPlaying = false;
    }
    songList = arg;
    var songArr = [];

    for (let i = 0; i < songList.files.length; i++) {
        songArr.push({
            title: songList.files[i],
            file: songList.files[i],
            name: songList.names[i].title,
            artist: songList.names[i].artist,
            date: songList.names[i].modDate,
            howl: null,
            index: i
        });
    }

    watcher
        .on('add', (path) => addSongToPlaylist(path))
        .on('unlink', (path) => removeSongFromPlaylist(path));

    storage.has('last-played', function (error, hasKey) {
        if (error) throw error;
        if (hasKey) {
            storage.get('last-played', function (error, data) {
                if (error) throw error;
                var index = arg.files.indexOf(data.path);

                if (index != -1) {
                    player = new Player(songArr, index);
                } else {
                    player = new Player(songArr, 0);
                }

                getTags(player.playlist[player.index].file);
            });
        } else {
            player = new Player(songArr, 0);
            getTags(player.playlist[player.index].file);
        }
    });
}

function luminance(rgb) {
    const RED = 0.2126;
    const GREEN = 0.7152;
    const BLUE = 0.0722;

    const GAMMA = 2.4;
    var a = rgb.map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, GAMMA);
    });
    return a[0] * RED + a[1] * GREEN + a[2] * BLUE;
}

function contrast(rgb1, rgb2) {
    var lum1 = luminance(rgb1);
    var lum2 = luminance(rgb2);
    var brightest = Math.max(lum1, lum2);
    var darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
}

export function getTextColor(rgb1, rgb2, hsl) {
    const darken = 7.5;
    const contrastRatio = contrast(rgb1, rgb2);

    if (contrastRatio < 4.5) {
        hsl = [hsl[0], hsl[1], hsl[2] - darken * (4.5 - contrastRatio)];
    }
    return hsl;
}

function getTags(audioFile) {
    var titles = [];
    const metadata = mm
        .parseFile(audioFile, { skipCovers: false })
        .then((metadata) => {
            var title = metadata.common.title;
            var artist = metadata.common.artist;
            var album = metadata.common.album;

            if (title) trackName = title;
            else trackName = audioFile.split(path.sep).slice(-1)[0];
            if (artist) trackArtist = artist;
            else trackArtist = 'Unknown';
            if (album) trackAlbum = album;
            else trackAlbum = 'Unknown';
            var img = document.getElementById('picture');

            if (metadata.common.picture) {
                var picture = metadata.common.picture[0];
                img.style.display = 'block';
                img.src = `data:${
                    picture.format
                };base64,${picture.data.toString('base64')}`;
                img.addEventListener('load', function () {
                    if (theme == 'disco') {
                        var vibrant = new Vibrant(img);
                        var swatches = vibrant.swatches();

                        const hsl = swatches['DarkMuted'].hsl.map((value) => {
                            return value * 100;
                        });
                        const textHSL = getTextColor(
                            swatches['DarkMuted'].rgb,
                            swatches['Muted'].rgb,
                            hsl
                        );
                        if (swatches['Muted'])
                            document.body.style.backgroundColor = swatches[
                                'Muted'
                            ].getHex();
                        else document.body.style.backgroundColor = '#212121';
                        if (swatches['DarkMuted']) {
                            document.body.style.color = `hsl(${textHSL[0]} ${textHSL[1]}% ${textHSL[2]}%)`;
                        } else document.body.style.color = 'azure';
                        if (swatches['DarkMuted']) {
                            let artistPill = document.body.querySelector(
                                '#artist'
                            );
                            artistPill.style.backgroundColor = `hsl(${textHSL[0]} ${textHSL[1]}% ${textHSL[2]}%)`;
                        } else
                            document.body.querySelector(
                                '#artist'
                            ).backgroundColor = 'darkslategrey';
                    }
                });
            } else {
                img.style.display = 'block';
                img.src = 'assets/placeholder_600_600.png';
            }
        })
        .catch((err) => {
            console.error(err.message);
        });

    return titles;
}

var seekToTime = function (event) {
    player.seek(event.offsetX / offsetWidth);
};
var playPlaylistSong = function (index) {
    player.skipTo(index);
};
var nextSong = function () {
    if (shuffle) {
        player.skip('random-next');
    } else {
        player.skip('next');
    }
    songPlaying = true;
};
var prevSong = function () {
    if (shuffle) {
        player.skip('random-prev');
    } else {
        player.skip('prev');
    }
    songPlaying = true;
};

var showPlaylist = function () {
    if (playListVisible) {
        playListVisible = false;
    } else {
        playListVisible = true;
    }
};

var playMusic = function () {
    if (songPlaying) {
        player.pause();
        songPlaying = false;
    } else {
        player.play();
        songPlaying = true;
    }
};

var toggleShuffle = function () {
    if (shuffle) {
        shuffle = false;
    } else {
        shuffle = true;
    }
    storage.set(
        'settings',
        { shuffle: shuffle, volume: slider },
        function (error) {
            if (error) throw error;
        }
    );
};

var togglemute = function () {
    if (mute) {
        mute = false;
        player.volume(slider / 100);
    } else {
        mute = true;
        player.volume(0);
    }
    storage.set(
        'settings',
        { shuffle: shuffle, volume: slider },
        function (error) {
            if (error) throw error;
        }
    );
};

function randomize(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

var Player = function (playlist, index) {
    this.playlist = playlist;
    this.index = index;
    this.randomIndex = index;
    this.randomArray = randomize(
        Array.from({ length: playlist.length }, (_, i) => i)
    );
};

Player.prototype = {
    play: function (index) {
        var self = this;
        var sound;

        index = typeof index === 'number' ? index : self.index;
        var data = self.playlist[index];

        if (data.howl) {
            sound = data.howl;
        } else {
            sound = data.howl = new Howl({
                src: [data.file],
                html5: true,
                onplay: function () {
                    duration = self.formatTime(Math.round(sound.duration()));
                    requestAnimationFrame(self.step.bind(self));
                },
                onend: function () {
                    if (shuffle) {
                        self.skip('random');
                    } else {
                        self.skip('right');
                    }
                }
            });
        }

        storage.set('last-played', { path: data.file }, function (error) {
            if (error) throw error;
        });
        sound.play();
        getTags(data.file);

        self.index = index;
    },

    pause: function () {
        var self = this;

        var sound = self.playlist[self.index].howl;

        sound.pause();
    },

    skip: function (direction) {
        var self = this;

        var index = 0;
        if (direction === 'prev') {
            index = self.index - 1;
            if (index < 0) {
                index = self.playlist.length - 1;
            }
        } else if (direction === 'random-next') {
            self.randomIndex += 1;
            if (self.randomIndex >= self.randomArray.length) {
                self.randomIndex = 0;
            }
            index = self.randomArray[self.randomIndex];
        } else if (direction === 'random-prev') {
            self.randomIndex -= 1;
            if (self.randomIndex < 0) {
                self.randomIndex = self.randomArray.length - 1;
            }
            index = self.randomArray[self.randomIndex];
        } else {
            index = self.index + 1;
            if (index >= self.playlist.length) {
                index = 0;
            }
        }

        self.skipTo(this.playlist[index].index);
    },

    skipTo: function (index) {
        var self = this;

        if (self.playlist[self.index].howl) {
            self.playlist[self.index].howl.stop();
        }
        var data = self.playlist[index];
        index = this.playlist.findIndex((x) => x.index == index);

        if (!songPlaying) {
            songPlaying = true;
            self.play(index);
        } else self.play(index);
    },

    step: function () {
        var self = this;

        var sound = self.playlist[self.index].howl;

        var seek = sound.seek() || 0;
        timer = self.formatTime(Math.round(seek));
        progress.style.width = ((seek / sound.duration()) * 100 || 0) + '%';

        if (sound.playing()) {
            requestAnimationFrame(self.step.bind(self));
        }
    },
    formatTime: function (secs) {
        var minutes = Math.floor(secs / 60) || 0;
        var seconds = secs - minutes * 60 || 0;

        return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
    },
    volume: function (val) {
        Howler.volume(val);
    },
    seek: function (time) {
        var self = this;

        var sound = self.playlist[self.index].howl;

        if (sound.playing() || true) {
            sound.seek(sound.duration() * time);
            requestAnimationFrame(self.step.bind(self));
        }
    }
};

var volumnUp = function () {
    if (slider !== 100) {
        slider = slider + 2;
        player.volume(slider / 100);
    }
};

var volumnDown = function () {
    if (slider !== 0) {
        slider = slider - 2;
        player.volume(slider / 100);
    }
};

var handleKeyboardPress = function (keycode) {
    switch (keycode) {
        case 'MediaPlayPause':
        case ' ':
            playMusic();
            break;
        case 'ArrowRight':
        case 'MediaTrackNext':
            nextSong();
            break;
        case 'ArrowLeft':
        case 'MediaTrackPrevious':
            prevSong();
            break;
        case 'ArrowUp':
            volumnUp();
            break;
        case 'ArrowDown':
            volumnDown();
            break;
        default:
            break;
    }
};

$: if (player) {
    player.volume(slider / 100);
    mute = false;
}
</script>

<style>
.progress .progress-bar {
    -webkit-transition: none;
    -o-transition: none;
    transition: none;
}
</style>

<svelte:window
    on:keyup={(e) => {
        if (!playListVisible) handleKeyboardPress(e.key);
    }} />

<div class="container-fluid h-100">
    <div class="row h-100 align-items-center">
        {#if playListVisible}
            <Playlist
                {player}
                on:changeSong={(event) => playPlaylistSong(event.detail.index)} />
        {/if}
        <div class="col text-center p-3">
            <div class="card_list h-100">
                <div class="row">
                    <div class="col-5 d-flex align-items-center">
                        <div class="ratio ratio-1x1">
                            {#if loading}
                                <div class="placeholder-glow">
                                    <div
                                        class="placeholder h-100 w-100 rounded" />
                                </div>
                            {:else}
                                <img
                                    id="picture"
                                    class="card-img-top img-fluid rounded album-art"
                                    style="object-fit: cover"
                                    alt="Album art"
                                    height={300}
                                    width={300} />
                            {/if}
                        </div>
                    </div>
                    <div class="col-7 d-flex align-items-center">
                        <div class="card-body card-body_list p-2 w-100">
                            <div class="row">
                                <div class="col">
                                    <TrackDetails
                                        {trackName}
                                        {trackArtist}
                                        {trackAlbum}
                                        {theme} />
                                </div>
                            </div>
                            <div class="row mt-2">
                                <PLaybackControls
                                    on:prevSong={prevSong}
                                    on:nextSong={nextSong}
                                    on:playMusic={playMusic}
                                    {songPlaying} />
                            </div>

                            <div class="row mb-1">
                                <div class="col d-flex justify-content-between">
                                    <div>{timer}</div>
                                    <div>{duration}</div>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col">
                                    <div
                                        class="progress"
                                        id="seek"
                                        bind:clientWidth={offsetWidth}
                                        on:click={(e) => seekToTime(e)}>
                                        <div
                                            class="progress-bar bg-danger my-0"
                                            role="progressbar"
                                            id="progress"
                                            aria-valuemin="0"
                                            aria-valuemax="100" />
                                    </div>
                                </div>
                            </div>
                            <div class="row mt-4 d-flex align-items-center">
                                <Settings
                                    on:showPlaylist={showPlaylist}
                                    on:toggleShuffle={toggleShuffle}
                                    {shuffle}
                                    on:togglemute={togglemute}
                                    bind:slider
                                    {mute} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
