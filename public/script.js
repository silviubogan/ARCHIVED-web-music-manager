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

var ytData;

function postYtData(cb) {
	var d = { data: JSON.stringify(ytData) };
	if (cb) {
		$.get("/post-yt-data", d, cb);
	} else {
		$.get("/post-yt-data", d);
	}
}
function loadYtData(cb) {
	$.get("/yt-data", function (data) {
		ytData = JSON.parse(data);
		if (cb) {
			cb();
		}
	});
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
				$audioPlayer.attr("src", "/audio?src=" + data.node.data.path);
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
	function addYtId(id) {
		var $li = $("<li>");
		$li.append("<a href='http://www.youtube.com/watch?v=" + id + "'>" + id + "</a>");
		var $playBtn = $("<input type='button' value='>'>");
		$playBtn.click(function () {
			playYtId(id);
		});
		$li.append($playBtn);
		$ytList.append($li);
	}
	$ytAddBtn.click(function () {
		var url = $ytUrl.val().trim();
		if (url.length === 0) return;
		var id = $.url(url).param("v");
		ytData.push(id);
		postYtData();
		addYtId(id);
		$ytUrl.val("");
	});
	loadYtData(function () {
		$ytList.empty();
		for (var i = 0; i < ytData.length; i++) {
			addYtId(ytData[i]);
		}
	});
});

