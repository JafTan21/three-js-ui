import * as THREE from './three.module.js';
import { OrbitControls } from './examples/jsm/controls/OrbitControls.js';
import { TWEEN } from './examples/jsm/libs/tween.module.min.js';
import { GLTFLoader } from './examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from './examples/jsm/loaders/DRACOLoader.js';
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('./examples/js/libs/draco/')
const loader = new GLTFLoader()
loader.setDRACOLoader(dracoLoader);

let scene,
    camera,
    renderer,
    controls,
    model;


let loadingIsComplete = false;
const defaultCamera = { x: 0.288, y: 20, z: 220 };
const modelDefaultRotation = { x: 0.2, y: 0, z: 0 };
const animationTime = 1000;

const myModal = new bootstrap.Modal(document.getElementById('exampleModal'), {
    keyboard: false,
    backdrop: 'static',
})


const billboards = {
    GEO_09: { // back - center
        name: "GEO_09",
        animateTo: {
            x: 0,
            y: 5,
            z: 14
        },
        rotation: { x: -0.4 }
    },
    GEO_32: { // front - center
        name: "GEO_32",
        animateTo: {
            x: 0,
            y: -20,
            z: 70
        },
        circle: 'GEO_24'
    },
};


const init = () => {
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
    let light = new THREE.AmbientLight(0xffffff, 3); // soft white light
    scene.add(light);

    loader.load(
        "./models/new_low.glb",
        gltf => {
            gltf.name = 'model';
            gltf.scene.traverse(c => {
                if (c.isMesh && c.material.map !== null) {
                    c.material.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
                }
            });


            model = gltf.scene;
            loadingIsComplete = true;
            gltf.scene.scale.set(2.9, 2.9, 2.9);
            gltf.scene.position.y = -18;
            gltf.scene.rotation.x = modelDefaultRotation.x;
            scene.add(gltf.scene);

            renderer.domElement.addEventListener('click', onClick, false);
            renderer.domElement.addEventListener('mousemove', onMouseMove, false);


            $(".welcome-button")
                .attr('disabled', false)
                .html(`<img src="./images/welcome_arrow.png" alt="">`);

        },
        loading => $("#loaded").html(loading.loaded * 100 / loading.total + "%"),
        err => console.log(err)
    );


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
    // controls.maxPolarAngle = 1.65;

}


const setupCamera = () => {
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(
        defaultCamera.x,
        defaultCamera.y,
        defaultCamera.z
    );

    // camera.rotation.set(-0.11103480385245912, -0.020939349623349666, -0.002334423843532961);
    // camera.lookAt(scene.position);
}


const handleModalClose = () => {
    new TWEEN.Tween(camera.position)
        .to({
            x: defaultCamera.x,
            y: defaultCamera.y,
            z: defaultCamera.z,
        }, animationTime)
        .start();

    new TWEEN.Tween(model.rotation)
        .to({
            x: modelDefaultRotation.x,
            y: modelDefaultRotation.y,
            z: modelDefaultRotation.z,
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
    setTimeout(function() {

        requestAnimationFrame(animate);
        controls.update();
        TWEEN.update();

        render();
        camera.zoom = 2;


    }, 1000 / 120);
}
const render = () => renderer.render(scene, camera)

init();
animate();










const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onClick() {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        console.log('Intersection:', intersects[0].object);
        console.log("Curremt camera: ", camera)


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

    if (billboards[name].rotation) {
        new TWEEN.Tween(model.rotation)
            .to({ x: billboards[name].rotation.x }, animationTime)
            .start();
    }


}


function onMouseMove() {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length <= 0 || !loadingIsComplete) return;

    if (
        ["GEO_09", "GEO_32"].includes(intersects[0].object.name)
    ) {
        $("body").css("cursor", "pointer");
        handleCircleColor(intersects[0].object.name, 'yellow');
    } else {
        $("body").css("cursor", "auto");
        handleCircleColor(intersects[0].object.name, 'white');
    }

}



const handleCircleColor = (name, color) => {


    scene.children[1].children.filter(c => c.name == 'GEO_24')[0].material.color.set(color);

}