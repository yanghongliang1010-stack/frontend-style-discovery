import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

export const PALETTES = {
  warm: {
    floor: "#f4c7aa",
    base: "#ff713d",
    stone: "#fff0d8",
    metal: "#d8b88c",
    copper: "#ef8245",
    glass: "#477fea",
    books: ["#ff713d", "#ffd56d", "#ef477d", "#477fea"],
    column: "#ef477d",
    fin: "#ffc4a8",
    light: "#fff3df",
  },
  dark: {
    floor: "#1d2421",
    base: "#4b514c",
    stone: "#bfc0b4",
    metal: "#b8c1ba",
    copper: "#ed9858",
    glass: "#63d8c0",
    books: ["#dde2d2", "#63d8c0", "#b2bbaa", "#edf0e4"],
    column: "#eeeee4",
    fin: "#65756d",
    light: "#e6fff4",
  },
};

export function createPavilion(
  container,
  {
    theme = "warm",
    interactive = true,
    onSelect = () => {},
    onProject = () => {},
    pixelRatio,
    reducedMotion = false,
  } = {},
) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(
    pixelRatio ?? Math.min(window.devicePixelRatio || 1, 1.5),
  );
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.setAttribute("aria-label", "可旋转的三维知识展亭");
  renderer.domElement.style.touchAction = "none";
  container.append(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
  camera.position.set(8.6, 7.6, 12.8);
  const target = new THREE.Vector3(0, 1.3, 0);
  camera.lookAt(target);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.9;
  room.dispose();
  pmrem.dispose();
  const ambient = new THREE.HemisphereLight(0xfff6ea, 0x94745e, 0.85);
  scene.add(ambient);
  const key = new THREE.DirectionalLight(0xfff3df, 2.4);
  key.position.set(-4, 9, 6);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -9;
  key.shadow.camera.right = 9;
  key.shadow.camera.top = 8;
  key.shadow.camera.bottom = -8;
  key.shadow.normalBias = 0.025;
  key.shadow.bias = -0.0003;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xc6e6ff, 1.1);
  rim.position.set(5, 5, -6);
  scene.add(rim);
  const materialRoles = [];
  function material(role, options = {}) {
    const m = new THREE.MeshPhysicalMaterial({
      color: PALETTES[theme][role] || "#fff",
      roughness: 0.29,
      metalness: 0,
      ...options,
    });
    materialRoles.push({ material: m, role });
    return m;
  }
  const stone = material("stone", { roughness: 0.54 });
  const base = material("base", { clearcoat: 0.8, roughness: 0.24 });
  const metal = material("metal", { metalness: 0.9, roughness: 0.24 });
  const copper = material("copper", { metalness: 0.82, roughness: 0.2 });
  const column = material("column", { clearcoat: 0.9, roughness: 0.22 });
  const glass = material("glass", {
    transmission: 0.46,
    thickness: 0.8,
    roughness: 0.09,
    ior: 1.48,
    metalness: 0.08,
    clearcoat: 1,
  });
  const fins = material("fin", {
    transparent: true,
    opacity: 0.29,
    roughness: 0.2,
    metalness: 0.22,
    depthWrite: false,
  });
  const floorMaterial = new THREE.ShadowMaterial({
    color: 0x1d1813,
    opacity: 0.22,
  });
  const white = material("stone", { roughness: 0.32, clearcoat: 0.5 });
  const bookMaterials = PALETTES[theme].books.map((color, i) => {
    const m = new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.3,
      clearcoat: 0.6,
    });
    materialRoles.push({ material: m, role: "book", index: i });
    return m;
  });
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(150, 150),
    floorMaterial,
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.08;
  floor.receiveShadow = true;
  scene.add(floor);
  const pavilion = new THREE.Group();
  scene.add(pavilion);
  const zones = {
    knowledge: new THREE.Group(),
    agents: new THREE.Group(),
    workflows: new THREE.Group(),
  };
  Object.values(zones).forEach((group) => pavilion.add(group));
  function add(geometry, mat, x, y, z, parent = pavilion) {
    const mesh = new THREE.Mesh(geometry, mat);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function box(w, h, d, x, y, z, mat, parent, radius = 0.08) {
    return add(
      new RoundedBoxGeometry(w, h, d, 3, Math.min(radius, w / 3, h / 3, d / 3)),
      mat,
      x,
      y,
      z,
      parent,
    );
  }
  function cylinder(radius, height, x, y, z, mat, parent) {
    return add(
      new THREE.CylinderGeometry(radius, radius, height, 48),
      mat,
      x,
      y,
      z,
      parent,
    );
  }
  function platform(w, h, d, y, mat) {
    const r = 0.65,
      x = -w / 2,
      z = -d / 2;
    const shape = new THREE.Shape();
    shape.moveTo(x + r, z);
    shape.lineTo(x + w - r, z);
    shape.quadraticCurveTo(x + w, z, x + w, z + r);
    shape.lineTo(x + w, z + d - r);
    shape.quadraticCurveTo(x + w, z + d, x + w - r, z + d);
    shape.lineTo(x + r, z + d);
    shape.quadraticCurveTo(x, z + d, x, z + d - r);
    shape.lineTo(x, z + r);
    shape.quadraticCurveTo(x, z, x + r, z);
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: h - 0.06,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 3,
      curveSegments: 12,
    });
    geometry.center();
    geometry.rotateX(-Math.PI / 2);
    return add(geometry, mat, 0, y, 0);
  }
  platform(10.4, 0.16, 6.1, 0.14, copper);
  platform(10.3, 0.55, 6, 0.47, base);
  platform(10.35, 0.17, 6.04, 0.82, stone);
  for (let i = 0; i < 5; i++)
    box(
      2.1,
      0.12,
      0.49,
      0,
      0.05 + i * 0.16,
      3.83 - i * 0.34,
      i % 2 ? copper : white,
      pavilion,
      0.035,
    );
  for (let i = 0; i <= 32; i++) {
    const angle = (i / 32) * Math.PI;
    const x = Math.cos(angle) * 4.75;
    const z = -Math.sin(angle) * 2.45;
    const fin = box(0.35, 2.2, 0.045, x, 1.99, z, fins, pavilion, 0.015);
    fin.rotation.y = angle + Math.PI / 2;
    fin.castShadow = false;
    if (i % 3 === 0) {
      cylinder(0.038, 2.25, x, 2.015, z, copper);
      cylinder(0.069, 0.065, x, 3.18, z, metal);
    }
  }
  const shelf = zones.knowledge;
  shelf.position.set(-3.08, 0.94, -0.15);
  box(2.65, 0.16, 1.9, 0, 0.02, 0.12, copper, shelf, 0.12);
  box(2.54, 0.15, 1.84, 0, 0.15, 0.12, white, shelf, 0.12);
  for (const x of [-1.13, 1.13])
    box(0.09, 2.6, 0.8, x, 1.42, -0.32, metal, shelf);
  for (const y of [0.38, 1.38, 2.38])
    box(2.32, 0.1, 0.8, 0, y, -0.32, metal, shelf);
  for (let row = 0; row < 2; row++)
    for (let i = 0; i < 8; i++) {
      const height = 0.64 + Math.sin(i * 2.6 + row) * 0.08;
      const book = box(
        0.22,
        height,
        0.5,
        -0.95 + i * 0.266,
        0.44 + row + height / 2,
        -0.29,
        bookMaterials[(i + row) % 4],
        shelf,
        0.025,
      );
      book.rotation.z = i === 2 && row === 1 ? -0.09 : 0;
    }
  box(1.45, 0.095, 0.77, 0, 0.68, 0.85, white, shelf, 0.055);
  for (const x of [-0.52, 0.52])
    cylinder(0.042, 0.53, x, 0.39, 0.89, metal, shelf);
  for (let i = 0; i < 3; i++)
    box(
      0.63,
      0.07,
      0.4,
      0.11 * i,
      0.77 + 0.075 * i,
      0.86,
      bookMaterials[i],
      shelf,
      0.024,
    );
  const core = zones.agents;
  core.position.set(0, 0.95, 0.1);
  for (let i = 0; i < 3; i++) {
    cylinder(
      1.59 - i * 0.14,
      0.13,
      0,
      i * 0.14,
      0,
      i % 2 ? copper : metal,
      core,
    );
    const ring = add(
      new THREE.TorusGeometry(1.59 - i * 0.14, 0.026, 8, 80),
      copper,
      0,
      0.07 + i * 0.14,
      0,
      core,
    );
    ring.rotation.x = Math.PI / 2;
  }
  const halo = add(
    new THREE.TorusGeometry(1.2, 0.078, 12, 96),
    copper,
    0,
    1.65,
    0,
    core,
  );
  halo.rotation.y = -0.2;
  const haloInner = add(
    new THREE.TorusGeometry(1.085, 0.018, 8, 96),
    metal,
    0,
    1.65,
    0,
    core,
  );
  haloInner.rotation.y = -0.2;
  for (const x of [-1.1, 1.1]) {
    cylinder(0.046, 0.8, x, 0.59, 0, copper, core);
    add(new THREE.SphereGeometry(0.11, 16, 12), copper, x, 1.05, 0, core);
  }
  const crystal = add(
    new THREE.OctahedronGeometry(0.82, 0),
    glass,
    0,
    1.63,
    0,
    core,
  );
  crystal.scale.set(0.94, 1.12, 0.94);
  crystal.castShadow = false;
  const edge = new THREE.LineSegments(
    new THREE.EdgesGeometry(crystal.geometry),
    new THREE.LineBasicMaterial({
      color: "#bedbff",
      transparent: true,
      opacity: 0.6,
    }),
  );
  crystal.add(edge);
  const flow = zones.workflows;
  flow.position.set(3.16, 0.94, 0.15);
  box(2.58, 0.15, 2.14, 0, 0.03, 0, copper, flow, 0.18);
  box(2.48, 0.14, 2.05, 0, 0.17, 0, white, flow, 0.17);
  for (let i = 0; i < 3; i++) {
    const x = -0.8 + i * 0.8;
    const h = 1.5 + (2 - i) * 0.23;
    const z = -0.42 + i * 0.32;
    cylinder(0.31, h, x, 0.29 + h / 2, z, column, flow);
    cylinder(0.325, 0.1, x, 0.32 + h * 0.58, z, copper, flow);
    const dome = add(
      new THREE.SphereGeometry(0.312, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2),
      white,
      x,
      0.29 + h,
      z,
      flow,
    );
    dome.scale.y = 0.24;
    cylinder(0.313, 0.045, x, 0.32, z, metal, flow);
  }
  const display = box(0.71, 0.46, 0.045, -0.45, 0.64, 0.82, glass, flow, 0.02);
  display.rotation.x = -0.12;
  for (const [name, group] of Object.entries(zones))
    group.traverse((object) => {
      if (object.isMesh) object.userData.zone = name;
    });
  const controls = interactive
    ? new OrbitControls(camera, renderer.domElement)
    : null;
  if (controls) {
    controls.target.copy(target);
    controls.enablePan = false;
    controls.enableDamping = !reducedMotion;
    controls.dampingFactor = 0.09;
    controls.minDistance = 12;
    controls.maxDistance = 25;
    controls.minPolarAngle = 0.2;
    controls.maxPolarAngle = 1.32;
    controls.update();
  }
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let pointerDown = null;
  let disposed = false;
  let raf = 0;
  const anchors = {
    knowledge: new THREE.Vector3(-3.05, 3.75, -0.25),
    agents: new THREE.Vector3(0, 4.25, 0.1),
    workflows: new THREE.Vector3(3.2, 3.75, 0.1),
  };
  function projectAnchors() {
    const rect = renderer.domElement.getBoundingClientRect();
    const positions = {};
    for (const [name, value] of Object.entries(anchors)) {
      const p = value.clone().project(camera);
      positions[name] = {
        x: ((p.x + 1) / 2) * rect.width,
        y: ((1 - p.y) / 2) * rect.height,
      };
    }
    onProject(positions);
  }
  function render() {
    renderer.render(scene, camera);
    projectAnchors();
  }
  function blendTheme(amount) {
    const from = PALETTES.dark;
    const to = PALETTES.warm;
    for (const item of materialRoles) {
      const a = item.role === "book" ? from.books[item.index] : from[item.role];
      const b = item.role === "book" ? to.books[item.index] : to[item.role];
      item.material.color.lerpColors(
        new THREE.Color(a),
        new THREE.Color(b),
        amount,
      );
    }
    key.color.set(amount > 0.5 ? to.light : from.light);
    ambient.intensity = 0.65 + amount * 0.2;
    renderer.toneMappingExposure = 0.9 + amount * 0.1;
    edge.material.color.set(amount > 0.5 ? "#b7d5ff" : "#bdffe5");
  }
  function setTheme(value) {
    theme = value === "dark" ? "dark" : "warm";
    blendTheme(theme === "warm" ? 1 : 0);
    render();
  }
  function resize() {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    render();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(container);
  function down(event) {
    pointerDown = { x: event.clientX, y: event.clientY };
  }
  function up(event) {
    if (
      !pointerDown ||
      Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y) >
        6
    )
      return;
    pointerDown = null;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      (-(event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    const selected = raycaster
      .intersectObjects(pavilion.children, true)
      .find((hit) => hit.object.userData.zone);
    if (selected) onSelect(selected.object.userData.zone);
  }
  if (interactive) {
    renderer.domElement.addEventListener("pointerdown", down);
    renderer.domElement.addEventListener("pointerup", up);
    controls.addEventListener("change", render);
    if (!reducedMotion) {
      const tick = () => {
        if (disposed) return;
        controls.update();
        raf = requestAnimationFrame(tick);
      };
      tick();
    }
  }
  function reset() {
    camera.position.set(8.6, 7.6, 12.8);
    camera.lookAt(target);
    if (controls) {
      controls.target.copy(target);
      controls.update();
    }
    render();
  }
  function topView() {
    camera.position.set(0.1, 17, 7);
    camera.lookAt(target);
    if (controls) {
      controls.target.copy(target);
      controls.update();
    }
    render();
  }
  function renderAt(seconds, shot = "wide", warmth = theme === "warm" ? 1 : 0) {
    blendTheme(warmth);
    const angle = 0.25 + Math.sin(seconds * 0.11) * 0.21;
    const radius = shot === "detail" ? 8.1 : 18.5;
    camera.position.set(
      Math.sin(angle) * radius,
      shot === "detail" ? 4.5 : 7.8,
      Math.cos(angle) * radius,
    );
    camera.lookAt(0, shot === "detail" ? 2.3 : 1.1, 0);
    crystal.rotation.y = seconds * 0.26;
    crystal.position.y = 1.63 + Math.sin(seconds * 1.1) * 0.07;
    render();
  }
  setTheme(theme);
  resize();
  return {
    setTheme,
    reset,
    topView,
    renderAt,
    getState: () => ({
      theme,
      camera: camera.position.toArray(),
      glass: glass.color.getHexString(),
      renderCalls: renderer.info.render.calls,
    }),
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      controls?.dispose();
      renderer.domElement.removeEventListener("pointerdown", down);
      renderer.domElement.removeEventListener("pointerup", up);
      scene.traverse((object) => {
        object.geometry?.dispose();
      });
      materialRoles.forEach((item) => item.material.dispose());
      floorMaterial.dispose();
      edge.material.dispose();
      environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
