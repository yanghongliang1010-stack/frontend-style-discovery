import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// Original procedural sculpture; no imported models, textures or creator footage.
export function createSculpture(
  host,
  {
    theme = "dark",
    interactive = true,
    reducedMotion = false,
    pixelRatio = 1,
  } = {},
) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, pixelRatio));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  host.append(renderer.domElement);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const environment = pmrem.fromScene(room);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();
  const light = new THREE.DirectionalLight(0xffeed4, 4);
  light.position.set(-4, 7, 5);
  scene.add(light);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x6e2947, 3));
  const sculpture = new THREE.Group();
  scene.add(sculpture);
  const coral = new THREE.MeshStandardMaterial({
    color: 0xff663e,
    roughness: 0.28,
    metalness: 0.18,
    side: THREE.DoubleSide,
  });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x123ded,
    roughness: 0.08,
    metalness: 0.12,
    transmission: 0.65,
    thickness: 1.4,
    ior: 1.46,
  });
  const stone = new THREE.MeshStandardMaterial({
    color: 0xffe4ba,
    roughness: 0.85,
  });
  const positions = [],
    indices = [];
  const segments = 96;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments,
      angle = t * Math.PI * 2.1;
    const center = new THREE.Vector3(
      Math.sin(angle) * 1.45,
      t * 3.3 - 0.7,
      Math.cos(angle) * 0.7,
    );
    const width = new THREE.Vector3(
      Math.cos(angle + 0.3),
      0.2 * Math.sin(angle),
      Math.sin(angle + 0.3),
    )
      .normalize()
      .multiplyScalar(0.6 + 0.3 * Math.sin(t * Math.PI));
    positions.push(
      ...center.clone().sub(width).toArray(),
      ...center.clone().add(width).toArray(),
    );
    if (i < segments) {
      const a = i * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const ribbonGeometry = new THREE.BufferGeometry();
  ribbonGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  ribbonGeometry.setIndex(indices);
  ribbonGeometry.computeVertexNormals();
  sculpture.add(new THREE.Mesh(ribbonGeometry, coral));
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.83, 40, 24), glass);
  sphere.position.set(0.5, 0.1, 0.6);
  sculpture.add(sphere);
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.9, 0.14, 16, 48),
    coral,
  );
  ring.position.set(-1.45, -0.55, -0.15);
  ring.rotation.x = -0.5;
  sculpture.add(ring);
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(3.9, 0.28, 2.5), stone);
  plinth.position.y = -0.99;
  sculpture.add(plinth);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enabled = interactive;
  controls.enablePan = false;
  controls.enableDamping = false;
  controls.target.set(0, 0.65, 0);
  controls.minDistance = 5;
  controls.maxDistance = 16;
  const draw = () => renderer.render(scene, camera);
  controls.addEventListener("change", draw);
  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    renderer.setSize(width, height);
    camera.aspect = width / Math.max(1, height);
    camera.updateProjectionMatrix();
    draw();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  function setTheme(value) {
    theme = value;
    glass.color.set(theme === "warm" ? 0x164aff : 0x7954ff);
    stone.color.set(theme === "warm" ? 0xffedcf : 0x392c47);
    draw();
  }
  function renderAt(seconds, shot = "wide", warmth = 0) {
    setTheme(warmth > 0.5 ? "warm" : "dark");
    const angle = seconds * 0.11;
    const distance = shot === "detail" ? 6.2 : 8.8;
    camera.position.set(
      Math.sin(angle) * distance,
      3.1,
      Math.cos(angle) * distance,
    );
    camera.lookAt(0, 0.8, 0);
    draw();
  }
  camera.position.set(5, 3.4, 7);
  controls.update();
  setTheme(theme);
  resize();
  return {
    setTheme,
    renderAt,
    dispose() {
      observer.disconnect();
      controls.dispose();
      scene.traverse((o) => {
        o.geometry?.dispose();
        o.material?.dispose();
      });
      environment.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
