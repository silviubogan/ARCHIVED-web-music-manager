var $ytIframeApiScript = $("<script>").attr("src",
        "https://www.youtube.com/iframe_api");
var firstScriptTag = $("script:first").get(0);
firstScriptTag.parentNode.insertBefore($ytIframeApiScript.get(0), firstScriptTag);

var cbs = [];
var done = false;
function addOnYTIframeAPIReady(cb) {
    if (!done) {
        cbs.push(cb);
    } else {
        cb();
    }
}
window.onYouTubeIframeAPIReady = function () {
    for (var i = 0; i < cbs.length; i++) {
        cbs[i]();
    }
    done = true;
};

var youTubePlayer;

var YouTubePlayer = Backbone.View.extend({
    tagName: "div",
    initialize: function () {
        var that = this;
        addOnYTIframeAPIReady(function () {
            that.player = new YT.Player(that.el, {
                height: '390',
                width: '640',
                events: {
                    'onReady': function (event) {
                        event.target.playVideo();
                    },
                    'onStateChange': function (event) {
                        if (event.data === YT.PlayerState.ENDED) {
                            if (repeatMode === "one") {
                                youTubePlayer.playById(playlist.get_current_id());
                            } else if (repeatMode === "all") {
                                playlist.play_next_or_first();
                            } else if (repeatMode === "off") {
                                playlist.play_next();
                            }
                        }
                    }
                }
            });
        });
    },
    playById: function (id) {
        this.player.loadVideoById({
            "videoId": id,
            "suggestedQuality": "large"
        });
    }
});

var yt_data = {
    current_data: null,
    post: function (cb) {
        var d = { data: JSON.stringify(this.current_data) };
        if (cb) {
            $.get("/post-yt-data", d, cb);
        } else {
            $.get("/post-yt-data", d);
        }
    },
    load: function (cb) {
        $.get("/yt-data", function (data) {
            yt_data.current_data = JSON.parse(data);
            if (cb) {
                cb();
            }
        });
    },
    has_id: function (id) {
        for (var i = 0; i < yt_data.current_data.length; i++) {
            if (yt_data.current_data[i] == id) {
                return true;
            }
        }
        return false;
    },
    add_id: function (id) {
        yt_data.current_data.push(id);
    },
    remove_id: function (id) {
        yt_data.current_data.splice(yt_data.current_data.indexOf(id), 1);
    }
};

var yt = {
    id_to_short_url: function (id) {
        return "http://youtu.be/" + id;
    },
    url_to_yt_id: function (url) {  // TODO: check if the URL is a valid YouTube video, and return an error if not
        url = $.url(url);
        if (url.attr("host") === "youtu.be") {
            return url.segment(1);
        }
        return url.param("v");
    },
    id_to_title: function (id, cb) { // TODO: check if the id is valid and if the video exists, and return an error if not
        $.getJSON("http://gdata.youtube.com/feeds/api/videos/" + id +
            "?format=5&alt=json", function (data) { // I don't understand the format=5 part of the URL.
                cb(data.entry.title.$t);
        });
    }
};

function create_yt_id_ui(options) { // options.{id,onPlay,onRemove}
    var $li = $("<li>"),
        $a = $("<a href='http://www.youtube.com/watch?v=" + options.id + "'>Loading title...</a>"),
        $playBtn = $("<input type='button' value='▶' title='Play'>"),
        $removeBtn = $("<input type='button' value='&times;' title='Delete'>"),
        $shortUrlBtn = $("<input type='button' value='Copy short URL' title='Copy short URL'>");

    $playBtn.on("click", options.onPlay);
    $removeBtn.on("click", options.onRemove);
    $shortUrlBtn.click(function () {
        prompt("Short URL:", yt.id_to_short_url(options.id));
    });

    $li.attr("data-id", options.id)
        .append($a)
        .append($playBtn)
        .append($removeBtn)
        .append($shortUrlBtn);

    yt.id_to_title(options.id, function (title) {
        // TODO: cache titles on server, maybe in the data file, or request more titles at the same time
        $a.text(title);
    });

    return $li;
}

