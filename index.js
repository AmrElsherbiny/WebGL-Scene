/*import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { Water } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/objects/Water.js';*/

// Modules part
import * as THREE from '/three.js';
import { OrbitControls } from '/OrbitControls.js';
import { GLTFLoader } from '/GLTFLoader.js';
import { Water } from '/Water.js';

function main() {

  // Renderer part
  const renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.autoClear = false;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  document.body.appendChild(renderer.domElement);

  // Camera part
  const camera = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, 0.1, 50000);
  camera.position.y = 0;
  camera.position.z = 50;

  // Initializing scene
  const scene = new THREE.Scene();

  // Adding clock
  const clock = new THREE.Clock();

  // Controls part
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.maxPolarAngle = Math.PI*0.495;
  controls.enableDamping = true;
  controls.minDistance = 500;
  controls.maxDistance = 2500;

  // Background audio part - "ocean.wav"
  const listener = new THREE.AudioListener();
  camera.add(listener);
  const sound = new THREE.Audio(listener);
  const audioLoader = new THREE.AudioLoader();
  audioLoader.load('ocean.wav', function(buffer) {
  	sound.setBuffer(buffer);
  	sound.setLoop(true);
  	sound.setVolume(0.5);
  	sound.play();
  });

  // Clouds part
  let cloudParticles = [];
  let cloudloader = new THREE.TextureLoader();
  cloudloader.load("cloud10.png", function(texture){
    let cloudGeo = new THREE.PlaneBufferGeometry(500,500);
    let cloudMaterial = new THREE.MeshBasicMaterial({
      color: 0x777777,
      map: texture,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    let cloudMaterial2 = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    function AddBlackClouds(x,z)
    {
      for(let p=0; p<25; p++) {
        let cloud = new THREE.Mesh(cloudGeo,cloudMaterial);
        cloud.position.set(
          Math.random()*800-400+x,
          1000,
          Math.random()*500-250+z
        );
        cloud.material.opacity = 0.6;
        cloud.layers.set(0);
        cloudParticles.push(cloud);
        cloud.type="black";
        scene.add(cloud);
      }
    }
    function AddWhiteClouds(x,z)
    {
      for(let p=0; p<7; p++) {
        let cloud = new THREE.Mesh(cloudGeo,cloudMaterial2);
        cloud.position.set(
          Math.random()*500-250+x,
          1000,
          Math.random()*300-150+z
        );
        cloud.material.opacity = 0.6;
        cloud.type="white";
        cloudParticles.push(cloud);
        scene.add(cloud);
      }
    }
    let c=0;
    while(c<112)
    {
      const x = Math.random()*24000-12000;
      const z = Math.random()*24000-12000;
      if(Math.abs(x)<850 || Math.abs(z)<550)
        continue;
      AddWhiteClouds(x,z);
      c++;
    }
    AddBlackClouds(0,0);
  });

  // Positional audio - "thunder.wav"
  const listener2 = new THREE.AudioListener();
  camera.add( listener2 );
  const sound2 = new THREE.PositionalAudio( listener2 );
  const audioLoader2 = new THREE.AudioLoader();
  audioLoader2.load( 'thunder.wav', function( buffer ) {
  	sound2.setBuffer( buffer );
  	sound2.setRefDistance( 500 );
    sound2.setLoop(true);
  	sound2.play();
  });

  // Dummy object - used for storing audio only
  const sphere = new THREE.SphereGeometry( 200, 32, 16 );
  const material = new THREE.MeshPhongMaterial( {
    transparent: true,
    opacity: 0,
    depthWrite: false,
   } );
  const mesh = new THREE.Mesh( sphere, material );
  mesh.position.set(0,700,-200);
  scene.add(mesh);
  mesh.add(sound2);

  // Lightning part
  let flash = new THREE.PointLight(0x062d89, 30, 500 ,1.7);
  flash.position.set(200,300,100);
  flash.castShadow = true;
  flash.shadow.camera.near = 0.1;
  flash.shadow.camera.far = 2500;
  flash.shadow.camera.left = 2500;
  flash.shadow.camera.right = -2500;
  flash.shadow.camera.top = 2500;
  flash.shadow.camera.bottom = -2500;
  flash.shadow.bias = -0.0001;
  scene.add(flash);

  // Rain part
  let rainCount=9500;
  let vertices = [];
  let velocity = [];
  let i=0;
  while(i<rainCount) {
    const c = Math.floor(Math.random()*3);
    if(c==3) continue;
    let x, y, z;
    x = Math.random()*300-150;
    y = Math.random()*500;
    z = Math.random()*300-150;
    if(c==1){
      if(Math.sqrt(Math.pow(x,2)+Math.pow(z,2))>150)
        continue;
      x += 150;
    }else if(c==2){
      if(Math.sqrt(Math.pow(x,2)+Math.pow(z,2))>150)
        continue;
      x -= 150;
    }
  	vertices.push(x, y, z);
    velocity.push(0);
    i++;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  const material2 = new THREE.PointsMaterial({
    color: 0xaaaaaa,
    size: 0.1,
    transparent: true
  });
  const points = new THREE.Points(geometry, material2);
  scene.add(points);

  // Water part
  const waterGeometry = new THREE.PlaneGeometry(40000,40000);
  const water = new Water(
  waterGeometry,
  {
    textureWidth: 512,
    textureHeight: 512,
    waterNormals: new THREE.TextureLoader().load( 'waternormals.jpg', function ( texture ) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    } ),
    sunDirection: new THREE.Vector3(),
    sunColor: 0xffffff,
    waterColor: 0x001e0f,
    distortionScale: 3.7,
    fog: scene.fog !== undefined,
  });
  water.rotation.x = -Math.PI/2;
  scene.add(water);

  // AmbientLight part
  const ambient = new THREE.AmbientLight(0x222222);
  scene.add(ambient);

  // Sunlight part
  const light = new THREE.DirectionalLight(0xFFFFFF, 1);
  light.position.set(1, 1, 1);
  light.castShadow = true;
  light.shadow.camera.near = 0.1;
  light.shadow.camera.far = 2500;
  light.shadow.camera.left = 2500;
  light.shadow.camera.right = -2500;
  light.shadow.camera.top = 2500;
  light.shadow.camera.bottom = -2500;
  light.shadow.bias = -0.0001;
  light.shadow.mapSize.width = 1024*4;
  light.shadow.mapSize.height = 1024*4;
  light.layers.set(0);
  scene.add(light);

  // Skybox part
  let materialArray = [];
  let texture_ft = new THREE.TextureLoader().load('sky_ft.jpg');
  let texture_bk = new THREE.TextureLoader().load('sky_bk.jpg');
  let texture_up = new THREE.TextureLoader().load('sky_up.jpg');
  let texture_dn = new THREE.TextureLoader().load('sky_dn.jpg');
  let texture_rt = new THREE.TextureLoader().load('sky_rt.jpg');
  let texture_lf = new THREE.TextureLoader().load('sky_lf.jpg');
  materialArray.push(new THREE.MeshBasicMaterial( { map: texture_ft }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: texture_bk }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: texture_up }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: texture_dn }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: texture_rt }));
  materialArray.push(new THREE.MeshBasicMaterial( { map: texture_lf }));
  for (let i = 0; i < 6; i++) materialArray[i].side = THREE.BackSide;
  let skyboxGeo = new THREE.BoxGeometry( 40000, 40000, 40000);
  let skybox = new THREE.Mesh( skyboxGeo, materialArray );
  scene.add(skybox);

  // Positional audio - "boat.wav"
  const listener3 = new THREE.AudioListener();
  camera.add(listener3);
  const sound3 = new THREE.PositionalAudio(listener3);
  const audioLoader3 = new THREE.AudioLoader();
  audioLoader3.load('boat.wav', function(buffer) {
  	sound3.setBuffer(buffer);
  	sound3.setRefDistance(2500);
    sound3.setLoop(true);
    sound.setVolume(2);
  	sound3.play();
  });

  // Object model - "boat.glb"
  let boat = [];
  const loader = new GLTFLoader();
  loader.load('boat.glb',(gltf)=>{
    const boatMesh = gltf.scene.children.find((child) => child.name === "Boat");
    boatMesh.scale.set(boatMesh.scale.x * 40, boatMesh.scale.y * 40, boatMesh.scale.z * 40);
    boatMesh.position.y = -8;
    boatMesh.add(sound3);
    boat.push(boatMesh);
    gltf.scene.traverse(c=>{
      c.receiveShadow = true;
      c.castShadow = true;
      if(c instanceof THREE.Mesh)
        c.material.flatShading = false;
    });
    scene.add(gltf.scene);
  });

  // Object model - "lighthouse.glb"
  const loader2 = new GLTFLoader();
  loader2.load('lighthouse.glb',(gltf)=>{
    gltf.scene.children.forEach(c => {
      c.position.set(c.position.x * 12, c.position.y * 12, c.position.z * 12);
      c.scale.set(c.scale.x * 12, c.scale.y * 12, c.scale.z * 12);
      c.position.z -= 800;
    });
    gltf.scene.traverse(c=>{
      c.receiveShadow = true;
      c.castShadow = true;
      if(c instanceof THREE.Mesh)
        c.material.flatShading = false;
    });
    scene.add(gltf.scene);
  });

  // Positional audio - "parrot.wav"
  const listener4 = new THREE.AudioListener();
  camera.add(listener4);
  const sound4 = new THREE.PositionalAudio(listener4);
  const audioLoader4 = new THREE.AudioLoader();
  audioLoader4.load('parrot.wav', function(buffer) {
  	sound4.setBuffer(buffer);
  	sound4.setRefDistance(25);
    sound4.setLoop(true);
  	sound4.play();
  });

  // Object model - "parrot.glb"
  let mixer;
  let bird = [];
  const loader3 = new GLTFLoader();
  loader3.load('parrot.glb',(gltf)=>{
    const birdMesh = gltf.scene.children.find((child) => child.name === "mesh_0");
    birdMesh.scale.set(birdMesh.scale.x * 0.2, birdMesh.scale.y * 0.2, birdMesh.scale.z * 0.2);
    birdMesh.position.y = 120;
    birdMesh.add(sound4);
    bird.push(birdMesh);
    mixer = new THREE.AnimationMixer( gltf.scene );
    gltf.animations.forEach((clip) => {
      mixer.clipAction(clip).play();
    } );
    gltf.scene.traverse(c=>{
      c.receiveShadow = true;
      c.castShadow = true;
      /*if(c instanceof THREE.Mesh)
        c.material.flatShading = false;*/
    });
    scene.add(gltf.scene);
  });

  // Animation frame part
  function render(time) {

    // Responsible for frame time
    const delta = clock.getDelta();

    // Responsible for water formations according to time
    water.material.uniforms['time'].value += delta;

    // Responsible for movement and the looks of clouds
    cloudParticles.forEach(p => {
      p.lookAt(camera.position);
      if(p.type=="white")
      {
        p.position.x-=delta*125;
        if(p.position.x<-12000)
          p.position.x+=24000;
      }
    });

    // Responsible for the lightning
    if(Math.random() > 0.93 || flash.power > 100) {
      if(flash.power < 100)
      {
        const x = Math.random()*400;
        const y = 300 + Math.random() *200;
        flash.position.set(x, y, 100);
      }
      flash.power = 50 + Math.random() * 500;
    }

    // Responsible for the rain physics
    let positions = points.geometry.attributes.position.array;
    for ( let i = 0; i < rainCount; i ++ ) {
      velocity[i] -= 3*Math.random()*1;
      positions[i*3+1] += velocity[i];
      if(positions[i*3+1] < 0){
        positions[i*3+1] = 800;
        velocity[i] = 0;
      }
    }
    points.geometry.attributes.position.needsUpdate = true;

    // Responsible for the object physics - boat
    boat.forEach(b => {
      const w = 800*Math.sin(time*0.0001);
      const d = 800*Math.cos(time*0.0001);
      const h = 2*Math.cos(time*0.0025);
      const x = 0.025*Math.sin(time*0.0015);
      const z = 0.0075*Math.sin(time*0.0025);
      const r = Math.sqrt(Math.pow(x,2)+Math.pow(z,2));
      b.position.x = w;
      b.position.y = -8-h;
      b.position.z = d-800;
      if(d!=0 && x!=0)
      {
        const y = Math.atan(w/d);
        const t = Math.atan(z/x)+(x<0?Math.PI:0);
        if(d>0){
          b.rotation.x = r*Math.cos(y+t);
          b.rotation.y = y;
          b.rotation.z = r*Math.sin(y+t);
        }else{
          b.rotation.x = r*Math.cos(y+t+Math.PI);
          b.rotation.y = Math.PI+y;
          b.rotation.z = r*Math.sin(y+t+Math.PI);
        }
      }
    });

    // Responsible for the object animation - bird
    if (mixer) mixer.update(delta*1.75);

    // Responsible for the object physics - bird
    bird.forEach(b => {
      const w = 150*Math.sin(time*0.0015);
      const d = 75*Math.cos(time*0.0015);
      const d2 = 75*Math.sin(time*0.0030);
      b.position.x = w;
      b.position.z = d2;
      if(w!=0){
        if(w>0){
          b.rotation.y = Math.PI-Math.atan(d/w)*2;
        }else{
          b.rotation.y = -Math.PI+Math.atan(d/w)*2;
        }
      }
    });

    // Responsible for the controls
    controls.update();

    // Responsible for the camera
    camera.aspect = innerWidth/innerHeight;
    camera.updateProjectionMatrix();

    // Responsible for the renderer
    renderer.setSize(innerWidth, innerHeight);
    renderer.setPixelRatio(devicePixelRatio);
    renderer.clear();
    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

main();
