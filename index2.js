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
    mesh;

const GLTF_Loader = new GLTFLoader();
const FBX_Loader = new FBXLoader();

const defaultCamera = { x: 0, y: 10, z: 40 };
const objDefaultPosition = { x: 0, y: -2, z: 0 };
const objectDefaultScale = { x: 1, y: 1.2, z: 1 };
const animationTime = 1000;

let children = {};

const billboards = {
    middle: {
        path: './models/textures/billboard_middle.jpg',
        position: { x: 0, y: 2.5, z: 8 },
        name: "middle",
        circle: {
            normal: './models/gltf/circle_1.gltf',
            onHover: './models/gltf/circle_2.gltf',
            position: { x: 17, y: -3, z: -10 },
        }
    }
};


const myModal = new bootstrap.Modal(document.getElementById('exampleModal'), {
    keyboard: false,
    backdrop: 'static',

})





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


    // 
    makeBanner();
    makeBillboards();


    setupFloor();



    window.addEventListener('resize', onWindowResize);
    window.addEventListener("hidden.bs.modal", handleModalClose);



}




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

    myModal.hide();
    $(document.body).removeClass("modal-open");
    $(".modal-backdrop").remove();


    new TWEEN.Tween(camera.position)
        .to({
            x: defaultCamera.x,
            y: defaultCamera.y,
            z: defaultCamera.z,
        }, animationTime)
        .onComplete(() => {
            camera.lookAt(0, 0, 0);
        })
        .start();


}


const makeBanner = () => {

    loader.load(
        './models/textures/banner.jpg',
        texture => {
            material = new THREE.MeshBasicMaterial({ map: texture });
            geometry = new THREE.PlaneGeometry(55, 20);
            mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(0, 14, -5);
            scene.add(mesh)
        },
        undefined, (err) => console.error('An error happened.')
    );
}

const makeBillboards = () => {

    for (const a in billboards) {
        let billboard = billboards[a];
        loader.load(
            billboard.path,
            texture => {
                material = new THREE.MeshBasicMaterial({ map: texture });
                geometry = new THREE.PlaneGeometry(28, 12);
                mesh = new THREE.Mesh(geometry, material);
                mesh.name = billboard.name;
                mesh.position.set(
                    billboard.position.x,
                    billboard.position.y,
                    billboard.position.z
                );
                scene.add(mesh)
            },
            undefined, (err) => console.error('An error happened.')
        );

        GLTF_Loader
            .load(
                billboard.circle.normal,
                (gltf) => {
                    gltf.scene.position.set(
                        billboard.circle.position.x,
                        billboard.circle.position.y,
                        billboard.circle.position.z
                    );
                    gltf.scene.scale.set(3, 2.5, 2.5);
                    scene.add(gltf.scene);
                    gltf.scene.children[0].name = `circle-${billboard.name}-normal`;
                },
                undefined, error => console.error(error)
            );

        GLTF_Loader
            .load(
                billboard.circle.onHover,
                (gltf) => {
                    gltf.scene.position.set(
                        billboard.circle.position.x,
                        billboard.circle.position.y,
                        billboard.circle.position.z
                    );
                    gltf.scene.scale.set(3, 2.5, 2.5);
                    scene.add(gltf.scene);
                    gltf.scene.children[0].name = `circle-${billboard.name}-onHover`;
                    scene.children.forEach((child, index) => {
                        if (child.children[0] && child.children[0].name == `circle-${billboard.name}-onHover`) {
                            child.visible = false;
                        }
                    });
                },
                undefined, error => console.error(error)
            );

    }
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
        switch (intersects[0].object.name) {
            case "middle":
                new TWEEN.Tween(camera.position)
                    .to({
                        x: 0,
                        y: 1,
                        z: 19,
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

    children = {};
    scene.children.forEach((child, index) => {
        if (child.children[0]) {
            children[child.children[0].name] = child;
        }
    });
    console.log(children)

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length <= 0) return;

    switch (intersects[0].object.name) {
        case "middle":
            $("body").css("cursor", "pointer");
            children[`circle-middle-normal`].visible = false;
            children[`circle-middle-onHover`].visible = true;
            break;
        default:
            $("body").css("cursor", "auto");
            children[`circle-middle-normal`].visible = true;
            children[`circle-middle-onHover`].visible = false;
            break;
    }

}