var playlist = {
    init: function ($el) {
        this.current_id = null;
        this.current_pos = -1;
        this.$el = $el;
        this.clear();
    },
    get_view_for_id: function (id) {
        var $children = playlist.$el.children();
        for (var i = 0; i < $children.length; i++) {
            var $child = $children.eq(i);
            if ($child.attr("data-id") === id) {
                return $child;
            }
        }
        return null;
    },
    remove_id: function (id) {
        var i = this.ids.indexOf(id);
        if (i !== -1) {
            this.ids.splice(i, 1);
            var $view = this.get_view_for_id(id);
            $view.remove();
            if (id === playlist.current_id) { // && status === PLAYING
                youTubePlayer.player.stopVideo();
            }
        }
    },
    add_id: function (id) {
        if (this.ids.indexOf(id) === -1) {
            this.ids.push(id);
            var $li = create_yt_id_ui({
                id: id,
                onPlay: function () {
                    playlist.play_from_pos(playlist.ids.indexOf(id));
                },
                onRemove: function () {
                    playlist.remove_id(id);
                }
            });
            var $upButton = $("<input type='button' value='↑' title='Move up'>");
            var $downButton = $("<input type='button' value='↓' title='Move down'>");
            $upButton.on("click", function () {
                playlist.move_id_up(id);
            });
            $downButton.on("click", function () {
                playlist.move_id_down(id);
            });
            $li.append($upButton, $downButton);
            this.$el.append($li);
        } else {
            playlist.remove_id(id);
            playlist.add_id(id);
        }
    },
    clear: function () {
        this.$el.empty();
        this.ids = [];
    },
    play: function () {
        if (this.ids.length > 0) {
            this.play_from_pos(0);
        }
    },
    play_next_or_first: function () {
        if (this.current_pos === this.ids.length - 1) {
            this.current_pos = 0;
        } else {
            this.current_pos++;
        }
        this.current_id = this.ids[this.current_pos];
        youTubePlayer.playById(this.current_id);
    },
    play_next: function () {
        if (this.current_pos !== this.ids.length - 1) {
            this.current_pos++;
            this.current_id = this.ids[this.current_pos];
            youTubePlayer.playById(this.current_id);
        }
    },
    play_from_pos: function (pos) {
        this.current_pos = pos;
        this.current_id = this.ids[pos];
        youTubePlayer.playById(this.current_id);
    },
    get_current_id: function () {
        return this.current_id;
    },
    move_id_up: function (id) {
        var i = playlist.ids.indexOf(id);
        if (i > 0) {
            var aux = playlist.ids[i];
            playlist.ids[i] = playlist.ids[i - 1];
            playlist.ids[i - 1] = aux;

            var $view = playlist.get_view_for_id(id);
            $view.insertBefore($view.prev());
        }
    },
    move_id_down: function (id) {
        var i = playlist.ids.indexOf(id);
        if (i < playlist.ids.length - 1) {
            var aux = playlist.ids[i];
            playlist.ids[i] = playlist.ids[i + 1];
            playlist.ids[i + 1] = aux;

            var $view = playlist.get_view_for_id(id);
            $view.insertAfter($view.next());
        }
    }
};

var repeatMode = "off";
$(function () {
    var $tree = $("#tree"),
        $ytAddBtn = $("#yt-add-btn"),
        $ytUrl = $("#yt-url"),
        $ytList = $("#yt-list"),
        $ytClearUrlBtn = $("#yt-clear-url-btn"),
        $crtFileIndicator = $("#current-file-indicator"),
        $audioPlayer = $("#audio");

    youTubePlayer = new YouTubePlayer({
        el: $("#yt-player")
    });

    $tree.fancytree({
        source: [
            { title: "/", folder: true, lazy: true, expanded: true, selected: true, path: "/" }
        ],
        lazyLoad: function (ev, data) {
            var node = data.node;

            var d = { path: "/" };
            if (node.data.path) {
                d.path = node.data.path;
            }

            data.result = {
                url: "/data",
                data: d,
                cache: false
            };
        },
        activate: function (ev, data) {
            if (!data.node.folder) {
                $crtFileIndicator.text(data.node.title);
                $audioPlayer.attr({
                    "src": "/audio?src=" + data.node.data.path,
                    "autoplay": "" // maybe this could be set only once, probably in the HTML file
                });
            }
        }
    });

    playlist.init($("#yt-playlist"));
    $ytUrl.on("keyup", function (e) {
        if (e.keyCode == 13) {
            $ytAddBtn.trigger("click");
        }
    });
    $ytClearUrlBtn.on("click", function () {
        $ytUrl.val("");
    });

    function add_yt_id_to_ui(id) {
        var $li = create_yt_id_ui({
            id: id,
            onPlay: function () {
                playlist.clear();
                playlist.add_id(id);
                playlist.play();
            },
            onRemove: function () {
                yt_data.remove_id(id);
                yt_data.post();
                $li.remove();
            }
        });
        var $queueBtn = $("<input type='button' value='Queue' title='Queue'>");
        $queueBtn.on("click", function () {
            playlist.add_id(id);
        });
        $li.append($queueBtn);
        $ytList.append($li);
    }

    $ytAddBtn.click(function () {
        var url = $ytUrl.val().trim();
        if (url.length === 0) return;
        var id = yt.url_to_yt_id(url);
        if (!yt_data.has_id(id)) {
            yt_data.add_id(id);
            yt_data.post();
            add_yt_id_to_ui(id);
        } else {
            // TODO: scroll to and highlight the video in the list and show a more friendly and context-aware alert
            alert("This YouTube video is already in the list.");
        }
        $ytUrl.val("");
    });

    var $ytRepeatBtn = $("#yt-repeat-btn");
    $ytRepeatBtn.on("click", function () {
        if (repeatMode === "off") {
            repeatMode = "one";
        } else if (repeatMode === "one") {
            repeatMode = "all";
        } else if (repeatMode === "all") {
            repeatMode = "off";
        }
        $ytRepeatBtn.val("Repeat: " + repeatMode);
    });

    yt_data.load(function () {
        $ytList.empty();
        for (var i = 0; i < yt_data.current_data.length; i++) {
            add_yt_id_to_ui(yt_data.current_data[i]);
        }
    });
});

