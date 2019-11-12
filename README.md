
<h1 align="center">
	<br>
	 Dusk Player <img width = "32px" src = "https://raw.githubusercontent.com/Aveek-Saha/MusicPlayer/master/dusk.png">

</h1>

<h3 align="center">
<img src ="https://img.shields.io/github/downloads/Aveek-Saha/MusicPlayer/total.svg?style=for-the-badge">
<img src ="https://img.shields.io/github/stars/Aveek-Saha/MusicPlayer.svg?style=for-the-badge">
<img src ="https://img.shields.io/github/forks/Aveek-Saha/MusicPlayer.svg?style=for-the-badge">
</h3>

A minimalistic music player, designed for simplicity. Built on electron, uses Howler for handling music playback, AngularJS and Bootstrap for the frontend, and jsmediatags to retrieve the ID3 tags. 

This can also serve as a starting point to impliment your own front-end/UI for a music Player.

Download here: [Releases](https://github.com/Aveek-Saha/MusicPlayer/releases)

# How to use
### 1. The Player
Download the build for your OS. Start the application and and then click on the Folders tab on the top left corner, this will bring up a window where you can select the folder where you want to play your mp3 files from. 
Once you select a folder with songs, just click play.
### 2. Building from the repo
Clone the repository, then navigate to it on your terminal and run ```npm install```, once all the dependencies have finished downloading, run ```npm start ``` to test it, and ```npm run dist ``` to build it for your platform.


# Features
<ul>
  <li>Supports: mp3, opus, ogg, wav, aac, m4a and webm.</li>
  <li>Quickly switch tracks in the same folder, from the playlist button.</li>
  <li>Fine tune the volume from the volume slider</li>
  <li>Plays tracks on Shuffle</li>
  <li>Choose between a Dark and Light mode</li>
  <li>Reads ID3 tags and displays the artist and album art (if they exist)</li>
</ul>

# Screenshots
<img src="https://aveeksaha.gitlab.io/DuskPlayer/Screenshot1.png" width="33%"></img> 
<img src="https://aveeksaha.gitlab.io/DuskPlayer/Screenshot3.png" width="32%"></img> 
<img src="https://aveeksaha.gitlab.io/DuskPlayer/Screenshot2.png" width="32%"></img> 

# New Features
Some new features and under the hood stuff that'll be included in the next update
* The progress bar now feels more responsive when seeking.
* Setting are now stored in a JSON store instead of in files

# v3.0.0
* Now choose between a Dark and Light mode!
* Recursively finds audio files in all sub directories of the chosen directory

# v2.0.0
* When you open the app, it starts playing music from the directory that you last played music from. This means that you can skip having to select a directory when you open the app.
* Changed the name to Dusk Player, Music player was too generic.
* You can now play tracks on shuffle.
* New location and style for the playlist.
* Volume slider has indicators.
* New app Icon
* Small style changes.

### If you liked this, check out My Blog where I post tutorials and write about projects like this
https://home.aveek.io/blog/


<div>Icons made by <a href="http://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>
