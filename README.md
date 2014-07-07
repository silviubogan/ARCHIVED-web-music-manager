web-music-manager
=================

A cloud music manager and player.

Usage
-----

First install the node module "statique" using the command `npm install statique` in the project directory (which contains the app.js file). Then run `node app.js /path/to/music/collection` (in the project directory) where /path/to/music/collection is the path to your music collection, and open [http://localhost/](http://localhost/) in your web browser.

Tested on
---------

Windows 7 with node.js v0.10.29.

Tasks
-----

- organize YouTube collection of music
	- add YouTube music using URL of the video page
	- group/sort by artist, album (which may be entered manually by the user for every added YouTube URL)
	- play YouTube videos inline
- add support for other YouTube-like web services such as http://www.trilulilu.ro/
- implement search
- option to associate audio files in the filesystem music collection with one or more YouTube URLs

Also see the issues and bugs here: https://github.com/silviubogan/web-music-manager/issues

Thanks
------

- [Ionică Bizău](https://github.com/IonicaBizau), for the easy-to-use `statique` node.js module.
