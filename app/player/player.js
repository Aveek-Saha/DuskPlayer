
angular.module('Player.player', ['ngRoute'])
  .config(['$routeProvider', ($routeProvider) => {
    $routeProvider.when('/player', {
      templateUrl: 'player/player.html', controller: 'Playerctrl'
    })
  }])
  .controller('Playerctrl', ['$scope', '$location', function ($scope, $location) {
    $scope.musicSelected = false;
    $scope.trackName = null;
    $scope.songList = null;
    $scope.songPlaying = false;
    $scope.playListVisible = false;
    $scope.shuffle = false;
    $scope.mute = false;
    $scope.loading = false;
    $scope.theme = "dark";
    // $scope.playMusic();

    var slider = document.getElementById("myRange");
    var sk = document.getElementById('seek');
    var checkbox = document.getElementById("checkboxrn")

    const ipc = require('electron').ipcRenderer;
    const fs = require('fs')
    const path = require('path')
    const storage = require('electron-json-storage');
    const mm = require('music-metadata');

    const dataPath = storage.getDataPath();


    storage.has('path', function (error, hasKey) {
      if (error) throw error;
      if (hasKey) {
        storage.get('path', function (error, data) {
          if (error) throw error;
          // console.log(data);
          scanDir([data.path.toString()]);
        });
      }
    })

    function setTheme(data) {
      // var theme = data.theme
      var icons = document.body.querySelectorAll("svg");
      
      if (data.theme == "light") {
        $scope.theme = 'light'
        document.body.style.backgroundColor = "#F5F5F5"
        document.body.style.color = "#212529"

        icons.forEach(icon => {
          icon.style.color = "#212529";
        });
        album.classList.remove("text-white")
        album.classList.add("text-muted")

      }
      else if (data.theme == "dark") {
        $scope.theme = 'dark'
        document.body.style.backgroundColor = "#212121"
        document.body.style.color = "azure"

        icons.forEach(icon => {
          icon.style.color = "azure";
        });
        album.classList.remove("text-white")
        album.classList.add("text-muted")
      }
      else if (data.theme == "disco") {
        $scope.theme = 'disco'
        icons.forEach(icon => {
          icon.style.color = "azure";
        });
      }
    }

    storage.has('theme', function (error, hasKey) {
      if (error) throw error;
      if (hasKey) {
        storage.get('theme', function (error, data) {
          if (error) throw error;
          setTheme(data)
        });
      }
    })


    var walkSync = function (dir, filelist) {
      files = fs.readdirSync(dir);
      filelist = filelist || [];
      files.forEach(function (file) {
        if (fs.statSync(path.join(dir, file)).isDirectory()) {
          filelist = walkSync(path.join(dir, file), filelist);
        }
        else {
          if (file.endsWith('.mp3') || file.endsWith('.m4a')
            || file.endsWith('.webm') || file.endsWith('.wav')
            || file.endsWith('.aac') || file.endsWith('.ogg')
            || file.endsWith('.opus')) {
            filelist.push(path.join(dir, file));
          }
        }
      });
      return filelist;
    };

    async function parseFiles(audioFiles) {
      var titles = []

      $scope.loading = true;
      $scope.$apply()
      for (const audioFile of audioFiles) {

        // await will ensure the metadata parsing is completed before we move on to the next file
        const metadata = await mm.parseFile(audioFile, { skipCovers: true });
        data = {}
        var title = metadata.common.title
        var artist = metadata.common.artist
        if(title)
          data.title = metadata.common.title;
        else
          data.title = audioFile.split(path.sep).slice(-1)[0];
        if (artist)
          data.artist = metadata.common.artist;
        else
          data.artist = '';
        
        titles.push(data)
        
      }
      $scope.loading = false;
      $scope.$apply()
      return titles
    }

    async function scanDir(filePath) {
      if (!filePath || filePath[0] == 'undefined') return;

      var arr = walkSync(filePath[0]);
      var arg = {};
      var names = await parseFiles(arr)
      
      arg.files = arr;
      arg.path = filePath;
      arg.names = names
      // console.log(arg);
      
      // if (arg.files.length > 0)
      startPlayer(arg)
    }
    
    function themeChange(data) {
      
      console.log(data);
      setTheme(data)
      
    }
    ipc.on('theme-change', function (event, arg) {
      themeChange(arg)
    });

    ipc.on('selected-files', function (event, arg) {

      scanDir(arg)

    });

    function startPlayer(arg) {

      if ($scope.songPlaying) {
        $scope.player.pause();
        $scope.songPlaying = false;
      }
      $scope.songList = arg;
      // console.log($scope.songList)
      var songArr = [];

      for (let i = 0; i < $scope.songList.files.length; i++) {
        var len = $scope.songList.files[i].split("/").length - 1
        songArr.push({
          title: $scope.songList.files[i],
          file: $scope.songList.files[i],
          name: $scope.songList.names[i].title,
          artist: $scope.songList.names[i].artist,
          howl: null,
          index: i
        });
      }

      storage.has('last-played', function (error, hasKey) {
        if (error) throw error;
        if (hasKey) {
          storage.get('last-played', function (error, data) {
            if (error) throw error;
            var index = arg.files.indexOf(data.path)
            
            if (index != -1){
              $scope.player = new Player(songArr, index);
            } else {
              $scope.player = new Player(songArr, 0);
            }
            $scope.musicSelected = true;

            $scope.playMusic()
            $scope.playMusic()
            $scope.$apply()
          });
        }
        else {
          $scope.player = new Player(songArr, 0);

          $scope.playMusic()
          $scope.playMusic()
          $scope.$apply()
        }
      })


    }

    function getTags(audioFile) {
      var titles = []
      const metadata = mm.parseFile(audioFile, { skipCovers: false })
        .then(metadata => {
          // console.log(metadata.common);
          var title = metadata.common.title
          var artist = metadata.common.artist
          var album = metadata.common.album

          if(title)
            $scope.trackName = title;
          else
            $scope.trackName = audioFile.split(path.sep).slice(-1)[0]
          if(artist)
            $scope.trackArtist = artist;
          else
            $scope.trackArtist = ""
          if (album)
            $scope.trackAlbum = album;
          else
            $scope.trackAlbum = ""
          var img = document.getElementById('picture')
          var album = document.getElementById('album')

          if (metadata.common.picture) {
            var picture = metadata.common.picture[0]
            img.style.display = "block";
            img.src = `data:${picture.format};base64,${picture.data.toString('base64')}`;
            img.addEventListener('load', function () {
              if ($scope.theme == 'disco') {
                var vibrant = new Vibrant(img, 128, 3);
                var swatches = vibrant.swatches()
                if (swatches['DarkMuted'])
                  document.body.style.backgroundColor = swatches['DarkMuted'].getHex()
                else
                  document.body.style.backgroundColor = "#212121"
                if (swatches['LightVibrant'])
                  document.body.style.color = swatches['LightVibrant'].getHex()
                else 
                  document.body.style.color = "azure"

                album.classList.remove("text-muted")
                album.classList.add("text-white")

              }
            })
          } else {
            img.style.display = "none";

          }
          $scope.$apply()
        })
        .catch(err => {
          console.error(err.message);
        });

      return titles
    }

    $scope.seekToTime = function ($event) {
      $scope.player.seek($event.offsetX / sk.offsetWidth);
    }
    $scope.playPlaylistSong = function (index) {
      // console.log(index)
      $scope.player.skipTo(index);
    }
    $scope.nextSong = function () {
      if ($scope.shuffle) {
        $scope.player.skip('random');
      }
      else {
        $scope.player.skip('next');
      }
      $scope.songPlaying = true;
    }
    $scope.prevSong = function () {
      if ($scope.shuffle) {
        $scope.player.skip('random');
      }
      else {
        $scope.player.skip('prev');
      }
      $scope.songPlaying = true;
    }

    $scope.showPlaylist = function () {
      if ($scope.playListVisible) {
        $scope.playListVisible = false;
        // console.log($scope.playListVisible)
      }
      else {
        $scope.playListVisible = true;
        // console.log($scope.playListVisible)
      }
    }

    $scope.playMusic = function () {
      if ($scope.songPlaying) {
        $scope.player.pause();
        $scope.songPlaying = false;
      }
      else {
        $scope.player.play();
        $scope.songPlaying = true;
      }

    }

    $scope.toggleShuffle = function () {
      if ($scope.shuffle) {
        $scope.shuffle = false;
      }
      else {
        $scope.shuffle = true;
      }
    }

    $scope.togglecheckbox = function() {
        if ($scope.mute) {
            $scope.mute = false;
            $scope.player.volume(slider.value / 100);
        }
        else {
            $scope.mute = true;
            $scope.player.volume(0);
        }
    }

    slider.oninput = function () {
      var val = slider.value / 100;
      $scope.player.volume(val);
      $scope.mute = false;
    }

    var Player = function (playlist, index) {
      this.playlist = playlist;
      this.index = index;
    }

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
              $scope.timer = self.formatTime(Math.round(sound.duration()));
              requestAnimationFrame(self.step.bind(self));
              $scope.$apply();
            },
            onend: function () {
              if ($scope.shuffle) {
                self.skip('random');
              }
              else {
                self.skip('right');
              }
            }
          });
        }
        
        storage.set('last-played', { path: data.file }, function (error) {
          if (error) throw error
        })
        sound.play();
        getTags(data.file)

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
        }
        else if (direction === 'random') {
          index = Math.floor(Math.random() * self.playlist.length) + 1;
          // console.log(index);

        }
        else {
          index = self.index + 1;
          if (index >= self.playlist.length) {
            index = 0;
          }
        }

        var data = self.playlist[self.index];

        self.skipTo(index);
      },

      skipTo: function (index) {
        var self = this;

        if (self.playlist[self.index].howl) {
          self.playlist[self.index].howl.stop();
        }
        var data = self.playlist[index];
        // console.log(!self.playlist[self.index].howl);

        if (!$scope.songPlaying) {
          $scope.songPlaying = true;
          self.play(index);
        }
        else
          self.play(index);

      },

      step: function () {
        var self = this;

        var sound = self.playlist[self.index].howl;

        var seek = sound.seek() || 0;
        timer.innerHTML = self.formatTime(Math.round(seek));
        progress.style.width = (((seek / sound.duration()) * 100) || 0) + '%';

        if (sound.playing()) {
          requestAnimationFrame(self.step.bind(self));
        }
      },
      formatTime: function (secs) {
        var minutes = Math.floor(secs / 60) || 0;
        var seconds = (secs - minutes * 60) || 0;

        return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
      },
      volume: function (val) {
        var self = this;

        // Update the global volume (affecting all Howls).
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
    }
  }])
