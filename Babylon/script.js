var box, animationBoxHelper, animationBox, camera, shadowGenerator;

var createScene = function () {
    var scene = new BABYLON.Scene(engine);

    var light = new BABYLON.DirectionalLight("DirLight", new BABYLON.Vector3(-1, -1, 0.5), scene);
    light.specular = new BABYLON.Color3(0.2, 0.2, 0.2);
    light.position.set(50, 100, 100);

    var light2 = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), scene);
    light2.specular = new BABYLON.Color3(0, 0, 0);

    var light3 = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, -1, 0), scene);
    light3.diffuse = new BABYLON.Color3(0.3, 0.3, 0.3);
    light3.specular = new BABYLON.Color3(0, 0, 0);


    camera = new BABYLON.ArcRotateCamera("Camera", 0, 0.8, 100, new BABYLON.Vector3.Zero(), scene);
    camera.setTarget(new BABYLON.Vector3(0, 15, 0));
    camera.attachControl(canvas, true);

    //Box
    box = BABYLON.Mesh.CreateBox("box", 10.0, scene);

    //box material
    var materialBox = new BABYLON.StandardMaterial("texture1", scene);
    materialBox.diffuseColor = new BABYLON.Color3(0, 1, 0);

    //Applying materials
    box.material = materialBox;


    //shadow map
    shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
    shadowGenerator.getShadowMap().renderList.push(box);
    shadowGenerator.useExponentialShadowMap = true;

    //create ground
    var ground = BABYLON.Mesh.CreateGround("ground", 100, 100, 1, scene, false);
    var groundMaterial = new BABYLON.StandardMaterial("ground", scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
    groundMaterial.specularColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    ground.material = groundMaterial;

    ground.receiveShadows = true;

    //Create a scaling animation at 30 FPS
    animationBox = new BABYLON.Animation("Animation", "scaling", 30, BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

    // Animation keys
    var keys = [];
    {
        keys.push({
            frame: 0,
            value: new BABYLON.Vector3(1.25, 0.7, 1.25)
        });

        keys.push({
            frame: 7,
            value: new BABYLON.Vector3(0.9, 1.1, 0.9)
        });

        keys.push({
            frame: 15,
            value: new BABYLON.Vector3(1.05, 0.95, 1.05)
        });

        keys.push({
            frame: 20,
            value: new BABYLON.Vector3(0.95, 1.05, 0.95)
        });

        keys.push({
            frame: 27,
            value: new BABYLON.Vector3(1.02, 0.97, 1.02)
        });

        keys.push({
            frame: 34,
            value: new BABYLON.Vector3(0.98, 1.02, 0.97)
        });

        keys.push({
            frame: 37,
            value: new BABYLON.Vector3(1.01, 0.99, 1.01)
        });

        keys.push({
            frame: 43,
            value: new BABYLON.Vector3(0.99, 1.01, 0.99)
        });

        keys.push({
            frame: 46,
            value: new BABYLON.Vector3(1.01, 0.99, 1.01)
        });

        keys.push({
            frame: 47,
            value: new BABYLON.Vector3(0.99, 1.01, 0.99)
        });

        keys.push({
            frame: 50,
            value: new BABYLON.Vector3(1.2, 0.7, 1.2)
        });
    }

    //Adding keys to the animation object
    animationBox.setKeys(keys);

    var easingFunction = new BABYLON.CubicEase();

    // For each easing function, you can choose beetween EASEIN (default), EASEOUT, EASEINOUT
    easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

    // Adding easing function to my animation
    animationBox.setEasingFunction(easingFunction);

    //Then add the animation object to box
    box.animations.push(animationBox);

    //Finally, launch animations on box, from key 0 to key 100 with loop activated
    animationBoxHelper = scene.beginAnimation(box, 0, 100, true);
    return scene;
};

var canvas = document.getElementById("renderCanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});
var scene = createScene();

engine.runRenderLoop(function () {
    if (scene) {
        if (animationBoxHelper.masterFrame % animationBoxHelper.toFrame < 0.5)
            box.material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
        box.position.y = Math.abs(Math.sin(animationBoxHelper.masterFrame / animationBoxHelper.toFrame * Math.PI * 2) + 0.01) * 50 - 1;
        if (box.position.y < 5 * box._scaling.y) box.position.y = 5 * box._scaling.y;

        scene.render();
    }
});

// Resize
window.addEventListener("resize", function () {
    engine.resize();
});