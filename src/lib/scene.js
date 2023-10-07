// place files you want to import through the `$lib` alias in this folder.
import * as THREE from 'three';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import CameraControls from 'camera-controls';
// CameraControls.install({ THREE: THREE });

let camera, scene, renderer, controls;
const planes = {};

export const createScene = (el) => {
    const clock = new THREE.Clock();
    scene = new THREE.Scene();

    const { width, height } = el.getBoundingClientRect();
    // const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const aspectRatio = width / height;
    const worldWidth = 3;
    const worldHeight = worldWidth / aspectRatio;
    camera = new THREE.OrthographicCamera(worldWidth / - 2, worldWidth / 2, worldHeight / 2, worldHeight / - 2, 0.1, 1000);

    camera.position.z = -20;
    camera.lookAt(0, 0, 0);

    // camera-controls
    // const cameraControls = new CameraControls(camera, el);

    // TrackballControls
    controls = new TrackballControls(camera, el);
    controls.rotateSpeed = 3.0;

    // OrbitControls
    // const controls = new OrbitControls(camera, el);

    const geometry = new THREE.BoxGeometry();

    const material = new THREE.MeshStandardMaterial({
        color: 0x00ff00,
        metalness: 0.13,
    });

    const cube = new THREE.Mesh(geometry, material);
    // scene.add(cube);

    const directionalLight = new THREE.DirectionalLight(0x9090aa);
    directionalLight.position.set(-10, 10, -10).normalize();
    scene.add(directionalLight);

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemisphereLight.position.set(1, 1, 1);
    scene.add(hemisphereLight);

    const animate = () => {
        const delta = clock.getDelta();
        controls.update(delta);
        // const hasControlsUpdated = cameraControls.update(delta);


        requestAnimationFrame(animate);

        // required if controls.enableDamping or controls.autoRotate are set to true
        // controls.update();

        // you can skip this condition to render though
        // if (hasControlsUpdated) {
        renderer.render(scene, camera);
        // }

    };

    const resize = () => {
        const { width, height } = el.getBoundingClientRect();
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    };

    const getStarted = (el) => {
        renderer = new THREE.WebGLRenderer({ antialias: true, canvas: el });
        renderer.setClearColor("#EEEEEE");
        resize();
        animate();
    };

    window.addEventListener('resize', resize);

    getStarted(el);
}

export const createPlane = (realized_plane) => {
    const { width, height, plane } = realized_plane;
    let { origin, primary, secondary, tertiary } = plane;
    origin = new THREE.Vector3(origin.x, origin.y, origin.z);
    primary = new THREE.Vector3(primary.x, primary.y, primary.z);
    secondary = new THREE.Vector3(secondary.x, secondary.y, secondary.z);
    tertiary = new THREE.Vector3(tertiary.x, tertiary.y, tertiary.z);

    let half_width = width / 2;
    let half_height = height / 2;

    const upper_right = origin.clone().addScaledVector(primary, half_width).addScaledVector(secondary, half_height);
    const upper_left = origin.clone().addScaledVector(primary, -half_width).addScaledVector(secondary, half_height);
    const lower_right = origin.clone().addScaledVector(primary, half_width).addScaledVector(secondary, -half_height);
    const lower_left = origin.clone().addScaledVector(primary, -half_width).addScaledVector(secondary, -half_height);

    const geometry = new THREE.BufferGeometry();
    const vertices = new Float32Array([
        lower_left.x, lower_left.y, lower_left.z,
        lower_right.x, lower_right.y, lower_right.z,
        upper_right.x, upper_right.y, upper_right.z,
        upper_right.x, upper_right.y, upper_right.z,
        upper_left.x, upper_left.y, upper_left.z,
        lower_left.x, lower_left.y, lower_left.z,
    ]);

    const normals = new Float32Array([
        tertiary.x, tertiary.y, tertiary.z,
        tertiary.x, tertiary.y, tertiary.z,
        tertiary.x, tertiary.y, tertiary.z,
        tertiary.x, tertiary.y, tertiary.z,
        tertiary.x, tertiary.y, tertiary.z,
        tertiary.x, tertiary.y, tertiary.z,
    ]);

    // itemSize = 3 because there are 3 values (components) per vertex
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));

    const material = new THREE.MeshStandardMaterial({
        color: 0x525292,
        side: THREE.DoubleSide,
        metalness: 0.0,
        transparent: true,
        opacity: 0.15,
        depthWrite: false,
    });

    const mesh = new THREE.Mesh(geometry, material);

    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x42a7eb }));

    return { mesh, line };
}

export const setRealization = (realization) => {
    // for now just delete every old plane and create a new one each time
    // in the future, we can make this more efficient by updating the existing planes
    // for (const [key, value] of Object.entries(planes)) {
    //     scene.remove(value);
    // }

    // create a new plane for each plane in the realization
    for (const [key, value] of Object.entries(realization.planes)) {
        console.log("A plane: ", key, value);
        planes[key] = createPlane(value);

        scene.add(planes[key].mesh);
        scene.add(planes[key].line);
    }



    // compute a diff
    // for (const [key, value] of Object.entries(realization.planes)) {
    //     console.log("A plane: ", key, value);



    // if (planes.containsKey(key)) {
    //     // update the plane
    //     // achieve this by deleting and creating a new one for now,
    //     // but in the future make this more efficient by just modifying the existing one
    //     scene.remove(planes[key]);
    //     planes[key] = createPlane(value);
    //     scene.add(planes[key]);
    // } else {

    // }
    // }
}



