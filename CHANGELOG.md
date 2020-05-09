# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added
* Show the album name next to the artist's name
* Show a spinning loader when audio files are being loaded
* Playback can now be resumed from the most recent track on restart

### Changed
* Theme can now be changed without restarting the application
* Show Song titles in the playlist instead of showing the file path
* Fixed a bug where track name and artist would not change on changing tracks

## [4.0.0] - 2019-09-16
### Added
* Brand new theme! The Disco theme changes the background color based on the song album art. Select it from the themes menu.
* Added a search bar to search for songs.

### Changed
* The progress bar now feels more responsive when seeking.
* Setting are now stored in a JSON store instead of in files.
* Fixed a bug where the title and artist name would flicker while playing/pausing or skipping tracks.


## [3.0.0] - 2019-06-17
### Added
* Now choose between a Dark and Light mode!

### Changed
* The player now recursively finds audio files in all sub directories of the chosen directory


## [2.0.0] - 2018-09-01
### Added
* When you open the app, it starts playing music from the directory that you last played music from. This means that you can skip having to select a directory when you open the app.
* You can now play tracks on shuffle.
* New app Icon

### Changed
* Changed the name to Dusk Player, Music player was too generic.
* New location and style for the playlist.
* Volume slider has indicators.
* Small style changes.

## [1.0.0] - 2018-04-18
### Added
* Supports: mp3, opus, ogg, wav, aac, m4a, webm.
* Quickly switch tracks in the same folder, from the playlist button.
* Fine tune the volume from the volume slider
* Reads ID3 tags and displays the artist and album art (if they exist)
