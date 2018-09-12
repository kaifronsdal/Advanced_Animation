var createScene = function () {
    var scene = new BABYLON.Scene(engine);

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


    var width = 200;
    var length = 200;

    var ground = BABYLON.Mesh.CreateGround("ground", width, length, 1, scene, false);
    var groundMaterial = new BABYLON.StandardMaterial("groundT", scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(1, 1, 1);
    ground.material = groundMaterial;

    ground.receiveShadows = true;

    //shadow map
    var shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
    shadowGenerator.useBlurExponentialShadowMap = true;

    function Mover(x, y, z, radius, scene) {
        this.pos = new Vector(x, y, z);
        this.vel = new Vector(0, 0, 0);
        this.acc = new Vector(0, 0, 0);
        this.mass = radius * radius * radius;
        this.radius = radius;
        this.mesh = new BABYLON.MeshBuilder.CreateSphere("sphere" + Math.random(), {diameter: radius * 2}, scene, false);
        this.mesh.positon = this.pos;
        this.material = new BABYLON.StandardMaterial("texture1", scene);
        this.material.diffuseColor = new BABYLON.Color3(1, 0, 0);
        this.mesh.material = this.material;
        shadowGenerator.addShadowCaster(this.mesh);
    }

    Mover.prototype.applyForce = function (force) {
        this.acc.add(force.div(this.mass));
    };

    Mover.prototype.friction = function () {
        var c = 0.05;//coefficient of friction
        var normal = 1;//normal force
        var frictionMag = c * normal;

        var friction = this.velocity.clone();
        friction.mult(-1);
        friction.normalize();

        friction.mult(frictionMag);

        this.applyForce(friction);
    };

    Mover.prototype.drag = function (mag) {
        var speed = this.vel.mag();

        var dragMagnitude = mag * speed * speed * this.mass / 100;
        var drag = this.vel.clone();

        drag.mult(-1);
        drag.normalize();

        drag.mult(dragMagnitude);

        this.applyForce(drag);
    };

    Mover.prototype.update = function () {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.mesh.position = this.pos.toBabylon();
        this.acc.mult(0);

        var restitution = 0.9;

        //check edges
        if (this.pos.x < -width / 2 + this.radius || this.pos.x > width / 2 - this.radius) {
            this.vel.x *= -restitution;
            if (this.pos.x > 0) this.pos.x = width / 2 - this.radius;
            else this.pos.x = -width / 2 + this.radius;
        }
        if (this.pos.z < -length / 2 + this.radius || this.pos.z > length / 2 - this.radius) {
            this.vel.z *= -restitution;
            if (this.pos.z > 0) this.pos.z = width / 2 - this.radius;
            else this.pos.z = -length / 2 + this.radius;
        }
        if (this.pos.y < this.radius) {
            this.vel.y *= -restitution;
            this.pos.y = this.radius;
        }
    };

    //create Movers
    var movers = [];
    for (var i = 0; i < 10; i++) {
        movers.push(new Mover((Math.random() - 0.5) * 90, (Math.random()) * 50 + 200, (Math.random() - 0.5) * 90, Math.random() * 10 + 5, scene));
        movers[i].applyForce(new Vector(Math.random() * 1000 - 500, Math.random() * 1000 - 5000, Math.random() * 1000 - 500));
    }

    var water = new BABYLON.MeshBuilder.CreateBox("water", {height: 50, width: width, depth: length});
    water.position.y = 25;
    var material = new BABYLON.StandardMaterial("waterMaterial", scene);
    material.diffuseColor = new BABYLON.Color3(0, 0, 1);
    material.alpha = 0.5;
    water.material = material;

    //animate
    scene.registerBeforeRender(function () {
        for (var i = 0; i < movers.length; i++) {
            movers[i].applyForce(new Vector(0, -0.098 * movers[i].mass, 0));
            if (document.getElementById("wind").checked) movers[i].applyForce(new Vector(10, 0, 0));

            if (movers[i].pos.y < 50) {
                movers[i].drag(4);
            }

            movers[i].update();
        }
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