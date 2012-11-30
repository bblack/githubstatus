var http = require('http');
var https = require('https');
var fs = require('fs');

http.createServer(function (req, res) {
  https.get("https://status.github.com" + req.url, function(githubRes){

    var isAppJs = req.url == '/js/application.js';
    var respHeaders = githubRes.headers;
    delete respHeaders['content-length'];

    res.writeHead(githubRes.statusCode, respHeaders);
    if (isAppJs) {
      res.end(fs.readFileSync('js/application.js'));
    } else {
      githubRes.on('data', function(chunk){
        res.write(chunk);
      });
      githubRes.on('end', function(){
        if (isAppJs) {
          res.write(additionalJs);
        }
        res.end();
      });
    }
  });

}).listen(1337, '127.0.0.1');
console.log('Server running at http://127.0.0.1:1337/');