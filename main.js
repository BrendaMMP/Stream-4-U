import { gsap } from '/node_modules/gsap/gsap-core.js';
import * as THREE from '/node_modules/three/build/three.module.js';
// import * as TWEEN from '/node_modules/@tweenjs/tween.js';
import * as dat from '/node_modules/dat.gui/build/dat.gui.module.js';
// import { InteractionManager } from '/node_modules/three.interactive.js';
import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';

console.log(gsap);

const gui = new dat.GUI();
const welt = {
    // Standardgrösse der Fläche / Plane
    plane: {
        width: 400,
        height: 400,
        widthSegments: 50,
        heightSegments: 50
    }
};
// GUI Steuerung im Browser
gui.add(welt.plane, 'width', 1, 400).
    onChange(generierePlane); 

gui.add(welt.plane, 'height', 1, 400).
    onChange(generierePlane);

gui.add(welt.plane, 'widthSegments', 1, 50).
    onChange(generierePlane);

gui.add(welt.plane, 'heightSegments', 1, 50).
    onChange(generierePlane);


function generierePlane() {
    planeMesh.geometry.dispose()
    planeMesh.geometry = new THREE.PlaneGeometry(
        welt.plane.width, 
        welt.plane.height, 
        welt.plane.widthSegments, 
        welt.plane.heightSegments
    );

    const {array} = planeMesh.geometry.attributes.position;
    for (let i = 0; i < array.length; i += 3) {    // i += 3 looped nur jeden 3. wert / value
        const x = array[i];
        const y = array[i + 1];
        const z = array[i + 2];

        array[i + 2] = z + Math.random();
    }

    const farben = [];
    for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
        farben.push(0.898, 0.035, 0.078);
    };

    planeMesh.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(farben), 3));
}

// Strahlen, Szene und Kamera erstellen
const strahlen = new THREE.Raycaster();
const szene = new THREE.Scene();
const kamera = new THREE.PerspectiveCamera(
    75, 
    innerWidth / innerHeight, 
    0.1, 
    1000
);
const renderer = new THREE.WebGLRenderer({antialias: true});

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Standard-Kamera Entfernung (position.z) festlegen
// Szene mit Maus steuern und bewegen
const steuerung = new OrbitControls(kamera, renderer.domElement)
kamera.position.z = 75;

// Erstellt Plane / Fläche
const  planeGeometrie = new THREE.PlaneGeometry(
    welt.plane.width, 
    welt.plane.height, 
    welt.plane.widthSegments, 
    welt.plane.heightSegments
);

const planeMaterial = new THREE.MeshPhongMaterial({ 
    // color: 0xff0000,
    side: THREE.DoubleSide,
    flatShading: true,
    vertexColors: true
});
const planeMesh = new THREE.Mesh(planeGeometrie, planeMaterial);
szene.add(planeMesh);

// Position der Vertices / Ecken randomisieren, zufällig positionieren
const { array } = planeMesh.geometry.attributes.position;
for (let i = 0; i < array.length; i += 3) {    // i += 3 looped nur jeden 3. wert / value
    const x = array[i];
    const y = array[i + 1];
    const z = array[i + 2];

    array[i + 2] = z + (Math.random() - 0.5) * 5;
};

// Farbe des Plane
const farben = [];
for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
    farben.push(0.898, 0.035, 0.078);  // RGB-Farbe rot da 1 links, 
};

planeMesh.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(farben), 3));

// Beleuchtung vorne und hinten erstellen
const lichtVorne = new THREE.DirectionalLight(0xffffff, 1);
// Winkel des Lichts einstellen (x, y, z)
lichtVorne.position.set(0, -1, 1);
szene.add(lichtVorne);

const lichtHinten = new THREE.DirectionalLight(0xffffff, 1);
lichtHinten.position.set(0, 0, -1);
szene.add(lichtHinten);

const zeiger = {
    x: undefined,
    y: undefined
}

// TextureLoader kreieren, damit Bild geladen wird
let loaderDisplay = new THREE.TextureLoader();

// Bild in ein Custom Material laden
let materialDisplay = new THREE.MeshLambertMaterial({
    map: loaderDisplay.load('/assets/display.png')
  });

// Plane erstellen für Bild, mit Länge und Höhe 10, für Aspect Ratio des Bildes
let geometryDisplay = new THREE.PlaneGeometry(100, 100*0.75);

// Bild und Plane in einem Mesh kombinieren
let meshDisplay = new THREE.Mesh(geometryDisplay, materialDisplay);

