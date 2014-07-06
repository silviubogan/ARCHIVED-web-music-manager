var Statique = require("statique"),
	http = require("http"),
	fs = require("fs"),
	url = require("url");

var port = 80;
if (!process.argv[2]) {
	console.log("You must specify the filesystem path to your music collection.");
	process.exit();
}

Statique.server({ root: __dirname + "/public" })
	.setRoutes({
		"/": "/index.html",
		"/data": function (req, res) {
			var url_parts = url.parse(req.url, true);
			var query = url_parts.query;
			console.dir(query);

			var f = [];
			fs.readdir(process.argv[2] + query.path, function(err, files) {
				if (err) {
					res.end(JSON.stringify(err));
					throw(err);
				}
				for (var i = 0; i < files.length; i++) {
					if (files[i] !== "." && files[i] !== "..") {
						f.push(files[i]);
					}
				}
				for (var i = 0; i < f.length; i++) {
					if (fs.lstatSync(process.argv[2] + query.path + "/" + f[i]).isDirectory()) {
						f[i] = {
							title: f[i],
							folder: true,
							lazy: true,
							path: query.path + "/" + f[i]
						};
					} else {
						f[i] = {
							title: f[i],
							path: query.path + "/" + f[i]
						};
					}
				}
				res.end(JSON.stringify(f));
			});
		},
		"/audio": function (req, res) {
			var url_parts = url.parse(req.url, true);
			var query = url_parts.query;
			var src = query.src;

			var str = fs.createReadStream(process.argv[2] + src);
			str.pipe(res);
		}
	});

http.createServer(function (req, res) {
	if (req.url === "/500") {
		return Statique.sendRes(res, 500, "html", "500 Internal server error");
	}
	Statique.serve(req, res);
}).listen(port);

console.log("Listening on port " + port + ".");