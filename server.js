const http = require('http'),
  fs = require('fs'),
  url = require('url');


  const hostname = '127.0.0.1';
  const port = 8080;

  const server = http.createServer((req, res) => {

    fs.appendFile('log.txt', 'URL: ' + hostname + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Added to log.');
      }
    });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello, World!\n');
  });
  
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });


