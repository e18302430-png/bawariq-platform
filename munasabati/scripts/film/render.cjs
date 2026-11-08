// يصدّر فيلم مناسبتي من film.html إطاراً إطاراً (دقة كاملة بدون فقد)
// node scripts/film/render.cjs <mode:hero|film> <w> <h> <out.mp4> [fps] [preview-times]
const { chromium } = require("playwright");
const { spawn } = require("child_process");
const path = require("path");

const [mode = "film", w = "1920", h = "1080", out = "film.mp4", fps = "30", preview] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: +w, height: +h } });
  await p.goto("file://" + path.join(__dirname, `film.html?mode=${mode}&w=${w}&h=${h}`));
  await p.evaluate(() => window.ready);
  const total = await p.evaluate(() => window.TOTAL);
  if (preview) { // لقطات معاينة فقط
    for (const t of preview.split(",")) { await p.evaluate((t) => window.render(t), +t); await p.screenshot({ path: out.replace(".mp4", `-${t}.jpg`), type: "jpeg", quality: 85 }); }
    console.log("total", total.toFixed(2)); await b.close(); return;
  }
  const n = Math.round(total * +fps);
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", fps, "-c:v", "mjpeg", "-i", "-",
    "-c:v", "libx264", "-preset", "slow", "-crf", mode === "film" ? "20" : "22", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", out], { stdio: ["pipe", "inherit", "inherit"] });
  for (let f = 0; f < n; f++) {
    await p.evaluate((t) => window.render(t), f / +fps);
    const buf = await p.screenshot({ type: "jpeg", quality: 96 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
    if (f % 60 === 0) process.stdout.write(`${mode} ${f}/${n}\n`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on("close", r));
  console.log("done", out, total.toFixed(2) + "s");
  await b.close();
})();
