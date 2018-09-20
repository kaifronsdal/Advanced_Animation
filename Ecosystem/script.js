var createScene = function () {
    var scene = new BABYLON.Scene(engine);
    var gravityVector = new BABYLON.Vector3(0, 0, 0);
    var physicsPlugin = new BABYLON.CannonJSPlugin();
    scene.enablePhysics(gravityVector, physicsPlugin);
    var physicsHelper = new BABYLON.PhysicsHelper(scene);

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

    /*var camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 0, -10), scene);

    camera.setTarget(BABYLON.Vector3.Zero());

    camera.attachControl(canvas, true);*/

    var width = 300;
    var height = 300;
    var depth = 300;

    function Mover(x, y, z, radius, scene) {
        this.mesh = new BABYLON.MeshBuilder.CreateSphere("sphere" + Math.random(), {
            diameter: 2*radius
        }, scene, false);
        this.mesh.position.x = x;
        this.mesh.position.y = y;
        this.mesh.position.z = z;

        this.mesh.physicsImpostor = new BABYLON.PhysicsImpostor(this.mesh, BABYLON.PhysicsImpostor.SphereImpostor, {
            mass: 1,
            restitution: 0.9
        }, scene);
        this.material = new BABYLON.StandardMaterial("texture1", scene);
        this.material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
        this.mesh.material = this.material;
    }

    Mover.prototype.applyForce = function (force) {
        this.mesh.physicsImpostor.physicsImpostor.applyForce(force.toBabylon(), this.mesh.getAbsolutePosition());
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

        //check edges

    };


    function Attractor(x, y, z, radius, scene) {
        this.mesh = new BABYLON.MeshBuilder.CreateSphere("sphere" + Math.random(), {
            diameter: 2*radius
        }, scene, false);
        this.mesh.position.x = x;
        this.mesh.position.y = y;
        this.mesh.position.z = z;

        this.mesh.physicsImpostor = new BABYLON.PhysicsImpostor(this.mesh, BABYLON.PhysicsImpostor.SphereImpostor, {
            mass: 0,
            restitution: 0.9
        }, scene);

        this.gravitationalFieldEvent = physicsHelper.gravitationalField(
            this.mesh.position,
            75,
            5,
            1
        );
        this.gravitationalFieldEvent.enable();

        this.material = new BABYLON.StandardMaterial("texture1", scene);
        this.material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
        this.mesh.material = this.material;
    }

    Attractor.prototype.applyForce = function (force) {
        this.mesh.physicsImpostor.physicsImpostor.applyForce(force.toBabylon(), this.mesh.getAbsolutePosition());
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
            let d2 = (this.pos.x - movers[i].pos.x) * (this.pos.x - movers[i].pos.x) + (this.pos.y - movers[i].pos.y) * (this.pos.y - movers[i].pos.y);
            if (d2 < 75 * 75) {
                distance = constrain(distance, 5, 75);

                force.normalize();
                let strength = (0.097 * this.mass * movers[i].mass) / (distance * distance);
                force.mult(strength / 1.5);

                movers[i].applyForce(force);
            }
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
        this.mesh = new BABYLON.MeshBuilder.CreateSphere("sphere" + Math.random(), {
            diameter: 2*radius
        }, scene, false);
        this.mesh.position.x = x;
        this.mesh.position.y = y;
        this.mesh.position.z = z;

        this.mesh.physicsImpostor = new BABYLON.PhysicsImpostor(this.mesh, BABYLON.PhysicsImpostor.SphereImpostor, {
            mass: 0,
            restitution: 0.9
        }, scene);

        this.gravitationalFieldEvent = physicsHelper.gravitationalField(
            this.mesh.position,
            75,
            -5,
            1
        );
        this.gravitationalFieldEvent.enable();

        this.material = new BABYLON.StandardMaterial("texture1", scene);
        this.material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
        this.mesh.material = this.material;
    }

    Repulsor.prototype.applyForce = function (force) {
        this.mesh.physicsImpostor.physicsImpostor.applyForce(force.toBabylon(), this.mesh.getAbsolutePosition());
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
            let d2 = (this.pos.x - movers[i].pos.x) * (this.pos.x - movers[i].pos.x) + (this.pos.y - movers[i].pos.y) * (this.pos.y - movers[i].pos.y);
            if (d2 < 50 * 50) {
                distance = constrain(distance, 5, 50);

                force.normalize();
                let strength = (0.097 * this.mass * movers[i].mass) / (distance * distance);
                force.mult(-strength / 5);

                movers[i].applyForce(force);
            }
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

    var waterU = new BABYLON.MeshBuilder.CreateSphere("waterU", {diameter: 100}, scene);
    waterU.position = repulsors[0].mesh.position;
    var Wmaterial = new BABYLON.StandardMaterial("waterMaterial", scene);
    Wmaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 1);
    Wmaterial.alpha = 0.5;
    waterU.material = Wmaterial;

    //animate
    scene.registerBeforeRender(function () {
        for (let i = 0; i < movers.length; i++) {
            //movers[i].drag(0.05);
            movers[i].update();
        }

        for (let i = 0; i < attractors.length; i++) {
            //attractors[i].drag(0.05);
            //attractors[i].attract(movers);
            //attractors[i].update();
        }

        for (let i = 0; i < repulsors.length; i++) {
            //repulsors[i].drag(0.05);
            //repulsors[i].repulse(movers);
            //repulsors[i].update();
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
