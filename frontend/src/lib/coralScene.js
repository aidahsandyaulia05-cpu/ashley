import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export const SPECIES_3D = [
  { key: "acropora", color: "#F4A06B", pos: [-2.1, 0, 0.2], kind: "branch", children: 3, len: 0.75, rad: 0.09, spread: 0.55 },
  { key: "pocillopora", color: "#FF7E95", pos: [0.3, 0, 0.9], kind: "branch", children: 2, len: 0.45, rad: 0.11, spread: 0.7 },
  { key: "porites", color: "#E9C46A", pos: [2.2, 0, -0.2], kind: "mound" },
];
export const STAGE_DEPTH = [1, 2, 3, 4, 5];
const STAGE_SCALE = [0.45, 0.6, 0.75, 0.9, 1];

const UP = new THREE.Vector3(0, 1, 0);

function rng(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

function growBranch(group, geo, tipGeo, mat, start, dir, len, rad, level, spec, rand) {
  const m = new THREE.Mesh(geo, mat);
  m.position.copy(start);
  m.scale.set(rad, len, rad);
  m.quaternion.setFromUnitVectors(UP, dir);
  m.userData = { level, species: spec.key };
  group.add(m);
  const end = start.clone().add(dir.clone().multiplyScalar(len));
  const kids = level < 5 ? spec.children : 0;
  const tip = new THREE.Mesh(tipGeo, mat);
  tip.position.copy(end);
  tip.scale.setScalar(rad * 0.85);
  tip.userData = { level, tip: true, leaf: kids === 0, species: spec.key };
  group.add(tip);
  for (let i = 0; i < kids; i++) {
    const a = (i / kids) * Math.PI * 2 + rand() * 1.2;
    const d = dir.clone().add(new THREE.Vector3(Math.cos(a) * spec.spread, 0.25 + rand() * 0.3, Math.sin(a) * spec.spread)).normalize();
    growBranch(group, geo, tipGeo, mat, end, d, len * (0.78 + rand() * 0.12), rad * 0.72, level + 1, spec, rand);
  }
}

function buildMound(group, mat, spec) {
  const g = new THREE.IcosahedronGeometry(0.9, 4);
  const p = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = 1 + 0.07 * Math.sin(v.x * 9) * Math.cos(v.z * 8) + 0.05 * Math.sin(v.y * 13);
    v.multiplyScalar(n);
    if (v.y < 0) v.y *= 0.2;
    p.setXYZ(i, v.x, v.y * 0.8, v.z);
  }
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat);
  m.userData = { level: 1, species: spec.key, mound: true };
  group.add(m);
}

function buildNursery(scene) {
  const mat = new THREE.MeshStandardMaterial({ color: "#5b7d8c", metalness: 0.6, roughness: 0.4 });
  const bar = new THREE.CylinderGeometry(0.025, 0.025, 1, 6);
  const add = (a, b) => {
    const m = new THREE.Mesh(bar, mat);
    const d = b.clone().sub(a);
    m.scale.set(1, d.length(), 1);
    m.position.copy(a).add(d.multiplyScalar(0.5));
    m.quaternion.setFromUnitVectors(UP, b.clone().sub(a).normalize());
    scene.add(m);
  };
  const y = -0.05, h = -0.7, X = 3.6, Z = 1.6;
  const c = [[-X, -Z], [X, -Z], [X, Z], [-X, Z]].map(([x, z]) => new THREE.Vector3(x, y, z));
  c.forEach((p, i) => { add(p, c[(i + 1) % 4]); add(p, new THREE.Vector3(p.x, h, p.z)); });
  for (let x = -X + 1.2; x < X; x += 1.2) add(new THREE.Vector3(x, y, -Z), new THREE.Vector3(x, y, Z));
  const sand = new THREE.Mesh(new THREE.CircleGeometry(14, 48), new THREE.MeshStandardMaterial({ color: "#123847", roughness: 1 }));
  sand.rotation.x = -Math.PI / 2;
  sand.position.y = h;
  scene.add(sand);
}

function buildParticles(scene) {
  const n = 380;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { pos[i * 3] = (Math.random() - 0.5) * 16; pos[i * 3 + 1] = Math.random() * 7 - 1; pos[i * 3 + 2] = (Math.random() - 0.5) * 12; }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: "#cfffff", size: 0.03, transparent: true, opacity: 0.6 }));
  scene.add(pts);
  return pts;
}

