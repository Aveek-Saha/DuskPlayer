
angular.module('Player.player', ['ngRoute'])
  .config(['$routeProvider', ($routeProvider) => {
    $routeProvider.when('/player', {
      templateUrl: 'player/player.html', controller: 'Playerctrl'
    }).when('/player/light', {
      templateUrl: 'player/themes/light/index.html', controller: 'Playerctrl'
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
    $scope.theme = "dark";
    // $scope.playMusic();

    var slider = document.getElementById("myRange");
    var sk = document.getElementById('seek');
    var checkbox = document.getElementById("checkboxrn")

    const ipc = require('electron').ipcRenderer;
    const jsmediatags = require("jsmediatags");
    const fs = require('fs')

    fs.readFile('theme.txt', 'utf-8', function (err, buf) {
      if (err)
        return
      var temp = buf.toString();
      if(temp == "light")
        $location.path('/player/light')
      console.log(temp);
    });

    fs.readFile('path.txt', 'utf-8', function (err, buf) {
      if (err) {
        return
      }
      var temp = [buf.toString()];
      scanDir(temp);

      console.log(temp);

    });

    function scanDir(filePath) {
      if (!filePath || filePath[0] == 'undefined') return;

      fs.readdir(filePath[0], function (err, files) {
        var arr = [];
        for (var i = 0; i < files.length; i++) {
          if (files[i].substr(-4) === '.mp3' || files[i].substr(-4) === '.m4a'
            || files[i].substr(-5) === '.webm' || files[i].substr(-4) === '.wav'
            || files[i].substr(-4) === '.aac' || files[i].substr(-4) === '.ogg'
            || files[i].substr(-5) === '.opus') {
            arr.push(files[i]);
          }
        }
        // console.log(filePath);
        var arg = {};
        arg.files = arr;
        arg.path = filePath;

        startPlayer(arg)

      })
    }
    function themeChange() {
      $location.path('/player/light')
    }
    ipc.on('theme-change', function (event, arg) {
      // $location.path('/player/light')
      
      themeChange()
    });

    ipc.on('selected-files', function (event, arg) {
      // console.log(arg)

      startPlayer(arg)

    });

    function startPlayer(arg) {

      if ($scope.songPlaying) {
        $scope.songPlaying = false;
        $scope.player.pause();
      }
      $scope.songList = arg;
      // console.log($scope.songList)
      var songArr = [];
      // console.log($scope.songList.files.length)
      // var pth = arg.path;

      for (let i = 0; i < $scope.songList.files.length; i++) {
        songArr.push({
          title: arg.path + '/' + $scope.songList.files[i],
          file: arg.path + '/' + $scope.songList.files[i],
          name: $scope.songList.files[i],
          howl: null
        });
      }

      $scope.player = new Player(songArr);
      $scope.musicSelected = true;
      $scope.$apply()

      $scope.playMusic()
      $scope.playMusic()
    }

    function tag(data) {
      new jsmediatags.Reader(data.file)
        .setTagsToRead(["title", "artist", "picture"])
        .read({
          onSuccess: function (tag) {
            if (tag.tags.title) {
              $scope.trackName = tag.tags.title;
              $scope.trackArtist = tag.tags.artist;
            }
            var image = tag.tags.picture;
            if (image) {
              // var pic = document.getElementById('picture')
              var base64String = "";
              for (var i = 0; i < image.data.length; i++) {
                base64String += String.fromCharCode(image.data[i]);
              }
              var base64 = "data:image/jpeg;base64," +
                window.btoa(base64String);
              document.getElementById('picture').style.display = "block";
              document.getElementById('picture').setAttribute('src', base64);
              // pic.style.backgroundImage = "url('" + base64 +"') ";
            } else {
              document.getElementById('picture').style.display = "none";
              // pic.style.backgroundImage = "none";                  
            }
          },
          onError: function (error) {
            console.log(':(', error.type, error.info);
          }
        });
    }

    $scope.seekToTime = function ($event) {
      $scope.player.seek($event.offsetX / sk.offsetWidth);
    }
    $scope.playPlaylistSong = function (index) {
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
        $scope.songPlaying = false;
        $scope.player.pause();
      }
      else {
        $scope.songPlaying = true;
        $scope.player.play();
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

    var Player = function (playlist) {
      this.playlist = playlist;
      this.index = 0;
    }

    Player.prototype = {

      play: function (index) {
        var self = this;
        var sound;

        index = typeof index === 'number' ? index : self.index;
        var data = self.playlist[index];
        $scope.trackName = data.name;
        $scope.trackArtist = "";
        // console.log(data);
        tag(data);

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

        sound.play();

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
          console.log(index);

        }
        else {
          index = self.index + 1;
          if (index >= self.playlist.length) {
            index = 0;
          }
        }

        var data = self.playlist[self.index];
        // console.log(data);
        tag(data);

        self.skipTo(index);
      },

      skipTo: function (index) {
        var self = this;

        if (self.playlist[self.index].howl) {
          // console.log(self.playlist[self.index].howl);
          self.playlist[self.index].howl.stop();
        }

        var data = self.playlist[index];
        // console.log(data);
        tag(data);

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
