$(function () {
	var $tree = $("#tree");
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
			$("#current-file-indicator").text(data.node.title);
			$("#audio").attr("src", "/audio?src=" + data.node.data.path);
		}
	});
});