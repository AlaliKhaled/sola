# SOLA can pipeline (automated, no Blender UI)

Regenerates the photoreal cans in `public/models/`. Two steps:

### 1. Labels (HTML → PNG wrap textures)

```bash
node pipeline/make_labels.mjs                 # writes label_*.html to a tmp dir
# then rasterize each at 2048x1138 via headless Chrome:
google-chrome-stable --headless=new --window-size=2048,1138 \
  --default-background-color=00000000 \
  --screenshot=pipeline/labels/label_blood.png "file://.../label_blood.html"
```

Pre-rendered labels are committed in `pipeline/labels/`.

### 2. Can model (Blender bpy → GLB)

Builds a sleek 330ml can: cylinder body with a precise cylindrical UV (seam at back,
logo front), aluminum neck/base/pull-tab, label as base colour (metallic 0.1 /
roughness 0.42). Stands ~1.27 units tall, origin at centre, base at y ≈ -0.575.

```bash
blender --background --python pipeline/make_real_can.py -- \
  pipeline/labels/label_blood.png public/models/can_blood.glb [preview.png]
```

Run once per flavour (blood / elder / rhubarb). `sola_can.glb` (hero) = a copy of
`can_blood.glb`. Blender 5.2 LTS; EEVEE preview uses `view_transform='Standard'`.
