import * as THREE from './three.module.js';
import { OrbitControls } from './examples/jsm/controls/OrbitControls.js';
import { TWEEN } from './examples/jsm/libs/tween.module.min.js';
import { GLTFLoader } from './examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from './examples/jsm/loaders/FBXLoader.js';

let scene,
    camera,
    renderer,
    controls,
    geometry,
    material,
    floor,
    loader,
    mesh,
    model;

const FBX_Loader = new FBXLoader();


const defaultCamera = { x: 0, y: 4, z: 33 };
const modelDefaultPosition = { x: 0, y: -3, z: 10 };
const animationTime = 1000;

let children = {};

const myModal = new bootstrap.Modal(document.getElementById('exampleModal'), {
    keyboard: false,
    backdrop: 'static',

})


const billboards = {
    polySurface58_1: { // back - center
        name: "polySurface58_1",
        animateTo: {
            x: 0,
            y: 2,
            z: 12
        },
    },
    polySurface48_1: { // back - center
        name: "polySurface48_1",
        animateTo: {
            x: 0,
            y: -0.5,
            z: 23.5
        },
    },
};


const init = () => {
    loader = new THREE.TextureLoader();
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#e0e0e0");

    setupCamera();
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    setupControls();

    // light
    let light = new THREE.AmbientLight(0xffffff, 1); // soft white light
    scene.add(light);

    setupFloor();

    (new GLTFLoader()).load("./models/Untitled.gltf", gltf => {
        console.log(gltf)

        gltf.scene.traverse(o => {
            if (o.isMesh && o.material.map !== null) {
                o.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
            }
        })



        gltf.scene.scale.set(2.9, 2.9, 2.9);
        gltf.scene.position.set(0, -2.8, 20);
        scene.add(gltf.scene);


        $(".welcome-button")
            .attr('disabled', false)
            .html(`<img src="./images/welcome_arrow.png" alt="">`);
    });



    window.addEventListener('resize', onWindowResize);
    window.addEventListener("hidden.bs.modal", handleModalClose);

    controls.enabled = false;
}



const setupControls = () => {

    controls = new OrbitControls(camera, renderer.domElement);
    controls.listenToKeyEvents(window); // optional

    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.maxDistance = defaultCamera.z + 10;
    controls.maxPolarAngle = 1.65;

}

const setupFloor = () => {
    // texture = new THREE.TextureLoader().load('./images/floor.jpg');
    // immediately use the texture for material creation
    geometry = new THREE.PlaneGeometry(100, 100);
    material = new THREE.MeshBasicMaterial({
        color: "#bfc0c2",
        side: THREE.DoubleSide,
        // map: texture
    });
    floor = new THREE.Mesh(geometry, material);
    floor.name = "floor";
    floor.position.y = -3;
    floor.rotation.x = Math.PI / 2;
    scene.add(floor);
}

const setupCamera = () => {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(
        defaultCamera.x,
        defaultCamera.y,
        defaultCamera.z
    );
}


const handleModalClose = () => {
    new TWEEN.Tween(camera.position)
        .to({
            x: defaultCamera.x,
            y: defaultCamera.y,
            z: defaultCamera.z,
        }, animationTime)
        .start();




    myModal.hide();
    $(document.body).removeClass("modal-open");
    $(".modal-backdrop").remove();

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {

    requestAnimationFrame(animate);
    controls.update();
    TWEEN.update();
    render();

}
const render = () => renderer.render(scene, camera)

init();
animate();













const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

renderer.domElement.addEventListener('click', onClick, false);
renderer.domElement.addEventListener('mousemove', onMouseMove, false);

function onClick() {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        console.log('Intersection:', intersects[0].object);
        handleBillboardClick(intersects[0].object);
    }
}


const handleBillboardClick = (obj) => {
    let name = obj.name;
    if (!billboards[name]) return;

    new TWEEN.Tween(camera.position)
        .to(billboards[name].animateTo, animationTime)
        .onComplete(() => myModal.show())
        .start();
}


function onMouseMove() {
    event.preventDefault();

    children = {};
    scene.children.forEach((child, index) => {
        if (child.children[0]) {
            children[child.children[0].name] = child;
        }
    });

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length <= 0) return;

    if (
        ["polySurface48_1", "polySurface58_1"].includes(intersects[0].object.name)
    ) {
        $("body").css("cursor", "pointer");
    } else {
        $("body").css("cursor", "auto");
    }

}