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

    var skybox = BABYLON.MeshBuilder.CreateSphere("skyBox", {diameter: 2000}, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("https://www.babylonjs.com/assets/skybox/nebula", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;

    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0.8, 200, new BABYLON.Vector3.Zero(), scene);
    camera.setTarget(new BABYLON.Vector3(0, 15, 0));
    camera.attachControl(canvas, true);

    function Mover(x, y, z, radius, scene) {
        this.pos = new Vector(x, y, z);
        this.vel = new Vector(0, 0, 0);
        this.acc = new Vector(0, 0, 0);
        this.avel = new Vector(0, 0, 0);
        this.aacc = new Vector(0, 0, 0);
        this.apos = new Vector(0, 0, 0);
        this.mass = radius * radius * radius;
        this.radius = radius;
        this.mesh = new BABYLON.MeshBuilder.CreateBox("sphere" + Math.random(), {
            height: radius,
            width: radius,
            depth: radius
        }, scene, false);
        this.mesh.positon = this.pos;
        this.material = new BABYLON.StandardMaterial("texture1", scene);
        this.material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
        this.mesh.material = this.material;
    }

    Mover.prototype.applyForce = function (force) {
        this.acc.add(force.div(this.mass));
    };

    /*Mover.prototype.drag = function (mag) {
        var speed = this.vel.mag();

        var dragMagnitude = mag * speed * speed * this.mass / 100;
        var drag = this.vel.clone();

        drag.mult(-1);
        drag.normalize();

        drag.mult(dragMagnitude);

        this.applyForce(drag);
    };*/

    Mover.prototype.update = function () {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.mesh.position = this.pos.toBabylon();

        this.aacc = this.acc.clone().div(100);
        this.aacc.constrain(-0.01, 0.01);
        this.avel.add(this.aacc);
        this.avel.constrain(-0.3, 0.3);
        //this.apos.add(this.avel);
        this.mesh.rotate(BABYLON.Axis.X, this.avel.x, BABYLON.Space.WORLD);
        this.mesh.rotate(BABYLON.Axis.Y, this.avel.y, BABYLON.Space.WORLD);
        this.mesh.rotate(BABYLON.Axis.Z, this.avel.z, BABYLON.Space.WORLD);
        this.acc.mult(0);
    };


    function Attractor(x, y, z, radius, scene) {
        this.pos = new Vector(x, y, z);
        this.vel = new Vector(0, 0, 0);
        this.acc = new Vector(0, 0, 0);
        this.avel = new Vector(0, 0, 0);
        this.aacc = new Vector(0, 0, 0);
        this.apos = new Vector(0, 0, 0);
        this.mass = radius * radius * radius;
        this.radius = radius;
        this.mesh = new BABYLON.MeshBuilder.CreateBox("sphere" + Math.random(), {
            height: radius,
            width: radius,
            depth: radius
        }, scene, false);
        this.mesh.positon = this.pos;
        this.material = new BABYLON.StandardMaterial("texture1", scene);
        this.material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
        this.mesh.material = this.material;
    }

    Attractor.prototype.applyForce = function (force) {
        this.acc.add(force.div(this.mass));
    };

    /*Attractor.prototype.drag = function (mag) {
        var speed = this.vel.mag();

        var dragMagnitude = mag * speed * speed * this.mass / 100;
        var drag = this.vel.clone();

        drag.mult(-1);
        drag.normalize();

        drag.mult(dragMagnitude);

        this.applyForce(drag);
    };*/

    Attractor.prototype.attract = function (movers) {
        for (let i = 0; i < movers.length; i++) {
            let force = Vector.sub(this.pos, movers[i].pos);
            let distance = force.mag();
            distance = constrain(distance, 5, 25);

            force.normalize();
            let strength = (0.097 * this.mass * movers[i].mass) / (distance * distance);
            force.mult(strength/1.5);

            movers[i].applyForce(force);
        }
    };

    Attractor.prototype.update = function () {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.mesh.position = this.pos.toBabylon();

        this.aacc = this.acc.clone().div(100);
        this.aacc.constrain(-0.01, 0.01);
        this.avel.add(this.aacc);
        this.avel.constrain(-0.005, 0.005);
        this.apos.add(this.avel);
        this.mesh.rotate(BABYLON.Axis.X, this.apos.x, BABYLON.Space.WORLD);
        this.mesh.rotate(BABYLON.Axis.Y, this.apos.y, BABYLON.Space.WORLD);
        this.mesh.rotate(BABYLON.Axis.Z, this.apos.z, BABYLON.Space.WORLD);
        this.acc.mult(0);
    };


    function Repulsor(x, y, z, radius, scene) {
        this.pos = new Vector(x, y, z);
        this.vel = new Vector(0, 0, 0);
        this.acc = new Vector(0, 0, 0);
        this.avel = new Vector(0, 0, 0);
        this.aacc = new Vector(0, 0, 0);
        this.apos = new Vector(0, 0, 0);
        this.mass = radius * radius * radius;
        this.radius = radius;
        this.mesh = new BABYLON.MeshBuilder.CreateBox("sphere" + Math.random(), {
            height: radius,
            width: radius,
            depth: radius
        }, scene, false);
        this.mesh.positon = this.pos;
        this.material = new BABYLON.StandardMaterial("texture1", scene);
        this.material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
        this.mesh.material = this.material;
    }

    Repulsor.prototype.applyForce = function (force) {
        this.acc.add(force.div(this.mass));
    };

    /*Attractor.prototype.drag = function (mag) {
        var speed = this.vel.mag();

        var dragMagnitude = mag * speed * speed * this.mass / 100;
        var drag = this.vel.clone();

        drag.mult(-1);
        drag.normalize();

        drag.mult(dragMagnitude);

        this.applyForce(drag);
    };*/

    Repulsor.prototype.repulse = function (movers) {
        for (let i = 0; i < movers.length; i++) {
            let force = Vector.sub(this.pos, movers[i].pos);
            let distance = force.mag();
            distance = constrain(distance, 5, 25);

            force.normalize();
            let strength = (0.097 * this.mass * movers[i].mass) / (distance * distance);
            force.mult(-strength/3);

            movers[i].applyForce(force);
        }
    };

    Repulsor.prototype.update = function () {
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.mesh.position = this.pos.toBabylon();

        this.aacc = this.acc.clone().div(100);
        this.aacc.constrain(-0.01, 0.01);
        this.avel.add(this.aacc);
        this.avel.constrain(-0.005, 0.005);
        this.apos.add(this.avel);
        this.mesh.rotate(BABYLON.Axis.X, this.apos.x, BABYLON.Space.WORLD);
        this.mesh.rotate(BABYLON.Axis.Y, this.apos.y, BABYLON.Space.WORLD);
        this.mesh.rotate(BABYLON.Axis.Z, this.apos.z, BABYLON.Space.WORLD);
        this.acc.mult(0);
    };

    //create Movers
    var movers = [];
    for (var i = 0; i < 10; i++) {
        movers.push(new Mover((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, Math.random() * 10 + 1, scene));
    }

    //create Attractors
    var attractors = [];
    for (var i = 0; i < 1; i++) {
        attractors.push(new Attractor((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, Math.random() * 10 + 1, scene));
    }

    //create Repulsors
    var repulsors = [];
    for (var i = 0; i < 1; i++) {
        repulsors.push(new Repulsor((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, Math.random() * 10 + 1, scene));
    }

    //animate
    var centerOfMass = new Vector();
    scene.registerBeforeRender(function () {
        centerOfMass = new Vector();
        for (let i = 0; i < movers.length; i++) {
            //movers[i].drag(0.05);
            movers[i].update();
            centerOfMass.add(movers[i].pos);
        }
        centerOfMass.div(movers.length * 2);

        for (let i = 0; i < attractors.length; i++) {
            //attractors[i].drag(0.05);
            attractors[i].attract(movers);
            attractors[i].update();
            centerOfMass.add(attractors[i].pos);
        }
        centerOfMass.div(attractors.length * 2);

        for (let i = 0; i < repulsors.length; i++) {
            //attractors[i].drag(0.05);
            repulsors[i].repulse(movers);
            repulsors[i].update();
            centerOfMass.add(repulsors[i].pos);
        }
        centerOfMass.div(repulsors.length * 2);


        for (var i = 0; i < movers.length; i++) {
            //movers[i].pos.sub(centerOfMass);
        }
        for (var i = 0; i < attractors.length; i++) {
            //attractors[i].pos.sub(centerOfMass);
        }
        for (var i = 0; i < repulsors.length; i++) {
            //repulsors[i].pos.sub(centerOfMass);
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
