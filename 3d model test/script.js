var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    var gravityVector = new BABYLON.Vector3(0, 0, 0);
    var physicsPlugin = new BABYLON.CannonJSPlugin();
    scene.enablePhysics(gravityVector, physicsPlugin);

    //lights
    var light = new BABYLON.DirectionalLight("DirLight", new BABYLON.Vector3(-0.1, -1, 0.2), scene);
    light.specular = new BABYLON.Color3(0, 0, 0);
    light.position = new BABYLON.Vector3(100, 300, 200);
    light.shadowEnabled = true;

    var light2 = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), scene);
    light2.specular = new BABYLON.Color3(0, 0, 0);
    light2.intensity = 0.5;

    var light3 = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, -1, 0), scene);
    light3.diffuse = new BABYLON.Color3(0.3, 0.3, 0.3);
    light3.specular = new BABYLON.Color3(0, 0, 0);
    light3.intensity = 0.8;

    //camera
    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0.8, 200, new BABYLON.Vector3.Zero(), scene);
    camera.setTarget(new BABYLON.Vector3(0, 0, 0));
    camera.attachControl(canvas, true);

    BABYLON.SceneLoader.ImportMesh("", "./", "Simple Character (rigged).babylon", scene, function (newMeshes) {
        scene.executeWhenReady(function () {
            console.log(newMeshes);
            scene.addMesh(newMeshes[0]);
            scene.beginAnimation(scene.getSkeletonById(0), 1, 61, !0, 1);
        });
    });


    /*BABYLON.SceneLoader.Append("./", "Wasip Rig.obj", scene, function (scene) {
        console.log("test");
    });*/

    //var vbox = BABYLON.Mesh.CreateBox("box", 10.0, scene, false);

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
