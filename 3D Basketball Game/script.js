//variables initialized in non-animate scope
var world, scene, camera, controls, renderer, stats, lightH;
var balls = [];
var ballMeshes = [];
var ballMaterial, wallMaterial, hoopMaterial;
var hoop;

//camera properties
var WIDTH = window.innerWidth,
    HEIGHT = window.innerHeight,
    VIEW_ANGLE = 55,
    ASPECT = WIDTH / HEIGHT,
    NEAR = 0.1,
    FAR = 10000;

//create physics world
function initCannonWorld() {
    world = new CANNON.World();
    world.quatNormalizeSkip = 0;
    world.quatNormalizeFast = false;

    var solver = new CANNON.GSSolver();

    world.defaultContactMaterial.contactEquationStiffness = 1e9;
    world.defaultContactMaterial.contactEquationRelaxation = 4;

    solver.iterations = 7;
    solver.tolerance = 0.1;
    var split = true;
    if (split)
        world.solver = new CANNON.SplitSolver(solver);
    else
        world.solver = solver;

    world.gravity.set(0, -70, 0);
    world.broadphase = new CANNON.NaiveBroadphase();

    //ball hit ball properties
    ballMaterial = new CANNON.Material("ballMaterial");
    var ballContactMaterial = new CANNON.ContactMaterial(
        ballMaterial,
        ballMaterial,
        {
            friction: 0.5,
            restitution: 1.2
        }
    );

    world.addContactMaterial(ballContactMaterial);

    //wall hit ball properties
    wallMaterial = new CANNON.Material("wallMaterial");
    var wallContactMaterial = new CANNON.ContactMaterial(
        wallMaterial,
        ballMaterial,
        {
            friction: 0.0,
            restitution: 0.6
        }
    );

    world.addContactMaterial(wallContactMaterial);

    //ball hit wall properties
    var wallContactMaterial2 = new CANNON.ContactMaterial(
        ballMaterial,
        wallMaterial, {
            friction: 0.6,
            restitution: 0.6
        }
    );

    world.addContactMaterial(wallContactMaterial2);

    hoopMaterial = new CANNON.Material("hoopMaterial");

    var wallContactMaterial3 = new CANNON.ContactMaterial(
        ballMaterial,
        hoopMaterial, {
            friction: 0.6,
            restitution: 0.3
        }
    );

    world.addContactMaterial(wallContactMaterial3);

    var wallContactMaterial4 = new CANNON.ContactMaterial(
        hoopMaterial,
        ballMaterial, {
            friction: 0.6,
            restitution: 0.3,
            contactEquationStiffness: 1e19,
            contactEquationRelaxation: 2
        }
    );

    world.addContactMaterial(wallContactMaterial4);
    //ground plane
    var groundShape = new CANNON.Plane();
    var groundBody = new CANNON.Body({mass: 0, material: wallMaterial});
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    world.add(groundBody);
}

