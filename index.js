import * as THREE from './three.module.js';
import { OrbitControls } from './examples/jsm/controls/OrbitControls.js';
import { TWEEN } from './examples/jsm/libs/tween.module.min.js';

let scene,
    camera,
    renderer,
    controls,
    geometry,
    material,
    plane,
    floor,
    texture,
    loader,
    mesh,
    circle;

const defaultCamera = { x: 0, y: 10, z: -20 };
const amimationTime = 1000;

const init = () => {
    loader = new THREE.TextureLoader();

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(
        defaultCamera.x,
        defaultCamera.y,
        defaultCamera.z
    );


    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // light

    // controls

    controls = new OrbitControls(camera, renderer.domElement);
    controls.listenToKeyEvents(window); // optional

    //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

    controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
    controls.dampingFactor = 0.05;

    controls.screenSpacePanning = false;

    controls.maxDistance = 20;

    controls.maxPolarAngle = Math.PI / 2;






    texture = new THREE.TextureLoader().load('./BANNER/texture/BANNER.png');
    // immediately use the texture for material creation
    geometry = new THREE.BoxGeometry(5, 3, 0.2);
    material = new THREE.MeshBasicMaterial({ map: texture });
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, -3, 6);
    mesh.name = "box";
    scene.add(mesh);








    texture = new THREE.TextureLoader().load('./images/flower.jpg');
    // immediately use the texture for material creation
    geometry = new THREE.PlaneGeometry(25, 15);
    material = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        side: THREE.DoubleSide,
        map: texture
    });
    plane = new THREE.Mesh(geometry, material);
    plane.position.set(0, -0.5, 15);
    plane.name = "plane";
    scene.add(plane);

    texture = new THREE.TextureLoader().load('./images/floor.jpg');
    // immediately use the texture for material creation
    geometry = new THREE.PlaneGeometry(100, 100);
    material = new THREE.MeshBasicMaterial({
        color: 0xffff00,
        side: THREE.DoubleSide,
        map: texture
    });
    floor = new THREE.Mesh(geometry, material);
    floor.name = "floor";
    floor.position.y = -5;
    floor.rotation.x = Math.PI / 2;
    scene.add(floor);

    console.log(1)

    window.addEventListener('resize', onWindowResize);

    window.addEventListener("hide.bs.modal", () => {
        new TWEEN.Tween(camera.position)
            .to({
                x: defaultCamera.x,
                y: defaultCamera.y,
                z: defaultCamera.z,
            }, amimationTime)
            .start()
        new TWEEN.Tween(mesh.scale)
            .to({
                x: 1,
                y: 1
            }, amimationTime)
            .start();


    });

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

function render() {

    renderer.render(scene, camera);

}



init();
animate();

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2()

renderer.domElement.addEventListener('click', onClick, false);

function onClick() {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    var intersects = raycaster.intersectObjects(scene.children, true);

    if (intersects.length > 0) {
        console.log('Intersection:', intersects[0]);


        if (intersects[0].object.name == "box") {
            // alert('you clicked on the box')
            // camera.position.set(0, 0, 4);

            var myModal = new bootstrap.Modal(document.getElementById('exampleModal'), {
                keyboard: false
            })

            new TWEEN.Tween(camera.position)
                .to({
                    x: 0,
                    y: 0.05,
                    z: -2
                }, amimationTime)
                .start()

            new TWEEN.Tween(mesh.scale)
                .to({
                    x: 3.5,
                    y: 3.5
                }, amimationTime)
                .onComplete(() => {
                    myModal.show()
                })
                .start();

            console.log("MESH: " + mesh)


        }
    }
}