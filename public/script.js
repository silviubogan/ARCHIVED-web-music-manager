var $ytIframeApiScript = $("<script>").attr("src",
        "https://www.youtube.com/iframe_api");
var firstScriptTag = $("script:first").get(0);
firstScriptTag.parentNode.insertBefore($ytIframeApiScript.get(0), firstScriptTag);

var player;
function playYtId(id) {
    player.loadVideoById({
        "videoId": id,
        "suggestedQuality": "large"
    })
}
function onYouTubeIframeAPIReady() {
    player = new YT.Player('yt-player', {
        height: '390',
        width: '640',
        events: {
            'onReady': function (event) {
                event.target.playVideo();
            }
        }
    });
}

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

function yt_id_to_short_url(id) {
	return "http://youtu.be/" + id;
}

$(function () {
    var $tree = $("#tree"),
        $ytAddBtn = $("#yt-add-btn"),
        $ytUrl = $("#yt-url"),
        $ytList = $("#yt-list"),
        $ytClearUrlBtn = $("#yt-clear-url-btn"),
        $crtFileIndicator = $("#current-file-indicator"),
        $audioPlayer = $("#audio");

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
                    "autoplay": ""
                });
            }
        }
    });
    $ytUrl.keyup(function (e) {
        if (e.keyCode == 13) {
            $ytAddBtn.click();
        }
    });
    $ytClearUrlBtn.click(function () {
        $ytUrl.val("");
    });
    function add_yt_id(id) {
        var $li = $("<li>");
        $li.append("<a href='http://www.youtube.com/watch?v=" + id + "'>" + id + "</a>");
        var $playBtn = $("<input type='button' value='>' title='Play'>"),
        	$removeBtn = $("<input type='button' value='x' title='Delete'>"),
        	$shortUrlBtn = $("<input type='button' value='Copy short URL' title='Copy short URL'>");
        $playBtn.click(function () {
            playYtId(id);
        });
        $removeBtn.click(function () {
        	yt_data.remove_id(id);
        	yt_data.post();
        	$li.remove();
        });
        $shortUrlBtn.click(function () {
        	prompt("Short URL:", yt_id_to_short_url(id));
        });
        $li.append($playBtn)
        	.append($removeBtn)
        	.append($shortUrlBtn);
        $ytList.append($li);
    }
    $ytAddBtn.click(function () {
        var url = $ytUrl.val().trim();
        if (url.length === 0) return;
        var id = $.url(url).param("v");
        if (!yt_data.has_id(id)) {
	        yt_data.add_id(id);
	        yt_data.post();
	        add_yt_id(id);
	    } else {
	    	// TODO: scroll to and highlight the video in the list and show a more friendly and context-aware alert
	    	alert("This YouTube video is already in the list.");
	    }
	    $ytUrl.val("");
    });
    yt_data.load(function () {
        $ytList.empty();
        for (var i = 0; i < yt_data.current_data.length; i++) {
            add_yt_id(yt_data.current_data[i]);
        }
    });
});

