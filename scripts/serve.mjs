import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
};
export function startServer(port = 8782) {
  const server = http.createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(
        new URL(request.url, "http://localhost").pathname,
      );
      let filename = path.resolve(root, "." + pathname);
      if (!filename.startsWith(root + path.sep) && filename !== root) {
        response.writeHead(403).end();
        return;
      }
      if ((await fs.stat(filename)).isDirectory())
        filename = path.join(filename, "index.html");
      const content = await fs.readFile(filename);
      response
        .writeHead(200, {
          "Content-Type":
            types[path.extname(filename)] || "application/octet-stream",
          "Cache-Control": "no-cache",
        })
        .end(content);
    } catch {
      response
        .writeHead(404, { "Content-Type": "text/plain" })
        .end("Not found");
    }
  });
  return new Promise((resolve) =>
    server.listen(port, "127.0.0.1", () => resolve(server)),
  );
}
if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const port = Number(process.env.PORT || 8782);
  await startServer(port);
  console.log(`Showcase: http://127.0.0.1:${port}/demo/`);
  console.log(`Gallery: http://127.0.0.1:${port}/demo/gallery/`);
}
