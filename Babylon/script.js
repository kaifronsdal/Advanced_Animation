var box1, frame;

var createScene = function () {
    var scene = new BABYLON.Scene(engine);

    var light = new BABYLON.PointLight("Omni", new BABYLON.Vector3(0, 100, 100), scene);
    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0.8, 100, new BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    //Boxes
    box1 = BABYLON.Mesh.CreateBox("Box1", 10.0, scene);
    //var box2 = BABYLON.Mesh.CreateBox("Box2", 10.0, scene);

    var materialBox = new BABYLON.StandardMaterial("texture1", scene);
    materialBox.diffuseColor = new BABYLON.Color3(0, 1, 0);//Green
    var materialBox2 = new BABYLON.StandardMaterial("texture2", scene);

    //Applying materials
    box1.material = materialBox;
    //box2.material = materialBox2;

    //Positioning box
    //box2.position.x = 20;

    // Creation of a basic animation with box 1
    //----------------------------------------

    //Create a scaling animation at 30 FPS
    var animationBox = new BABYLON.Animation("tutoAnimation", "scaling.y", 30, BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    //Here we have chosen a loop mode, but you can change to :
    //  Use previous values and increment it (BABYLON.Animation.ANIMATIONLOOPMODE_RELATIVE)
    //  Restart from initial value (BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE)
    //  Keep the final value (BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT)

    // Animation keys
    var keys = [];
    //At the animation key 0, the value of scaling is "1"
    keys.push({
        frame: 0,
        value: 0.8
    });

    keys.push({
        frame: 5,
        value: 1
    });

    keys.push({
        frame: 45,
        value: 1
    });

    //At the animation key 100, the value of scaling is "1"
    keys.push({
        frame: 50,
        value: 0.8
    });

    //Adding keys to the animation object
    animationBox.setKeys(keys);

    var easingFunction = new BABYLON.CircleEase();

    // For each easing function, you can choose beetween EASEIN (default), EASEOUT, EASEINOUT
    easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

    // Adding easing function to my animation
    animationBox.setEasingFunction(easingFunction);

    //Then add the animation object to box1
    box1.animations.push(animationBox);

    //Finally, launch animations on box1, from key 0 to key 100 with loop activated
    frame = scene.beginAnimation(box1, 0, 100, true);

    // Creation of a manual animation with box 2
    //------------------------------------------


    setInterval(function () {

        //The color is defined at run time with random()
        box1.material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());

    }, 1000);

    return scene;
};

var canvas = document.getElementById("renderCanvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var engine = new BABYLON.Engine(canvas, true, {preserveDrawingBuffer: true, stencil: true});
var scene = createScene();
var t = 0;

engine.runRenderLoop(function () {
    if (scene) {
        box1.position.y = Math.abs(Math.sin(frame.masterFrame/Math.PI/5))*50-0.5;
        if (box1.position.y < 0) box1.position.y = 0;
        scene.render();
        t++;
    }
});

// Resize
window.addEventListener("resize", function () {
    engine.resize();
});