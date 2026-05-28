import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { resolve } from "node:path";

const port = Number(process.env.PHONE_PREVIEW_PORT ?? 8090);
const previewFile = resolve(process.cwd(), "phone-preview.html");

const server = createServer(async (req, res) => {
  if (req.url !== "/" && req.url !== "/phone-preview.html") {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  try {
    const fileStat = await stat(previewFile);
    res.writeHead(200, {
      "content-type": "text/html; charset=utf-8",
      "content-length": fileStat.size,
      "cache-control": "no-store",
    });
    createReadStream(previewFile).pipe(res);
  } catch (error) {
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    res.end(error instanceof Error ? error.message : "Failed to load preview");
  }
});

server.listen(port, () => {
  console.log(`Phone preview listening on http://localhost:${port}`);
});
