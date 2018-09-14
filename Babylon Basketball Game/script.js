var createScene = function () {
    var scene = new BABYLON.Scene(engine);

    var gravityVector = new BABYLON.Vector3(0, -98.1/2, 0);
    var physicsPlugin = new BABYLON.CannonJSPlugin();
    scene.enablePhysics(gravityVector, physicsPlugin);

    //lights
    var light = new BABYLON.DirectionalLight("DirLight", new BABYLON.Vector3(-0.1, -1, 0.2), scene);
    light.specular = new BABYLON.Color3(0.2, 0.2, 0.2);
    light.position = new BABYLON.Vector3(100, 300, 200);
    light.shadowEnabled = true;

    var light2 = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), scene);
    light2.specular = new BABYLON.Color3(0, 0, 0);
    light2.intensity = 0.5;

    var light3 = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, -1, 0), scene);
    light3.diffuse = new BABYLON.Color3(0.3, 0.3, 0.3);
    light3.specular = new BABYLON.Color3(0, 0, 0);
    light3.intensity = 0.8;

    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0.8, 200, new BABYLON.Vector3.Zero(), scene);
    camera.setTarget(new BABYLON.Vector3(0, 15, 0));
    camera.attachControl(canvas, true);
    console.log(camera);


    var width = 50;
    var length = 94;

    var ground = BABYLON.MeshBuilder.CreateBox("ground", {width: width, depth: length, height: 5}, scene, false);
    var groundMaterial = new BABYLON.StandardMaterial("groundT", scene);
    //groundMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
    groundMaterial.diffuseTexture = new BABYLON.Texture("https://i.imgur.com/Pl09pku.jpg", scene);
    ground.material = groundMaterial;
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, {
        mass: 0,
        restitution: 0.9
    }, scene);

    ground.receiveShadows = true;

    //shadow map
    var shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
    shadowGenerator.useBlurExponentialShadowMap = true;

    window.addEventListener("click", function (e) {
        var x = camera.position.x;
        var y = camera.position.y;
        var z = camera.position.z;

        var ballMesh = new BABYLON.MeshBuilder.CreateSphere("sphereMesh", {diameter: 0.79583 * 2}, scene, false);
        var ballMaterial = new BABYLON.StandardMaterial("ball", scene);
        //groundMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
        ballMaterial.diffuseTexture = new BABYLON.Texture("https://i.imgur.com/GUiSp1Z.png", scene);
        ballMesh.material = ballMaterial;
        ballMesh.physicsImpostor = new BABYLON.PhysicsImpostor(ballMesh, BABYLON.PhysicsImpostor.SphereImpostor, {
            mass: 1,
            restitution: 0.9
        }, scene);
        ballMesh.position = camera.position.clone();

        var speed = 50;

        var vel = camera.getTarget().subtract(camera.position);
        vel = new Vector(vel.x, vel.y, vel.z);
        vel.normalize();
        vel.mult(speed);

        ballMesh.physicsImpostor.setLinearVelocity(vel);
        //ballMesh.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, 100, 0));
    });

    //animate
    scene.registerBeforeRender(function () {

    });

    return scene;
};

var canvas = document.getElementById("renderCanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});
var scene = createScene();

engine.runRenderLoop(function () {
    if (scene) {
        scene.render();
    }
});

// Resize
window.addEventListener("resize", function () {
    engine.resize();
});