import * as THREE from './three.module.js';
import { OrbitControls } from './examples/jsm/controls/OrbitControls.js';
import { TWEEN } from './examples/jsm/libs/tween.module.min.js';
import { GLTFLoader } from './examples/jsm/loaders/GLTFLoader.js';


let scene,
    camera,
    renderer,
    controls,
    geometry,
    material,
    floor,
    loader,
    mesh;

const GLTF_Loader = new GLTFLoader();

const defaultCamera = { x: 0, y: 5, z: 20 };
const objDefaultPosition = { x: 0, y: -2, z: 0 };
const objectDefaultScale = { x: 1, y: 1.2, z: 1 };
const animationTime = 1000;


const myModal = new bootstrap.Modal(document.getElementById('exampleModal'), {
    keyboard: false,
    backdrop: 'static',

})

const setupControls = () => {


    // controls

    controls = new OrbitControls(camera, renderer.domElement);
    controls.listenToKeyEvents(window); // optional

    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.maxDistance = defaultCamera.z;
    controls.maxPolarAngle = Math.PI / 2;

}

const setupFloor = () => {
    // texture = new THREE.TextureLoader().load('./images/floor.jpg');
    // immediately use the texture for material creation
    geometry = new THREE.PlaneGeometry(100, 100);
    material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
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

const init = () => {
    loader = new THREE.TextureLoader();

    scene = new THREE.Scene();


    setupCamera();
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);


    setupControls();

    // light
    let light = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(light)


    // 
    makeBanner();
    addButtons();
    addCircles();


    setupFloor();



    window.addEventListener('resize', onWindowResize);
    window.addEventListener("hidden.bs.modal", handleModalClose);

}

const handleModalClose = () => {

    myModal.hide();
    $(document.body).removeClass("modal-open");
    $(".modal-backdrop").remove();


    new TWEEN.Tween(camera.position)
        .to({
            x: defaultCamera.x,
            y: defaultCamera.y,
            z: defaultCamera.z,
        }, animationTime)
        .onComplete(() => camera.lookAt(0, 0, 0))
        .start();
}

const addCircles = () => {
    GLTF_Loader.load('./models/gltf/circle_1.gltf', function(gltf) {
        gltf.scene.position.set(
            8.6, -2, -10
        );
        gltf.scene.scale.set(
            1.5, 1.3, 1.5
        );
        scene.add(gltf.scene);
        gltf.scene.children[0].name = "circle1";
    }, undefined, error => console.error(error));
}

const makeBanner = () => {

    let bannerParts = [
        './models/gltf/display_00v1.gltf',
        './models/gltf/display_00v2.gltf',
        './models/gltf/display_00v3.gltf'
    ];

    bannerParts.forEach((part, index) => {
        GLTF_Loader.load(part, function(gltf) {
            gltf.scene.position.set(
                objDefaultPosition.x, objDefaultPosition.y, objDefaultPosition.z
            );
            gltf.scene.scale.set(
                objectDefaultScale.x, objectDefaultScale.y, objectDefaultScale.z
            );
            gltf.scene.children[0].name = "banner-" + index;
            scene.add(gltf.scene);
        }, undefined, error => console.error(error));
    })
}

const addButtons = () => {
    GLTF_Loader.load('./models/gltf/display_box_001.gltf', function(gltf) {
        gltf.scene.position.set(
            12, objDefaultPosition.y, objDefaultPosition.z
        );
        gltf.scene.scale.set(
            objectDefaultScale.x, objectDefaultScale.y, objectDefaultScale.z
        );
        scene.add(gltf.scene);
        gltf.scene.children[0].name = "box1";
    }, undefined, error => console.error(error));
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
    // console.log(camera.position)

    render();

}

function render() {

    renderer.render(scene, camera);

}



init();
animate();


const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2()

renderer.domElement.addEventListener('click', onClick, false);
renderer.domElement.addEventListener('mousemove', onMouseMove, false);

function onClick() {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        console.log('Intersection:', intersects[0].object.parent.name);
        switch (intersects[0].object.parent.name) {
            case "box1":
                var myModal = new bootstrap.Modal(document.getElementById('exampleModal'), {
                    keyboard: false
                })
                new TWEEN.Tween(camera.position)
                    .to({
                        x: 0.5,
                        y: 0,
                        z: 5.5,
                    }, animationTime)
                    .onComplete(() => {
                        myModal.show();
                    })
                    .start();
                break;
        }
    }
}

function onMouseMove() {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length <= 0) return;

    switch (intersects[0].object.parent.name) {
        case "box1":
            break;
    }
}