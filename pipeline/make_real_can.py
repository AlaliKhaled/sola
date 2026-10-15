import bpy, bmesh, math, sys, os

# ---------- args ----------
argv = sys.argv[sys.argv.index("--") + 1:]
LABEL = argv[0]            # path to label png
OUT   = argv[1]            # output glb
RENDER = argv[2] if len(argv) > 2 else ""   # optional preview png

N   = 96                   # radial segments (smooth)
R   = 0.30                 # body radius
H   = 1.05                 # body (label) height  -> circ/H = 1.885/1.05 = 1.8 (matches label)
TOP = H / 2.0
BOT = -H / 2.0

# ---------- clean scene ----------
bpy.ops.wm.read_factory_settings(use_empty=True)

def cis(radius, z):
    return [(radius*math.cos(2*math.pi*i/N), radius*math.sin(2*math.pi*i/N), z) for i in range(N)]

# ================= BODY (label) =================
bm = bmesh.new()
bot = [bm.verts.new(v) for v in cis(R, BOT)]
top = [bm.verts.new(v) for v in cis(R, TOP)]
bm.verts.ensure_lookup_table()
uv = bm.loops.layers.uv.new("UVMap")
for i in range(N):
    j = (i + 1) % N
    f = bm.faces.new((bot[i], bot[j], top[j], top[i]))
    # offset -0.25 so the front logo (image U .5) faces -Y (camera/front); seam lands at back.
    # left/right label edges are identical (bands + cream) so the wrap is seamless.
    u0, u1 = i / N - 0.25, (i + 1) / N - 0.25
    f.loops[0][uv].uv = (u0, 0.0)
    f.loops[1][uv].uv = (u1, 0.0)
    f.loops[2][uv].uv = (u1, 1.0)
    f.loops[3][uv].uv = (u0, 1.0)
me = bpy.data.meshes.new("Body")
bm.to_mesh(me); bm.free()
body = bpy.data.objects.new("Can_Body", me)
bpy.context.collection.objects.link(body)

# label material
mat = bpy.data.materials.new("Label"); mat.use_nodes = True
nt = mat.node_tree; nt.nodes.clear()
out = nt.nodes.new("ShaderNodeOutputMaterial")
bsdf = nt.nodes.new("ShaderNodeBsdfPrincipled")
tex = nt.nodes.new("ShaderNodeTexImage")
img = bpy.data.images.load(LABEL); tex.image = img
bsdf.inputs["Metallic"].default_value = 0.10
bsdf.inputs["Roughness"].default_value = 0.42
nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
nt.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])
body.data.materials.append(mat)

# ================= METAL (base + neck + lid + tab) =================
bm = bmesh.new()
def ring(radius, z):
    return [bm.verts.new((radius*math.cos(2*math.pi*i/N),
                          radius*math.sin(2*math.pi*i/N), z)) for i in range(N)]
def bridge(a, b):
    for i in range(N):
        j = (i + 1) % N
        bm.faces.new((a[i], a[j], b[j], b[i]))

# --- base (concave bottom) ---
b_edge = ring(R, BOT)                 # meets body bottom
b_foot = ring(R*0.90, BOT - 0.05)     # foot rim
b_in   = ring(R*0.55, BOT + 0.02)     # concave inward+up
bridge(b_edge, b_foot)
bridge(b_foot, b_in)
cbot = bm.verts.new((0, 0, BOT + 0.05))
for i in range(N):
    j = (i + 1) % N
    bm.faces.new((b_in[i], b_in[j], cbot))

# --- neck taper + lid ---
n0 = ring(R, TOP)                     # meets body top
n1 = ring(R*0.97, TOP + 0.05)         # shoulder
n2 = ring(R*0.74, TOP + 0.17)         # neck in
n3 = ring(R*0.72, TOP + 0.20)         # lip up
n4 = ring(R*0.70, TOP + 0.175)        # recess down (lid seam)
bridge(n0, n1); bridge(n1, n2); bridge(n2, n3); bridge(n3, n4)
lid = ring(R*0.66, TOP + 0.165)
bridge(n4, lid)
clid = bm.verts.new((0, 0, TOP + 0.168))
for i in range(N):
    j = (i + 1) % N
    bm.faces.new((lid[i], lid[j], clid))