// Position des Bildes in den X Y Z Dimensionen bestimmen
meshDisplay.position.set(0,0,20);

//Rotiere Bild um 90 Grad
meshDisplay.rotateX( Math.PI / 2 );

// Mesh der Szene hinzufügen
szene.add(meshDisplay);

// Kamera bewegen
// meshDisplay.addEventListener("click", (event) => {
//     event.stopPropagation();
//     console.log(`button was clicked`);
//     const display = event.target;
//     kamera.position.set(display.position.x, display.position.y, kamera.position.z);
// });
// interactionManager.add(object);

function animationDisplay() {
    steuerung.enabled = false // Orbit Controls deaktivieren um Kamera zu animieren
    
    new TWEEN.Tween(kamera.position.set(26,4,-35 )).to({ // from camera position
        x: 16, //desired x position to go
        y: 50, //desired y position to go
        z: -0.1 //desired z position to go
    }, 6500) // time take to animate
    .delay(1000).easing(TWEEN.Easing.Quartic.InOut).start() // define delay, easing
    .onComplete(function () { //on finish animation
        steuerung.enabled = true // Orbit Controls nach Animation wieder aktivieren
        setOrbitControlsLimits() //enable controls limits
        TWEEN.remove(this) // remove the animation from memory
    })
}

// animationDisplay();

function setOrbitControlsLimits(){
    controls.enableDamping = true
    controls.dampingFactor = 0.04
    controls.minDistance = 35
    controls.maxDistance = 60
    controls.enableRotate = true
    controls.enableZoom = true
    controls.maxPolarAngle = Math.PI /2.5
}

function animate() {
    // TWEEN.update();
    requestAnimationFrame(animate);
    renderer.render(szene, kamera);

    // Strahlen auch bei Kamerarotierung nur auf Plane anzeigen
    strahlen.setFromCamera(zeiger, kamera);
    const touchpoint = strahlen.intersectObject(planeMesh);
    if (touchpoint.length > 0) {
        const farbe = touchpoint[0].object.geometry.attributes.color; 
        // Vertice 1
        farbe.setX(touchpoint[0].face.a, 0.953);  // obere linke Ecke / Vertice a und setzt es auf Null / Schwarz     
        farbe.setY(touchpoint[0].face.a, 0.357);  // XYZ steht in diesem Fall für RGB
        farbe.setZ(touchpoint[0].face.a, 0.376); 
        // Vertice 2
        farbe.setX(touchpoint[0].face.b, 0.953);  // R
        farbe.setY(touchpoint[0].face.b, 0.357);  // G
        farbe.setZ(touchpoint[0].face.b, 0.376);  // B
        // Vertice 3
        farbe.setX(touchpoint[0].face.c, 0.953); 
        farbe.setY(touchpoint[0].face.c, 0.357);  
        farbe.setZ(touchpoint[0].face.c, 0.376);  

        farbe.needsUpdate = true;

        const standardFarbe = {
            r: 0.898, 
            g: 0.035, 
            b: 0.078
        }
        const hoverFarbe = {
            r: 0.953, 
            g: 0.357, 
            b: 0.376
        }

        gsap.to(hoverFarbe, {
            r: standardFarbe.r,
            g: standardFarbe.g,
            b: standardFarbe.b,
            onUpdate: () => {
                // Vertice 1
                farbe.setX(touchpoint[0].face.a, hoverFarbe.r);
                farbe.setY(touchpoint[0].face.a, hoverFarbe.g);
                farbe.setZ(touchpoint[0].face.a, hoverFarbe.b); 
                // Vertice 2
                farbe.setX(touchpoint[0].face.b, hoverFarbe.r);
                farbe.setY(touchpoint[0].face.b, hoverFarbe.g);
                farbe.setZ(touchpoint[0].face.b, hoverFarbe.b);
                // Vertice 3
                farbe.setX(touchpoint[0].face.c, hoverFarbe.r); 
                farbe.setY(touchpoint[0].face.c, hoverFarbe.g);  
                farbe.setZ(touchpoint[0].face.c, hoverFarbe.b);
                farbe.needsUpdate = true;
            }
        })
    }
};

animate();

addEventListener('mousemove', (event) => {
    zeiger.x = (event.clientX / innerWidth) * 2 - 1,  //Berechnung ermöglich X-Achse in der Mitte Nullpunkt, links Minusbereich und rechts Plus-Dezimalstellenbereich
    zeiger.y = -(event.clientY / innerHeight) * 2 + 1
})