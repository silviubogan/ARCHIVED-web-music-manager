var Statique = require("statique"),
	http = require("http"),
	fs = require("fs"),
	url = require("url");

var port = 80;
if (process.argv[2] === "help") {
	console.log("You can specify an argument: the filesystem path to your music collection, " +
		"or you can run the application just with its own data, its collection of online music " +
		"(YouTube URLs etc.).");
	process.exit();
}
var music_collection_path = process.argv[2];
var ytDataPath = "public/yt-data.json";

Statique.server({ root: __dirname + "/public" })
	.setRoutes({
		"/": "/index.html",
		"/data": function (req, res) {
			if (!music_collection_path) {
				res.end("[]");
				return;
			}

			var url_parts = url.parse(req.url, true);
			var query = url_parts.query;
			console.dir(query);

			var f = [];
			fs.readdir(music_collection_path + query.path, function(err, files) {
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
					if (fs.lstatSync(music_collection_path + query.path + "/" + f[i]).isDirectory()) {
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

			var str = fs.createReadStream(music_collection_path + src);
			str.pipe(res);
		},
		"/post-yt-data": function (req, res) {
			var url_parts = url.parse(req.url, true);
			var query = url_parts.query;
			fs.writeFile(ytDataPath, query.data, function () {
				res.end();
			});	
		},
		"/yt-data": function (req, res) {
			fs.exists(ytDataPath, function (exists) {
				if (exists) {
					fs.readFile(ytDataPath, function (err, data) {
						if (err) throw err;
						res.end(data);
					});
				} else {
					fs.writeFile(ytDataPath, "[]", function (err) {
						if (err) throw err;
						res.end("[]");
					});
				}
			});
		}
	});

http.createServer(Statique.serve).listen(port);

console.log("Listening on port " + port + ".");