me2 = bpy.data.meshes.new("Metal")
bm.to_mesh(me2); bm.free()
metal = bpy.data.objects.new("Can_Metal", me2)
bpy.context.collection.objects.link(metal)

alu = bpy.data.materials.new("Aluminum"); alu.use_nodes = True
pb = alu.node_tree.nodes.get("Principled BSDF")
pb.inputs["Base Color"].default_value = (0.86, 0.87, 0.9, 1)
pb.inputs["Metallic"].default_value = 1.0
pb.inputs["Roughness"].default_value = 0.17
metal.data.materials.append(alu)

# --- pull tab (subtle) ---
bpy.ops.mesh.primitive_torus_add(major_radius=0.10, minor_radius=0.012,
                                 location=(0, 0, TOP + 0.182))
tab = bpy.context.active_object
tab.scale = (1.0, 0.5, 1.0)
tab.data.materials.append(alu)

# ---------- edges: smooth shading + angle-limited bevel ----------
# A tiny bevel on the HARD edges only (foot rim, neck seams, lid lip, pull-tab).
# Round surfaces stay smooth; sharp joints get a crisp highlight-catching chamfer
# instead of a pinched/smeared crease. Modifiers are baked at export.
def finish(o, width, segments=2, angle=34):
    for p in o.data.polygons:
        p.use_smooth = True
    bev = o.modifiers.new("Bevel", 'BEVEL')
    bev.width = width
    bev.segments = segments
    bev.limit_method = 'ANGLE'
    bev.angle_limit = math.radians(angle)
    bev.use_clamp_overlap = True

finish(body, 0.004)
finish(metal, 0.006)
finish(tab, 0.004)

# ================= EXPORT GLB =================
for o in bpy.data.objects:
    o.select_set(True)
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB',
                          use_selection=True, export_image_format='AUTO',
                          export_apply=True, export_yup=True)
print("EXPORTED", OUT, os.path.getsize(OUT))

# ================= OPTIONAL PREVIEW RENDER =================
if RENDER:
    scn = bpy.context.scene
    scn.render.engine = 'BLENDER_EEVEE'
    scn.view_settings.view_transform = 'Standard'
    scn.render.film_transparent = False
    scn.render.resolution_x = 640; scn.render.resolution_y = 920
    # world
    w = bpy.data.worlds.new("W"); scn.world = w; w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = (0.04, 0.03, 0.03, 1)
    w.node_tree.nodes["Background"].inputs[1].default_value = 1.0
    # camera
    cam_d = bpy.data.cameras.new("C"); cam = bpy.data.objects.new("C", cam_d)
    scn.collection.objects.link(cam); scn.camera = cam
    cam.location = (0, -3.6, 0.06); cam.rotation_euler = (math.radians(90), 0, 0)
    cam_d.lens = 52
    # softbox area lights (studio)
    def area(loc, rot, size, power, color=(1,0.96,0.9)):
        d = bpy.data.lights.new("A", 'AREA'); d.shape='RECTANGLE'; d.size=size; d.size_y=size*2.2
        d.energy=power; d.color=color
        o = bpy.data.objects.new("A", d); o.location=loc; o.rotation_euler=rot
        scn.collection.objects.link(o)
    area((-2.2, -1.6, 0.4), (math.radians(80), 0, math.radians(-54)), 2.2, 480)
    area(( 2.4, -1.2, 0.5), (math.radians(80), 0, math.radians(62)), 2.0, 300, (1,0.85,0.7))
    area(( 0.0, 2.6, 1.2), (math.radians(-70), 0, 0), 2.5, 380, (0.8,0.85,1))
    scn.render.filepath = RENDER
    bpy.ops.render.render(write_still=True)
    print("RENDERED", RENDER)
