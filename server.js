const http = require('http');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

let wsProcess = null;

const wwwRoot = "C:\\WS - Control - Panel\\www\\";

// Fungsi sederhana mendeteksi content-type
function getContentType(filename) {
  if (filename.endsWith('.html')) return 'text/html';
  if (filename.endsWith('.css')) return 'text/css';
  if (filename.endsWith('.js')) return 'text/javascript';
  if (filename.endsWith('.png')) return 'image/png';
  if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg';
  if (filename.endsWith('.gif')) return 'image/gif';
  return 'application/octet-stream';
}

const server = http.createServer((req, res) => {
  const { url, method } = req;

  console.log(`Request: ${method} ${url}`);

  // Hindari favicon
  if (url === '/favicon.ico') {
    res.writeHead(204);
    return res.end();
  }

  // Halaman kontrol
  if (url === '/' && method === 'GET') {
    const htmlPath = path.join(__dirname, 'index.html');
    fs.readFile(htmlPath, (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end('Gagal membaca index.html');
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      return res.end(data);
    });
  }

  // Start server
  else if (url === '/start' && method === 'POST') {
    if (wsProcess) {
      res.writeHead(200);
      return res.end('Server sudah berjalan.');
    }
    wsProcess = spawn('"C:\\WS - Control - Panel\\ws.bat"', ['server', 'start'], { shell: true });

    wsProcess.stdout.on('data', (data) => console.log(`stdout: ${data}`));
    wsProcess.stderr.on('data', (data) => console.error(`stderr: ${data}`));
    wsProcess.on('close', (code) => {
      console.log(`ws server selesai dengan kode ${code}`);
      wsProcess = null;
    });

    res.writeHead(200);
    return res.end('Server ws berhasil dijalankan.');
  }

  // Stop server
  else if (url === '/stop' && method === 'POST') {
    if (wsProcess) {
      wsProcess.kill();
      wsProcess = null;
      res.writeHead(200);
      return res.end('Server ws dihentikan.');
    }
    res.writeHead(200);
    return res.end('Server ws belum berjalan.');
  }

  // Semua GET request ke wwwRoot
  else if (method === 'GET') {
    // Hilangkan leading slash
    const urlPath = url.slice(1);
    const targetPath = path.join(wwwRoot, urlPath);

    fs.stat(targetPath, (err, stats) => {
      if (err) {
        res.writeHead(404);
        return res.end('404 Not Found');
      }

      if (stats.isDirectory()) {
        // Tampilkan isi folder
        fs.readdir(targetPath, (err, files) => {
          if (err) {
            res.writeHead(500);
            return res.end('Gagal membaca folder');
          }

          let respond = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>Isi folder ${urlPath}</title>
              <style>
                body { background: white; color: black; font-family: sans-serif; }
                ul { line-height: 1.8; }
                a { color: blue; text-decoration: none; }
              </style>
            </head>
            <body>
              <h1>Isi folder /${urlPath}</h1>
              <ul>
          `;

          files.forEach(file => {
            const link = path.join('/', urlPath, file).replace(/\\/g, '/');
            respond += `<li><a href="${link}">${file}</a></li>`;
          });

          respond += `
              </ul>
            </body>
            </html>
          `;

          res.writeHead(200, { 'Content-Type': 'text/html' });
          return res.end(respond);
        });
      } else if (stats.isFile()) {
        // Baca file dan tampilkan
        fs.readFile(targetPath, (err, data) => {
          if (err) {
            res.writeHead(500);
            return res.end('Gagal membaca file');
          }
          const contentType = getContentType(targetPath);
          res.writeHead(200, { 'Content-Type': contentType });
          return res.end(data);
        });
      } else {
        res.writeHead(404);
        return res.end('404 Not Found');
      }
    });
  }

  else {
    res.writeHead(404);
    return res.end('404 Not Found');
  }
});

server.listen(8000, () => {
  console.log('Server kontrol berjalan di http://localhost:8000');
});
