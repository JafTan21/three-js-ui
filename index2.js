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

const defaultCamera = { x: 0, y: 6, z: 28 };
const modelDefaultPosition = { x: 0, y: -3, z: 10 };
const animationTime = 1000;

let children = {};

const myModal = new bootstrap.Modal(document.getElementById('exampleModal'), {
    keyboard: false,
    backdrop: 'static',

})

const billboards = {
    polySurface9: { // back - center
        name: "polySurface9",
        animateTo: {
            x: 0,
            y: 0,
            z: 7
        },
        fbxPositionTo: {
            x: modelDefaultPosition.x,
            y: modelDefaultPosition.y,
            z: modelDefaultPosition.z
        },
        fbxRotationTo: {
            y: 0,
        }
    },
    polySurface8: { // back - right
        name: "polySurface8",
        animateTo: {
            x: 0,
            y: 0,
            z: 0.05
        },
        fbxPositionTo: {
            x: 0,
            y: -3,
            z: 1
        },
        fbxRotationTo: {
            y: 0.75,
        }
    },
    polySurface12: { // front - center
        name: "polySurface12",
        animateTo: {
            x: 0,
            y: -1,
            z: 13
        },
        fbxPositionTo: {
            x: modelDefaultPosition.x,
            y: modelDefaultPosition.y,
            z: modelDefaultPosition.z
        },
        fbxRotationTo: {
            y: 0,
        }
    },
    polySurface13: { // front - right
        name: "polySurface13",
        animateTo: {
            x: 2,
            y: -1,
            z: 8
        },
        fbxPositionTo: {
            x: modelDefaultPosition.x,
            y: modelDefaultPosition.y,
            z: modelDefaultPosition.z - 5
        },
        fbxRotationTo: {
            y: 0.9,
        }
    },
};

const init = () => {
    loader = new THREE.TextureLoader();
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#e0e0e0");

    setupCamera();
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    setupControls();

    // light
    let light = new THREE.AmbientLight(0x404040); // soft white light
    scene.add(light)

    setupFloor();


    FBX_Loader.load("./models/fbx/full.fbx", fbx => {

        // (new THREE.TextureLoader).load("./models/texture.jpg", texture => {
        //     fbx.children.filter(c => c.name == "polySurface9")[0].material.map = texture;
        // });
        model = fbx;
        fbx.position.set(0, -3, 10);
        fbx.scale.set(2, 2, 2);
        scene.add(fbx);

        console.log(fbx.children)

        $(".welcome-button")
            .attr('disabled', false)
            .html(`<img src="./images/welcome_arrow.png" alt="">`);
    }, undefined, err => console.log(err));

    loader.load("./models/texture.jpg", texture => {
        material = new THREE.MeshBasicMaterial({ map: texture });
        geometry = new THREE.PlaneBufferGeometry(11.5, 4.8);
        mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = 1.1;
        mesh.name = "polySurface9";

        scene.add(mesh)
    });

    window.addEventListener('resize', onWindowResize);
    window.addEventListener("hidden.bs.modal", handleModalClose);
}

const setupControls = () => {

    controls = new OrbitControls(camera, renderer.domElement);
    controls.listenToKeyEvents(window); // optional

    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

    // controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
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


    new TWEEN.Tween(model.position)
        .to({
            x: 0,
            y: -3,
            z: 10
        }).start();

    new TWEEN.Tween(model.rotation)
        .to({
            y: 0,
        }).start();




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

    if (billboards[name].fbxPositionTo) {
        new TWEEN.Tween(model.position)
            .to({
                x: billboards[name].fbxPositionTo.x,
                y: billboards[name].fbxPositionTo.y,
                z: billboards[name].fbxPositionTo.z,
            })
            .start();
    }

    if (billboards[name].fbxRotationTo) {
        new TWEEN.Tween(model.rotation)
            .to({
                y: billboards[name].fbxRotationTo.y,
            })
            .start();
    }

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
        ["polySurface9"].includes(intersects[0].object.name)
    ) {
        $("body").css("cursor", "pointer");
    } else {
        $("body").css("cursor", "auto");
    }

}