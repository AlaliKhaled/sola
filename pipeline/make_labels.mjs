import fs from "node:fs";
const OUT = "/tmp/claude-1000/-home-khaled/1e443476-95b6-4261-8b3a-62bf6cbebc4a/scratchpad/labels";
fs.mkdirSync(OUT, { recursive: true });

// Wrap label: circumference ~ height*1.8. Render 2048 x 1138.
const flavors = [
  {
    key: "blood",
    name1: "Blood Orange",
    name2: "& Rosemary",
    accent: "#c0592b",
    accentDeep: "#9c441d",
    name: "#7a2d12", // deep, high-contrast flavour-name colour
    sprig: "orange",
  },
  {
    key: "elder",
    name1: "Elderflower",
    name2: "& Lime",
    accent: "#7f9168",
    accentDeep: "#5f7049",
    name: "#3f5128",
    sprig: "elder",
  },
  {
    key: "rhubarb",
    name1: "Rhubarb",
    name2: "& Ginger",
    accent: "#b05560",
    accentDeep: "#8c3f4a",
    name: "#6e2630",
    sprig: "rhubarb",
  },
  {
    key: "grapefruit",
    name1: "Pink Grapefruit",
    name2: "& Sage",
    accent: "#d46a7b",
    accentDeep: "#b14f60",
    name: "#7f2d3b",
    sprig: "citrus",
  },
  {
    key: "cucumber",
    name1: "Cucumber",
    name2: "& Mint",
    accent: "#6fae8c",
    accentDeep: "#4f8e6e",
    name: "#2f5a45",
    sprig: "herb",
  },
  {
    key: "peach",
    name1: "Peach",
    name2: "& Basil",
    accent: "#e09a5f",
    accentDeep: "#c2743c",
    name: "#8a4a22",
    sprig: "peach",
  },
];

const sprigSVG = (kind, color) => {
  if (kind === "orange" || kind === "citrus")
    return `<circle cx="60" cy="60" r="46" fill="none" stroke="${color}" stroke-width="4"/>
      <circle cx="60" cy="60" r="30" fill="none" stroke="${color}" stroke-width="2.5"/>
      <path d="M60 30 V90 M30 60 H90 M39 39 L81 81 M81 39 L39 81" stroke="${color}" stroke-width="2"/>`;
  if (kind === "herb")
    return `<g stroke="${color}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M60 104 V34"/>
      <path d="M60 70 C42 66 32 52 32 34 C52 34 60 48 60 66"/>
      <path d="M60 58 C78 54 88 40 88 22 C68 22 60 36 60 54"/>
      <path d="M60 44 C46 40 40 30 40 18 C54 18 60 28 60 42"/></g>`;
  if (kind === "peach")
    return `<g stroke="${color}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="58" cy="70" r="34"/>
      <path d="M58 44 C58 30 66 20 82 18 C82 32 74 42 58 44"/>
      <path d="M58 70 C58 58 62 50 70 44" stroke-width="2.5"/></g>`;
  if (kind === "elder")
    return `<g stroke="${color}" stroke-width="3" fill="none" stroke-linecap="round">
      <path d="M60 100 V40"/><path d="M60 52 C40 44 34 30 36 18"/><path d="M60 60 C80 52 86 38 84 26"/>
      <circle cx="36" cy="16" r="6" fill="${color}"/><circle cx="84" cy="24" r="6" fill="${color}"/>
      <circle cx="60" cy="34" r="6" fill="${color}"/><circle cx="48" cy="26" r="5" fill="${color}"/><circle cx="72" cy="30" r="5" fill="${color}"/></g>`;
  return `<g stroke="${color}" stroke-width="4" fill="none" stroke-linecap="round">
      <path d="M46 102 C44 70 50 40 58 20"/><path d="M74 102 C76 72 70 44 62 22"/>
      <path d="M58 24 C40 18 30 26 24 36 C40 40 52 36 58 28"/>
      <path d="M62 26 C80 20 90 28 96 38 C80 42 68 38 62 30"/></g>`;
};

const html = (f) => `<!doctype html><html><head><meta charset="utf-8">
<style>
@import url('https://fonts.googleapis.com/css2?family=Calistoga&family=Inter:wght@400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:2048px;height:1138px;overflow:hidden}
.wrap{position:relative;width:2048px;height:1138px;background:#f4ead8;
  font-family:'Inter',sans-serif;color:#2a211c}
.band{position:absolute;left:0;width:100%;height:150px;background:${f.accent}}
.band.top{top:0}.band.bot{bottom:0}
.bandline{position:absolute;left:0;width:100%;height:5px;background:${f.accentDeep}}
.caps{font-family:'Inter';font-weight:600;letter-spacing:.42em;font-size:26px;color:#f4ead8}
.center{position:absolute;inset:150px 0;display:flex;flex-direction:column;
  align-items:center;justify-content:center;text-align:center}
.mark{font-family:'Calistoga';font-size:230px;line-height:.9;letter-spacing:-.01em;color:#2a211c}
.flav{font-family:'Calistoga';font-size:104px;line-height:.98;color:${f.name};margin-top:22px;
  text-shadow:0 1px 0 rgba(255,255,255,.35)}
.sub{font-weight:700;letter-spacing:.32em;font-size:24px;color:#3a322c;margin-top:34px}
.vol{font-weight:600;letter-spacing:.2em;font-size:24px;color:#2a211c}
.rule{width:150px;height:2px;background:${f.accent};margin:26px 0}
.side{position:absolute;top:50%;transform:translateY(-50%);text-align:center;color:${f.accent};opacity:.9}
.side .m{font-family:'Calistoga';font-size:70px;color:#2a211c}
.side .t{font-weight:600;letter-spacing:.3em;font-size:18px;color:${f.accent};margin-top:8px}
.tagtop{position:absolute;top:52px;width:100%;text-align:center}
.tagbot{position:absolute;bottom:52px;width:100%;text-align:center}
</style></head><body>
<div class="wrap">
  <div class="band top"></div><div class="bandline" style="top:150px"></div>
  <div class="band bot"></div><div class="bandline" style="bottom:150px"></div>
  <div class="tagtop caps">SPARKLING&nbsp;&nbsp;BOTANICALS</div>
  <div class="tagbot caps">NATURALLY&nbsp;LIGHT&nbsp;&nbsp;·&nbsp;&nbsp;40&nbsp;CALORIES&nbsp;&nbsp;·&nbsp;&nbsp;330ML&nbsp;e</div>

  <div class="center">
    <svg width="120" height="120" viewBox="0 0 120 120">${sprigSVG(f.sprig, f.accent)}</svg>
    <div class="rule"></div>
    <div class="mark">SOLA</div>
    <div class="flav">${f.name1}<br>${f.name2}</div>
    <div class="sub">REAL FRUIT · STEEPED HERBS · SPRING WATER</div>
  </div>

  <div class="side" style="left:150px"><div class="m">SOLA</div><div class="t">EST. 2022</div></div>
  <div class="side" style="right:150px"><div class="m">SOLA</div><div class="t">SPARKLING</div></div>
</div></body></html>`;

for (const f of flavors) {
  fs.writeFileSync(`${OUT}/label_${f.key}.html`, html(f));
  console.log("wrote", f.key);
}
console.log("DONE");
