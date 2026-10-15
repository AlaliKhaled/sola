import fs from "node:fs";
const OUT = "/tmp/claude-1000/-home-khaled/807c82a7-bc86-436d-8fef-a24dd5aa2b7a/scratchpad/labels";
fs.mkdirSync(OUT, { recursive: true });
// Bottle band label: wrap aspect ~ circumference:height. Render 2048 x 760.
const accent = "#c0592b", accentDeep = "#9c441d", name = "#7a2d12";
const html = `<!doctype html><html><head><meta charset="utf-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Calistoga&family=Inter:wght@400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:2048px;height:760px;overflow:hidden}
.wrap{position:relative;width:2048px;height:760px;background:#f4ead8;font-family:'Inter',sans-serif;color:#2a211c}
.edge{position:absolute;top:0;bottom:0;width:8px;background:${accent}}
.frame{position:absolute;inset:40px 0;border-top:3px solid ${accent};border-bottom:3px solid ${accent}}
.center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
.est{font-weight:700;letter-spacing:.42em;font-size:22px;color:${accent}}
.mark{font-family:'Calistoga';font-size:150px;line-height:.86;color:#2a211c;margin-top:6px}
.reserve{font-weight:700;letter-spacing:.56em;font-size:30px;color:${accentDeep};margin-top:10px}
.flav{font-family:'Calistoga';font-size:50px;color:${name};margin-top:18px}
.rule{width:120px;height:2px;background:${accent};margin:16px 0}
.vol{font-weight:600;letter-spacing:.3em;font-size:20px;color:#3a322c}
.side{position:absolute;top:50%;transform:translateY(-50%);font-family:'Calistoga';font-size:46px;color:#2a211c}
</style></head><body>
<div class="wrap">
  <div class="edge" style="left:0"></div><div class="edge" style="right:0"></div>
  <div class="frame"></div>
  <div class="center">
    <div class="est">SPARKLING&nbsp;&nbsp;BOTANICALS&nbsp;&nbsp;·&nbsp;&nbsp;EST.&nbsp;2022</div>
    <div class="mark">SOLA</div>
    <div class="reserve">RESERVE</div>
    <div class="rule"></div>
    <div class="flav">Blood Orange &amp; Rosemary</div>
    <div class="vol">PRESSED FRUIT · STEEPED HERBS · 275ML</div>
  </div>
  <div class="side" style="left:150px">SOLA</div>
  <div class="side" style="right:150px">SOLA</div>
</div></body></html>`;
fs.writeFileSync(`${OUT}/label_bottle.html`, html);
console.log("wrote bottle label html");