//create visual world
function initThreeScene() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color().setHSL(0.6, 0, 1);
    scene.fog = new THREE.Fog(scene.background, 1, 5000);

    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    scene.add(camera);

    var crosshair = new THREE.Mesh(
        new THREE.PlaneGeometry(0.003, 0.003, 1, 1),
        new THREE.MeshBasicMaterial({
            map: (new THREE.TextureLoader()).load('https://i.imgur.com/tMHk9cK.png'),
            transparent: true
        })
    );
    crosshair.position.z = -0.1;
    camera.add(crosshair);
    camera.position.y = 12;

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    //DOM canvas
    var gameCanvas = renderer.domElement;
    gameCanvas.className += 'gameCanvas';
    document.body.appendChild(gameCanvas);

    stats = new Stats();
    document.body.appendChild(stats.dom);

    gameCanvas.requestPointerLock = gameCanvas.requestPointerLock || gameCanvas.mozRequestPointerLock || gameCanvas.webkitRequestPointerLock;
    gameCanvas.requestPointerLock();
    gameCanvas.onclick = function () {
        gameCanvas.requestPointerLock();
    }

    //keyboard and mouse controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;

    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = controls.minDistance;
    controls.enableKeys = false;

    //create sunlight/sky
    var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
    hemiLight.color.setHSL(0.6, 1, 0.6);
    hemiLight.groundColor.setHSL(0.095, 1, 0.75);
    hemiLight.position.set(0, 50, 0);


    scene.add(hemiLight);


    var hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
    scene.add(hemiLightHelper);

    var vertexShader = document.getElementById('vertexShader').textContent;
    var fragmentShader = document.getElementById('fragmentShader').textContent;
    var uniforms = {
        topColor: {value: new THREE.Color(0x0077ff)},
        bottomColor: {value: new THREE.Color(0xffffff)},
        offset: {value: 33},
        exponent: {value: 0.6}
    };
    uniforms.topColor.value.copy(hemiLight.color);
    scene.fog.color.copy(uniforms.bottomColor.value);
    var skyGeo = new THREE.SphereBufferGeometry(4000, 32, 15);
    var skyMat = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: uniforms,
        side: THREE.BackSide
    });
    var sky = new THREE.Mesh(skyGeo, skyMat);
    scene.add(sky);
}

function loadAssets() {
    //create visual/physics scene
    initThreeScene();
    initCannonWorld();

    var onProgress = function (xhr) {
        if (xhr.lengthComputable) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log(Math.round(percentComplete, 2) + '% downloaded');
        }
    };
    var onError = function (xhr) {
    };

    //load hoop texture
    var textureLoader = new THREE.TextureLoader();
    var texture = textureLoader.load('https://i.imgur.com/Im9NYaH.jpg');

    //what to do with 3d model
    function loadModel() {
        hoop.traverse(function (child) {
            if (child.isMesh) {
                child.material.map = texture;
                child.castShadow = true;
                child.recieveShadow = true;
            }
        });

        hoop.castShadow = true;
        hoop.recieveShadow = true;
        scene.add(hoop);

        hoop.position.set(94 / 2, 11, 0);
        var hscale = 0.0015;
        hoop.scale.set(hscale, hscale, hscale);
        hoop.rotateY(-Math.PI / 2);

        var hoop2 = hoop.clone();
        hoop2.position.set(-94 / 2, 11, 0);
        hoop2.rotateY(Math.PI);
        scene.add(hoop2);


        hoop.castShadow = true;
        hoop.recieveShadow = true;

        hoop2.castShadow = true;
        hoop2.recieveShadow = true;

        //start animation on object load
        start();
    }

    var manager = new THREE.LoadingManager(loadModel);
    manager.onProgress = function (item, loaded, total) {
        //console.log(item, loaded, total);
    };

    var loader3D = new THREE.OBJLoader(manager);
    loader3D.load('https://s3-us-west-1.amazonaws.com/alexkrantz-school/Kai/basketball_hoop.obj', function (object) {
        hoop = object;
    }, onProgress, onError);

    //creates a bounding box for the hoop
    function createBoundingBox(x, y, z, yr) {
        var body = new CANNON.Body({mass: 0, material: hoopMaterial});
        body.position.set(x, y, z);
        body.addShape(new CANNON.Box(new CANNON.Vec3(0.9 / 2, 13 / 2, 0.9 / 2)), new Vec3(2.9, 9.5, 0));
        body.addShape(new CANNON.Box(new CANNON.Vec3(2.2 / 2, 2 / 2, 2.2 / 2)), new Vec3(2.9, 1, 0));
        body.addShape(new CANNON.Box(new CANNON.Vec3(1.4 / 2, 2 / 2, 1.4 / 2)), new Vec3(2.9, 1.7, 0));
        body.addShape(new CANNON.Box(new CANNON.Vec3(0.6 / 2, 6 / 2, 0.6 / 2)), new Vec3(2.9, 19, 0));
        body.addShape(new CANNON.Box(new CANNON.Vec3(0.5 / 2, 5.4 / 2, 9.95 / 2)), new Vec3(-1, 19.9, 0));
        var shape = new CANNON.Sphere(0.2);
        var hnum = 30;
        for (var i = 0; i < hnum; i++) {
            body.addShape(shape, new Vec3(1.3 * Math.cos(2 * Math.PI / hnum * i) - 2.6, 18.3, 1.3 * Math.sin(2 * Math.PI / hnum * i)));
        }
        body.quaternion.setFromEuler(0, yr, 0);
        world.add(body);
    }

    createBoundingBox(94 / 2, 0, 0, 0);
    createBoundingBox(-94 / 2, 0, 0, Math.PI);
}

