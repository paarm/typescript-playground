var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs')
;

var mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "ico": "image/icon",
    "css": "text/css"
};

http.createServer(handleRequestRoot).listen(3000);

function handleRequestRoot(req, res) {
    var uri = url.parse(req.url).pathname;
    var filename = path.join(process.cwd(), "www");
    filename = path.join(filename, uri);
    console.log("Ressource aus Pfad: "+filename)
    try {
        fs.access(filename, fs.F_OK, function(err) {
            var delivered=false;
            if(!err) {
                var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
                res.writeHead(200, {'Content-Type':mimeType});
                var fileStream = fs.createReadStream(filename);
                fileStream.pipe(res);
                delivered=true;
                console.log("delivered file: " + filename);
            }
            if (!delivered) {
              console.log("not exists: " + filename);
              res.writeHead(200, {'Content-Type': 'text/plain'});
              res.write('404 Not Found\n');
              res.end();
            }
        }); //end path.exists
    } catch (e) {
        console.log(e);
    }
};

