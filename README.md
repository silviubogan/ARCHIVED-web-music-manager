web-music-manager
=================

A cloud music manager and player.


Usage
-----

1. Install the dependencies using the command `npm install` in the project directory (which contains the app.js file).
2. Run `node app.js`, `npm start` or `node app.js /path/to/music/collection` (in the same directory) where `/path/to/music/collection` is the path to your music collection.
3. On Windows, open [http://localhost/](http://localhost/) in your web browser, on other operating systems open [http://localhost:8000/](http://localhost:8000/).


Tested on
---------

- Windows 7 with node.js v0.10.29
- Ubuntu 14.04


Contribute
----------

- Submit issues and bug reports or solve/fix existing issues [here](https://github.com/silviubogan/web-music-manager/issues);
- Read the tasks listed below;
- Submit pull requests [here](https://github.com/silviubogan/web-music-manager/pulls).

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


Used libraries
--------------
* jQuery
* [purl](https://github.com/allmarkedup/purl)
* others (TODO)


Thanks
------

- [Ionică Bizău](https://github.com/IonicaBizau), for the easy-to-use `statique` node.js module.