var start = function () {
    /*//var a = new Wall(2.9, 9.5, 0, 0.9, 13, 0.9);

    //a = new Wall(2.9, 1, 0, 2.2, 2, 2.2);
    //a = new Wall(2.9, 1.7, 0, 1.4, 2, 1.4);

    //a = new Wall(2.9, 19, 0, 0.6, 6, 0.6);

    /*a = new Wall(1.7, 18.7, 2.2, 5.6, 0.6, 0.2);
    a.wallMesh.rotateY(Math.PI / 3);
    a.body.quaternion.setFromEuler(0, Math.PI / 3, 0);

    a = new Wall(1.7, 18.7 + 2.5, 2.2, 5.6, 0.6, 0.2);
    a.wallMesh.rotateY(Math.PI / 3);
    a.body.quaternion.setFromEuler(0, Math.PI / 3, 0);

    a = new Wall(1.7, 18.7, -2.2, 5.6, 0.6, 0.2);
    a.wallMesh.rotateY(-Math.PI / 3);
    a.body.quaternion.setFromEuler(0, -Math.PI / 3, 0);

    a = new Wall(1.7, 18.7 + 2.5, -2.2, 5.6, 0.6, 0.2);
    a.wallMesh.rotateY(-Math.PI / 3);
    a.body.quaternion.setFromEuler(0, -Math.PI / 3, 0);

    a = new Wall(-0.2, 18.7, 4.75, 1, 0.6, 0.2);
    a.wallMesh.rotateY(Math.PI / 12);
    a.body.quaternion.setFromEuler(0, Math.PI / 12, 0);

    a = new Wall(-0.2, 18.7 + 2.5, 4.75, 1, 0.6, 0.2);
    a.wallMesh.rotateY(Math.PI / 12);
    a.body.quaternion.setFromEuler(0, Math.PI / 12, 0);

    a = new Wall(-0.2, 18.7, -4.75, 1, 0.6, 0.2);
    a.wallMesh.rotateY(-Math.PI / 12);
    a.body.quaternion.setFromEuler(0, -Math.PI / 12, 0);

    a = new Wall(-0.2, 18.7 + 2.5, -4.75, 1, 0.6, 0.2);
    a.wallMesh.rotateY(-Math.PI / 12);
    a.body.quaternion.setFromEuler(0, -Math.PI / 12, 0);

    //a = new Wall(-1, 19.9, 0, 0.5, 5.4, 9.95);

    /*var body = new CANNON.Body({mass: 0, material: hoopMaterial});
    body.quaternion.setFromEuler(Math.PI / 2, 0, 0);
    var shape = new CANNON.Trimesh.createTorus(1.5, 0.3, 6, 10);
    body.addShape(shape);
    body.position.set(-2.6, 18.3, 0);
    world.add(body);
    // Graphics
    var geo = new THREE.TorusGeometry(1.5, 0.3, 6, 10);
    var mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial(
        {
            color: '#ff0097',
            wireframe: true,
            wireframeLinewidth: 10
        })
    );
    mesh.position.set(-2.6, 18.3, 0);
    mesh.rotateX(Math.PI / 2);

    /*var body = new CANNON.Body({mass: 0, material: hoopMaterial});
    body.quaternion.setFromEuler(Math.PI / 2, 0, 0);
    body.position.set(-2.6, 18.3, 0);

    var shape = new CANNON.Sphere(0.1);


    var geo = new THREE.SphereGeometry(0.1);
    var mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial(
        {
            color: '#ff0097',
            wireframe: true,
            wireframeLinewidth: 10
        })
    );
    mesh.position.set(-2.6, 18.3, 0);

    //scene.add(mesh);
    var hnum = 30;
    for (var i = 0; i < hnum; i++) {
        var m = mesh.clone();
        m.position.x += 1.3*Math.cos(2*Math.PI/hnum*i);
        m.position.z += 1.3*Math.sin(2*Math.PI/hnum*i);
        body.addShape(shape, new Vec3(1.3*Math.cos(2*Math.PI/hnum*i), 1.3*Math.sin(2*Math.PI/hnum*i), 0));
        scene.add(m);
    }
    world.add(body);

    //scene.add(mesh);*/


    //properties for basketballs
    var ballShape = new CANNON.Sphere(0.79583);
    var ballGeometry = new THREE.SphereGeometry(ballShape.radius, 32, 32);
    var shootDirection = new THREE.Vector3(0, 1, 0);
    var shootVelo = 60;

    var balltexture = (new THREE.TextureLoader()).load('https://i.imgur.com/GUiSp1Z.png');
    var material = new THREE.MeshStandardMaterial({
        map: balltexture,
        color: '#ff8285',
        roughness: 0.78,
        metalness: 0.5
    });

    //create new basketball when mouse clicked
    window.addEventListener("click", function (e) {
        var x = camera.position.x;
        var y = camera.position.y;
        var z = camera.position.z;

        var ballBody = new CANNON.Body({mass: 1, material: ballMaterial});
        ballBody.addShape(ballShape);
        var ballMesh = new THREE.Mesh(ballGeometry, material);

        world.add(ballBody);
        scene.add(ballMesh);
        ballMesh.castShadow = true;
        ballMesh.receiveShadow = true;

        balls.push(ballBody);
        ballMeshes.push(ballMesh);

        camera.getWorldDirection(shootDirection);
        ballBody.velocity.set(shootDirection.x * shootVelo,
            (shootDirection.y + 0.1) * shootVelo,
            shootDirection.z * shootVelo);

        x += shootDirection.x * (ballShape.radius);
        y += shootDirection.y * (ballShape.radius);
        z += shootDirection.z * (ballShape.radius);
        ballBody.position.set(x, y, z);
        ballMesh.position.set(x, y, z);
    });

    //create lights
    /*for (var x = 0; x < 4; x++) {
        for (var y = 0; y < 2; y++) {
            var light = new THREE.PointLight('#dfebff', 0.2);
            light.position.set(x * 50 - 94 / 2 - 28, 50, y * 50 - 25);
            light.castShadow = true;

            light.shadow.mapSize.width = 512 / 4;
            light.shadow.mapSize.height = 512 / 4;
            light.shadow.camera.near = 0.5;
            light.shadow.camera.far = 200;

            //scene.add(new THREE.CameraHelper(light.shadow.camera));

            //light.shadow.camera = true;

            scene.add(light);
        }
    }*/

    var light = new THREE.DirectionalLight(0xffffff, 0.9);
    light.position.set(30, 100, 50);
    light.castShadow = true;
    //light.shadow.radius = 1.99;

    light.shadow.camera.bottom = -(94 + 50) / 3 * 2 - 20;
    light.shadow.camera.top = (94 + 50) / 2 + 20;
    light.shadow.camera.left = -80;
    light.shadow.camera.right = 80;

    light.shadow.mapSize.width = 512 * 4;
    light.shadow.mapSize.height = 512 * 4;
    light.shadow.camera.near = 0.5;
    light.shadow.camera.far = 180;
    lightH = new THREE.CameraHelper(light.shadow.camera);
    scene.add(lightH);
    //light.shadow.camera = true;
    scene.add(light);

    renderer.render(scene,camera);

    //basketball court
    var groundTextureDiffuse = (new THREE.TextureLoader()).load('https://i.imgur.com/Pl09pku.jpg');
    var groundTextureBump = (new THREE.TextureLoader()).load('https://i.imgur.com/u5mX2rg.png');
    var groundTextureRough = (new THREE.TextureLoader()).load('https://i.imgur.com/FGMRn6g.png');

    var groundMaterial = new THREE.MeshPhysicalMaterial({
        map: light.shadow.map.texture,
        //bumpMap: groundTextureBump,
        //roughnessMap: groundTextureRough,
        roughness: 0.05,
        reflectivity: 0.00001,
        metalness: 0.00,
        bumpScale: 0.0005
    });

    var ground = new THREE.Mesh(new THREE.BoxGeometry(94, 5, 50), groundMaterial);
    ground.position.y = -2.5;
    ground.receiveShadow = true;
    scene.add(ground);

    //create floor between court and walls
    var iTexture = (new THREE.TextureLoader()).load('https://i.imgur.com/PVi8spM.jpg');
    iTexture.wrapS = iTexture.wrapT = THREE.RepeatWrapping;
    iTexture.repeat.set(7, 5);
    iTexture.anisotropy = 1;

    var iMaterial = new THREE.MeshStandardMaterial({
        map: iTexture,
        color: '#ff8285',
        roughness: 0.58,
        metalness: 0.5
    });

    var imesh = new THREE.Mesh(new THREE.PlaneGeometry(94 + 50, 100, 1, 1).rotateX(-Math.PI / 2).translate(0, -34.905, 0), iMaterial);
    imesh.position.y = 34.9;
    imesh.receiveShadow = true;
    scene.add(imesh);


    //create walls
    var y = 15;
    var walls = [];

    //wider walls
    var wallTextureW = (new THREE.TextureLoader()).load('https://i.imgur.com/TDPT1BM.jpg');
    wallTextureW.wrapS = wallTextureW.wrapT = THREE.RepeatWrapping;
    wallTextureW.repeat.set(3, 1);
    wallMaterial = new THREE.MeshLambertMaterial({
        map: wallTextureW
    });

    walls.push(new Wall(0, y, 50, 94 + 50, 2 * y, 10, wallMaterial));
    walls.push(new Wall(0, y, -50, 94 + 50, 2 * y, 10, wallMaterial));

    //shorter wall
    var wallTextureS = (new THREE.TextureLoader()).load('https://i.imgur.com/TDPT1BM.jpg');
    wallTextureS.wrapS = wallTextureS.wrapT = THREE.RepeatWrapping;
    wallTextureS.repeat.set(2, 1);
    wallMaterial = new THREE.MeshLambertMaterial({
        map: wallTextureS
    });

    walls.push(new Wall(95 / 2 + 25, y, 0, 10, 2 * y, 50 + 50, wallMaterial));
    walls.push(new Wall(-95 / 2 - 25, y, 0, 10, 2 * y, 50 + 50, wallMaterial));


    //allow multple key events at once
    //store booleans in a key array where each index refers to a keycode value
    var keys = [];
    document.addEventListener("keydown", function (e) {
        keys[e.keyCode] = true;
    });
    document.addEventListener("keyup", function (e) {
        keys[e.keyCode] = false;
    });

    //keyCodes for arrow keys
    var LEFT = 37;
    var UP = 38;
    var RIGHT = 39;
    var DOWN = 40;

    var moveSpeed = 0.1;

    function animate() {
        requestAnimationFrame(animate);
        world.step(1 / 60);
        if (keys[LEFT]) {
            controls.rotateLeft(-moveSpeed / 10);
        }
        if (keys[RIGHT]) {
            controls.rotateLeft(moveSpeed / 10);
        }
        if (keys[UP]) {
            controls.rotateUp(-moveSpeed / 10);
        }
        if (keys[DOWN]) {
            controls.rotateUp(moveSpeed / 10);
        }
        if (keys[67]) {// C
            controls.panUp(moveSpeed);
        }
        if (keys[88]) {// X
            controls.panUp(-moveSpeed);
        }
        if (keys[87]) {// W
            controls.panForward(moveSpeed);
        }
        if (keys[83]) {// S
            controls.panForward(-moveSpeed);
        }
        if (keys[68]) {// D
            controls.panLeft(-moveSpeed);
        }
        if (keys[65]) {// A
            controls.panLeft(moveSpeed);
        }

        //copy physics world positions to graphic world ones
        for (var i = 0; i < balls.length; i++) {
            ballMeshes[i].position.copy(balls[i].position);
            ballMeshes[i].quaternion.copy(balls[i].quaternion);
        }

        controls.update();
        shadowMapSize(light);
        renderer.render(scene, camera);
        stats.update();
    }


    /*var frustum = new THREE.Frustum;
    var maxSWidth = Math.sqrt((94+50)*(94+50)+100*100)/2;
    var maxSHeight = maxSWidth;
    var rAngle = Math.atan2(50,30);
    var sm = [];
    for (var x = -maxSWidth; x < maxSWidth; x+=50) {
        for (var y = -maxSHeight; y < maxSHeight; y+=50) {
            var x1 = x*Math.cos(rAngle)-y*Math.sin(rAngle);
            var y1 = y*Math.cos(rAngle)+x*Math.sin(rAngle);
            if (x1 < (94+50)/2 && x1 > -(94+50)/2 && y1 < 50 && y1 > -50) {
                sm.push(new THREE.Vector3(x1, y1, 0));
            }
        }
    }
    console.log(sm);
    var c = new THREE.Matrix4();*/

    var raycaster = new THREE.Raycaster();

    function shadowMapSize() {
        /*frustum.setFromMatrix(c.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
        var top = -50;
        var bottom = 50;
        var left = (94+50)/2;
        var right = -(94+50)/2;
        var inview = false;
        for (var i = 0; i < sm.length; i++) {
            if (frustum.containsPoint(sm[i])) {
                if (sm[i].x > right) right = sm[i].x;
                if (sm[i].x < left) left = sm[i].x;
                if (sm[i].y > top) top = sm[i].y;
                if (sm[i].y > bottom) bottom = sm[i].y;
                inview = true;
            }
        }
        /*if (!inview) {
            light.castShadow = false;
        }else {
            light.castShadow = true;
        }*/

        var top = -50;
        var bottom = 50;
        var left = (94 + 50) / 2 + 50;
        var right = -(94 + 50) / 2 - 50;

        raycaster.setFromCamera(new THREE.Vector2(-1, -1), camera);

        var p = raycaster.intersectObjects([imesh]);
        if (p.length > 0) {
            p = p[0].point;

            if (p.x > right) right = p.x;
            if (p.x < left) left = p.x;
            if (p.y > top) top = p.y;
            if (p.y < bottom) bottom = p.y;
        }

        raycaster.setFromCamera(new THREE.Vector2(-1, 1), camera);

        p = raycaster.intersectObjects([imesh]);
        if (p.length > 0) {
            p = p[0].point;

            if (p.x > right) right = p.x;
            if (p.x < left) left = p.x;
            if (p.y > top) top = p.y;
            if (p.y < bottom) bottom = p.y;
        }

        raycaster.setFromCamera(new THREE.Vector2(1, -1), camera);

        p = raycaster.intersectObjects([imesh]);
        if (p.length > 0) {
            p = p[0].point;

            if (p.x > right) right = p.x;
            if (p.x < left) left = p.x;
            if (p.y > top) top = p.y;
            if (p.y < bottom) bottom = p.y;
        }

        raycaster.setFromCamera(new THREE.Vector2(1, 1), camera);

        p = raycaster.intersectObjects([imesh]);
        if (p.length > 0) {
            p = p[0].point;

            if (p.x > right) right = p.x;
            if (p.x < left) left = p.x;
            if (p.y > top) top = p.y;
            if (p.y < bottom) bottom = p.y;
        }


        light.shadow.camera.top = top;
        light.shadow.camera.bottom = bottom;
        light.shadow.camera.left = left;
        light.shadow.camera.right = right;
        lightH.update();
    }

    animate();
};

//start loading assets on window load
window.onload = function () {
    loadAssets();
};