import bpy, bmesh, math, sys, os

argv = sys.argv[sys.argv.index("--") + 1:]
LABEL = argv[0]
OUT = argv[1]
RENDER = argv[2] if len(argv) > 2 else ""

N = 96
bpy.ops.wm.read_factory_settings(use_empty=True)

def ring(bm, r, y):
    # height on Blender Z (up); export_yup converts Z-up -> glTF Y-up (upright in R3F)
    return [bm.verts.new((r*math.cos(2*math.pi*i/N), r*math.sin(2*math.pi*i/N), y))
            for i in range(N)]

def revolve(profile, name, cap_bottom=True, cap_top=False, uv=False, uoff=-0.25):
    """profile: list of (r,y) bottom->top (r>0). Returns object `name`."""
    bm = bmesh.new()
    rings = [ring(bm, r, y) for (r, y) in profile]
    uvlay = bm.loops.layers.uv.new("UVMap") if uv else None
    y0, y1 = profile[0][1], profile[-1][1]
    for k in range(len(rings) - 1):
        a, b = rings[k], rings[k+1]
        for i in range(N):
            j = (i + 1) % N
            f = bm.faces.new((a[i], a[j], b[j], b[i]))
            if uvlay:
                v0 = (profile[k][1] - y0) / (y1 - y0)
                v1 = (profile[k+1][1] - y0) / (y1 - y0)
                u0, u1 = i / N + uoff, (i + 1) / N + uoff
                f.loops[0][uvlay].uv = (u0, v0)
                f.loops[1][uvlay].uv = (u1, v0)
                f.loops[2][uvlay].uv = (u1, v1)
                f.loops[3][uvlay].uv = (u0, v1)
    if cap_bottom:
        c = bm.verts.new((0, 0, profile[0][1]))
        for i in range(N):
            j = (i + 1) % N
            bm.faces.new((rings[0][i], rings[0][j], c))
    if cap_top:
        c = bm.verts.new((0, 0, profile[-1][1]))
        for i in range(N):
            j = (i + 1) % N
            bm.faces.new((rings[-1][j], rings[-1][i], c))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(ob)
    for p in me.polygons:
        p.use_smooth = True
    return ob

# ---------- glass body ----------
glass_profile = [
    (0.26, 0.00), (0.30, 0.05), (0.305, 0.15),
    (0.305, 1.05), (0.295, 1.12), (0.24, 1.26),
    (0.165, 1.40), (0.135, 1.50), (0.133, 1.54),
    (0.133, 1.74), (0.150, 1.78), (0.146, 1.81),
]
glass = revolve(glass_profile, "Glass", cap_bottom=True, cap_top=False)
gm = bpy.data.materials.new("GlassMat"); gm.use_nodes = True
gp = gm.node_tree.nodes.get("Principled BSDF")
gp.inputs["Base Color"].default_value = (0.9, 0.93, 0.95, 1)
gp.inputs["Roughness"].default_value = 0.05
gp.inputs["Transmission Weight"].default_value = 1.0
gp.inputs["IOR"].default_value = 1.45
glass.data.materials.append(gm)

# ---------- liquid ----------
liquid_profile = [
    (0.0, 0.04), (0.285, 0.05), (0.288, 0.15),
    (0.288, 1.05), (0.278, 1.12), (0.235, 1.22),
]
liquid = revolve(liquid_profile, "Liquid", cap_bottom=True, cap_top=True)
lm = bpy.data.materials.new("LiquidMat"); lm.use_nodes = True
lp = lm.node_tree.nodes.get("Principled BSDF")
lp.inputs["Base Color"].default_value = (0.72, 0.23, 0.06, 1)
lp.inputs["Roughness"].default_value = 0.12
lp.inputs["Transmission Weight"].default_value = 0.6
liquid.data.materials.append(lm)

# ---------- cap (metal) ----------
cap_profile = [
    (0.150, 1.72), (0.158, 1.75), (0.158, 1.90), (0.150, 1.92),
]
cap = revolve(cap_profile, "Cap", cap_bottom=False, cap_top=True)
cm = bpy.data.materials.new("CapMat"); cm.use_nodes = True
cp = cm.node_tree.nodes.get("Principled BSDF")
cp.inputs["Base Color"].default_value = (0.84, 0.86, 0.9, 1)
cp.inputs["Metallic"].default_value = 1.0
cp.inputs["Roughness"].default_value = 0.2
cap.data.materials.append(cm)

# ---------- label band (wrap texture) ----------
# body radius ~0.305; band just outside; height tuned to label aspect (2048x760 -> 2.695:1)
R = 0.308
circ = 2 * math.pi * R
h = circ / (2048 / 760.0)   # ~0.727
y_lo = 0.30
label_profile = [(R, y_lo), (R, y_lo + h)]
label = revolve(label_profile, "Label", cap_bottom=False, cap_top=False, uv=True)
lbm = bpy.data.materials.new("LabelMat"); lbm.use_nodes = True
nt = lbm.node_tree; nt.nodes.clear()
out = nt.nodes.new("ShaderNodeOutputMaterial")
bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
tex = nt.nodes.new("ShaderNodeTexImage"); tex.image = bpy.data.images.load(LABEL)
bsdf.inputs["Roughness"].default_value = 0.5
nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
label.data.materials.append(lbm)

# ---------- edges: angle-limited bevel on the hard joints ----------
# Softens the base rim, shoulder and cap lip so they read as real moulded glass
# edges (crisp highlights) rather than pinched creases. Baked at export.
def bevel(o, width, segments=2, angle=28):
    b = o.modifiers.new("Bevel", 'BEVEL')
    b.width = width
    b.segments = segments
    b.limit_method = 'ANGLE'
    b.angle_limit = math.radians(angle)
    b.use_clamp_overlap = True

bevel(glass, 0.004)
bevel(cap, 0.003)

# ---------- export ----------
for o in bpy.data.objects:
    o.select_set(True)
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB',
                          use_selection=True, export_image_format='AUTO',
                          export_apply=True, export_yup=True)
print("EXPORTED", OUT, os.path.getsize(OUT))

# ---------- preview ----------
if RENDER:
    scn = bpy.context.scene
    scn.render.engine = 'BLENDER_EEVEE'
    scn.view_settings.view_transform = 'Standard'
    scn.render.resolution_x = 520; scn.render.resolution_y = 920
    w = bpy.data.worlds.new("W"); scn.world = w; w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = (0.05, 0.04, 0.04, 1)
    cam_d = bpy.data.cameras.new("C"); cam = bpy.data.objects.new("C", cam_d)
    scn.collection.objects.link(cam); scn.camera = cam
    cam.location = (0, -4.2, 0.9); cam.rotation_euler = (math.radians(90), 0, 0)
    cam_d.lens = 58
    def area(loc, rot, size, power, color=(1, 0.96, 0.9)):
        d = bpy.data.lights.new("A", 'AREA'); d.shape = 'RECTANGLE'; d.size = size; d.size_y = size*2.4
        d.energy = power; d.color = color
        o = bpy.data.objects.new("A", d); o.location = loc; o.rotation_euler = rot
        scn.collection.objects.link(o)
    area((-2.4, -1.8, 1.0), (math.radians(80), 0, math.radians(-52)), 2.4, 900)
    area((2.6, -1.4, 1.1), (math.radians(80), 0, math.radians(60)), 2.2, 500, (1, 0.85, 0.7))
    area((0, 2.6, 1.6), (math.radians(-68), 0, 0), 2.6, 600, (0.8, 0.85, 1))
    scn.render.filepath = RENDER
    bpy.ops.render.render(write_still=True)
    print("RENDERED", RENDER)
