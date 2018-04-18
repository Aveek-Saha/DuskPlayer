
angular.module('Player.player',['ngRoute', 'angular-siri-wave'])
.config(['$routeProvider', ($routeProvider) => {
    $routeProvider.when('/player',{
        templateUrl: 'player/player.html', controller: 'Playerctrl'
    })
}])
.controller('Playerctrl', ['$scope', '$location', function ($scope, $location) {
    $scope.musicSelected = false;
    $scope.trackName = null;
    $scope.songList = null;
    $scope.songPlaying = false;
    $scope.playListVisible = false;
    // $scope.playMusic();

    var slider = document.getElementById("myRange");
    var sk = document.getElementById('seek')

    const ipc = require('electron').ipcRenderer;
    const jsmediatags = require("jsmediatags");

    ipc.on('modal-file-content', function(event, arg){
        // console.log(arg)

        if ($scope.songPlaying) {
          $scope.songPlaying = false;
          $scope.player.pause();
        }
        $scope.songList = arg;
        console.log($scope.songList)
        var songArr = [];
        console.log($scope.songList.files.length)
        var pth = arg.path;

        for(let i = 0; i < $scope.songList.files.length; i++){
            songArr.push({
                title:arg.path + '/' + $scope.songList.files[i],
                file:arg.path + '/' + $scope.songList.files[i],
                name: $scope.songList.files[i],
                howl: null
            });
        }

        $scope.player = new Player(songArr);
        $scope.musicSelected = true;
        $scope.$apply()
    });
    

    $scope.seekToTime = function($event){
        $scope.player.seek($event.offsetX / sk.offsetWidth);
    }
    $scope.playPlaylistSong = function(index){
        $scope.player.skipTo(index);
    }
    $scope.nextSong = function(){
        $scope.player.skip('next');
        $scope.songPlaying=true;
    }
    $scope.prevSong = function(){
        $scope.player.skip('prev');
        $scope.songPlaying=true;
    }

    $scope.showPlaylist = function(){
        if ($scope.playListVisible) {
            $scope.playListVisible = false;
            console.log($scope.playListVisible)            
        }
        else{
            $scope.playListVisible = true;
            console.log($scope.playListVisible)
        }
    }

    $scope.playMusic = function(){
        if ($scope.songPlaying) {
            $scope.songPlaying = false;
            $scope.player.pause();
        }
        else{
            $scope.songPlaying = true;
            $scope.player.play();
        }
    }

    slider.oninput = function() {
      var val = slider.value / 100;
      $scope.player.volume(val)
    }

    var Player = function(playlist) {
        this.playlist = playlist;
        this.index = 0;
    }

    Player.prototype = {

        play: function(index) {
          var self = this;
          var sound;

          index = typeof index === 'number' ? index : self.index;
          var data = self.playlist[index];
          $scope.trackName = data.name;
          $scope.trackArtist = "";
          console.log(data);
          new jsmediatags.Reader(data.file)
            .setTagsToRead(["title", "artist","picture"])
            .read({
              onSuccess: function (tag) {
                if (tag.tags.title){
                  $scope.trackName = tag.tags.title;
                  $scope.trackArtist = tag.tags.artist
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
          
          if (data.howl) {
            sound = data.howl;
          } else {
            sound = data.howl = new Howl({
              src: [data.file],
              html5: true,
              onplay: function() {
                $scope.timer = self.formatTime(Math.round(sound.duration()));
                requestAnimationFrame(self.step.bind(self));
                $scope.$apply();
              },
              onend: function() {
                self.skip('right');
              }
            });
          }

          sound.play();

          self.index = index;
        },

        pause: function() {
          var self = this;

          var sound = self.playlist[self.index].howl;

          sound.pause();
        },

        skip: function(direction) {
          var self = this;

          var index = 0;
          if (direction === 'prev') {
            index = self.index - 1;
            if (index < 0) {
              index = self.playlist.length - 1;
            }
          } else {
            index = self.index + 1;
            if (index >= self.playlist.length) {
              index = 0;
            }
          }

          var data = self.playlist[self.index];
          console.log(data);
          new jsmediatags.Reader(data.file)
            .setTagsToRead(["title", "artist", "picture"])
            .read({
              onSuccess: function (tag) {
                if (tag.tags.title) {
                  $scope.trackName = tag.tags.title;
                  $scope.trackArtist = tag.tags.artist
                }
                else {
                  $scope.trackName = data.name;
                  $scope.trackArtist = "";
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

          self.skipTo(index);
        },

        skipTo: function(index) {
          var self = this;

          if (self.playlist[self.index].howl) {
            // console.log(self.playlist[self.index].howl);
            self.playlist[self.index].howl.stop();
          }

          var data = self.playlist[index];
          console.log(data);
          new jsmediatags.Reader(data.file)
            .setTagsToRead(["title", "artist", "picture"])
            .read({
              onSuccess: function (tag) {
                if (tag.tags.title) {
                  $scope.trackName = tag.tags.title;
                  $scope.trackArtist = tag.tags.artist;
                }
                else{
                  $scope.trackName = data.name;
                  $scope.trackArtist = "";
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
            if (!$scope.songPlaying) {
              $scope.songPlaying = true;
              self.play(index);
            }
            else
              self.play(index);
        },

        step: function() {
          var self = this;

          var sound = self.playlist[self.index].howl;

          var seek = sound.seek() || 0;
          timer.innerHTML = self.formatTime(Math.round(seek));
          progress.style.width = (((seek / sound.duration()) * 100) || 0) + '%';

          if (sound.playing()) {
            requestAnimationFrame(self.step.bind(self));
          }
        },
        formatTime: function(secs) {
          var minutes = Math.floor(secs / 60) || 0;
          var seconds = (secs - minutes * 60) || 0;

          return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        },
        volume: function(val) {
          var self = this;
      
          // Update the global volume (affecting all Howls).
          Howler.volume(val);
      
        },
        seek: function(time) {
          var self = this;

          var sound = self.playlist[self.index].howl;

          if (sound.playing() || true) {
            sound.seek(sound.duration() * time);
            requestAnimationFrame(self.step.bind(self));
          }
        }
      }
}])