export function createCoralScene(el, { onHover, onSelect }) {
  const w = el.clientWidth, h = el.clientHeight;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(w, h);
  el.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2("#061026", 0.07);
  const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
  camera.position.set(0, 2.6, 7.5);

  scene.add(new THREE.HemisphereLight("#9fe7ff", "#0b1d3a", 0.9));
  const sun = new THREE.DirectionalLight("#d8f6ff", 1.4);
  sun.position.set(2, 8, 3);
  scene.add(sun);
  const glow = new THREE.PointLight("#ff6b6b", 1.2, 10);
  glow.position.set(-1, 1.5, 2);
  scene.add(glow);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 2.2;
  controls.maxDistance = 11;
  controls.maxPolarAngle = Math.PI * 0.52;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.35;
  controls.target.set(0, 0.8, 0);

  buildNursery(scene);
  const particles = buildParticles(scene);
  const geo = new THREE.CylinderGeometry(0.72, 1, 1, 7);
  geo.translate(0, 0.5, 0);
  const tipGeo = new THREE.SphereGeometry(1, 10, 8);
  const groups = {};
  const mats = {};
  SPECIES_3D.forEach((spec, i) => {
    const group = new THREE.Group();
    group.position.set(...spec.pos);
    const mat = new THREE.MeshStandardMaterial({ color: spec.color, roughness: 0.65, emissive: spec.color, emissiveIntensity: 0.06 });
    mats[spec.key] = mat;
    if (spec.kind === "mound") buildMound(group, mat, spec);
    else {
      const rand = rng(17 + i * 31);
      for (let k = 0; k < (spec.key === "acropora" ? 3 : 4); k++) {
        const a = (k / 3) * Math.PI * 2;
        growBranch(group, geo, tipGeo, mat, new THREE.Vector3(Math.cos(a) * 0.12, 0, Math.sin(a) * 0.12),
          new THREE.Vector3(Math.cos(a) * 0.35, 1, Math.sin(a) * 0.35).normalize(), spec.len, spec.rad, 1, spec, rand);
      }
    }
    group.userData.targetScale = 1;
    groups[spec.key] = group;
    scene.add(group);
  });

  let stage = 4;
  const setStage = (s) => {
    stage = s;
    const depth = STAGE_DEPTH[s];
    Object.values(groups).forEach((g) => {
      g.userData.targetScale = STAGE_SCALE[s];
      g.children.forEach((m) => {
        const { level, tip, leaf, mound } = m.userData;
        if (mound) return;
        m.visible = tip ? level === depth || (leaf && level < depth) : level <= depth;
      });
    });
  };
  setStage(stage);

  const ray = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let hovered = null;
  const focusTarget = new THREE.Vector3(0, 0.8, 0);
  const pick = (e) => {
    const r = renderer.domElement.getBoundingClientRect();
    mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(mouse, camera);
    const hit = ray.intersectObjects(Object.values(groups), true).find((x) => x.object.visible);
    return hit ? hit.object.userData.species : null;
  };
  const onMove = (e) => {
    const sp = pick(e);
    if (sp !== hovered) {
      if (hovered) mats[hovered].emissiveIntensity = 0.06;
      if (sp) mats[sp].emissiveIntensity = 0.45;
      hovered = sp;
      renderer.domElement.style.cursor = sp ? "pointer" : "grab";
    }
    const r = renderer.domElement.getBoundingClientRect();
    onHover(sp, e.clientX - r.left, e.clientY - r.top);
  };
  let downAt = 0;
  const onDown = () => { downAt = performance.now(); };
  const onUp = (e) => {
    if (performance.now() - downAt > 250) return;
    const sp = pick(e);
    if (sp) focus(sp);
    onSelect(sp);
  };
  const focus = (sp) => {
    if (!sp) { focusTarget.set(0, 0.8, 0); return; }
    const g = groups[sp];
    focusTarget.set(g.position.x, 0.9, g.position.z);
    controls.autoRotate = false;
  };
  renderer.domElement.addEventListener("pointermove", onMove);
  renderer.domElement.addEventListener("pointerdown", onDown);
  renderer.domElement.addEventListener("pointerup", onUp);

  let running = true, raf;
  const clock = new THREE.Clock();
  const tick = () => {
    raf = requestAnimationFrame(tick);
    if (!running) return;
    const t = clock.getElapsedTime();
    controls.target.lerp(focusTarget, 0.05);
    Object.values(groups).forEach((g, i) => {
      const s = THREE.MathUtils.lerp(g.scale.x, g.userData.targetScale, 0.06);
      g.scale.setScalar(s);
      g.rotation.z = Math.sin(t * 0.6 + i) * 0.015;
    });
    particles.position.y = (t * 0.05) % 1;
    particles.rotation.y = t * 0.01;
    glow.intensity = 1 + Math.sin(t * 0.8) * 0.25;
    controls.update();
    renderer.render(scene, camera);
  };
  tick();

  const ro = new ResizeObserver(() => {
    const W = el.clientWidth, H = el.clientHeight;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize(W, H);
  });
  ro.observe(el);
  const io = new IntersectionObserver(([en]) => { running = en.isIntersecting; });
  io.observe(el);

  return {
    setStage,
    focus,
    reset: () => { focus(null); controls.autoRotate = true; },
    dispose: () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      controls.dispose();
      scene.traverse((o) => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}

export const webglOK = () => {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
};
