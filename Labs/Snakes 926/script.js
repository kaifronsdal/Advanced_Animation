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


    var width = 300;
    var height = 300;
    var length = 300;
    //bounding box
    {
        var Bmaterial = new BABYLON.StandardMaterial("boundingMaterial", scene);
        Bmaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        Bmaterial.alpha = 0.5;

        var b1 = BABYLON.MeshBuilder.CreateBox("myBox", {height: height, width: width, depth: 1}, scene);
        b1.position.z = -150;
        /*b1.physicsImpostor = new BABYLON.PhysicsImpostor(b1, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 0.9
        }, scene);*/
        var b2 = BABYLON.MeshBuilder.CreateBox("myBox", {height: height, width: width, depth: 1}, scene);
        b2.position.z = 150;
        /*b2.physicsImpostor = new BABYLON.PhysicsImpostor(b2, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 0.9
        }, scene);*/

        var b3 = BABYLON.MeshBuilder.CreateBox("myBox", {height: height, width: 1, depth: length}, scene);
        b3.position.x = -150;
        /*b3.physicsImpostor = new BABYLON.PhysicsImpostor(b3, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 0.9
        }, scene);*/
        var b4 = BABYLON.MeshBuilder.CreateBox("myBox", {height: height, width: 1, depth: length}, scene);
        b4.position.x = 150;
        /*b4.physicsImpostor = new BABYLON.PhysicsImpostor(b4, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 0.9
        }, scene);*/

        var b5 = BABYLON.MeshBuilder.CreateBox("myBox", {height: 1, width: width, depth: length}, scene);
        b5.position.y = -150;
        /*b5.physicsImpostor = new BABYLON.PhysicsImpostor(b5, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 0.9
        }, scene);*/
        var b6 = BABYLON.MeshBuilder.CreateBox("myBox", {height: 1, width: width, depth: length}, scene);
        b6.position.y = 150;
        /*b6.physicsImpostor = new BABYLON.PhysicsImpostor(b6, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 0.9
        }, scene);*/

        b1.material = b2.material = b3.material = b4.material = b5.material = b6.material = Bmaterial;
    }

    var proj = new BABYLON.MeshBuilder.CreateSphere("sphere" + Math.random(), {
        diameter: 60
    }, scene, false);

    var material = new BABYLON.StandardMaterial("texture1", scene);
    material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
    material.alpha = 0.5;
    proj.material = material;

    var projp = new BABYLON.MeshBuilder.CreateSphere("sphere" + Math.random(), {
        diameter: 30
    }, scene, false);

    var material = new BABYLON.StandardMaterial("texture1", scene);
    material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
    material.alpha = 0.5;
    projp.material = material;


    var snakes;
    var boids;

    //mover class
    function Boid(x, y, z, radius, scene, i) {
        this.mesh = new BABYLON.MeshBuilder.CreateSphere("sphere" + Math.random(), {
            diameter: 2 * radius
        }, scene, false);
        this.mesh.position.x = x;
        this.mesh.position.y = y;
        this.mesh.position.z = z;

        this.maxSpeed = 100;
        this.maxForce = 400;

        this.radius = radius + 2;

        this.mesh.physicsImpostor = new BABYLON.PhysicsImpostor(this.mesh, BABYLON.PhysicsImpostor.SphereImpostor, {
            mass: 1,
            restitution: 0.9
        }, scene);
        this.mesh.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, 0, 1));
        this.mesh.physicsImpostor.indexm = i;


        this.oldVel = this.mesh.physicsImpostor.getLinearVelocity();

        this.material = new BABYLON.StandardMaterial("texture1", scene);
        this.material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
        this.mesh.material = this.material;

        this.theta = 0;
        this.alpha = 0;
    }

    Boid.prototype.applyForce = function (force) {
        this.mesh.physicsImpostor.applyForce(force.toBabylon(), this.mesh.getAbsolutePosition());
    };

    Boid.prototype.update = function () {
        var vel = this.mesh.physicsImpostor.getLinearVelocity();
        var pos = this.mesh.position;
        /*if (pos.x < -width / 2 || pos.x > width / 2) {
            pos.x /= Math.abs(pos.x);
            pos.x *= -1;
            pos.x *= width / 2;
        }
        if (pos.z < -length / 2 || pos.z > length / 2) {
            pos.z /= Math.abs(pos.z);
            pos.z *= -1;
            pos.z *= length / 2;
        }
        if (pos.y < -height / 2 || pos.y > height / 2) {
            pos.y /= Math.abs(pos.y);
            pos.y *= -1;
            pos.y *= height / 2;
        }

        */

        let projDist = 50;
        let projVecDir = fromBabylon(vel).normalize().mult(projDist);
        let projectVec = fromBabylon(this.mesh.position).add(projVecDir);

        this.theta += (Math.random() - 0.5)*15/180*Math.PI;
        this.alpha += (Math.random() - 0.5)*15/180*Math.PI;

        /*this.mesh.physicsImpostor.onCollideEvent = function(self, other) {
            console.log(boids[self.indexm]);
            boids[self.indexm].theta = Math.random()*Math.PI*2;
            boids[self.indexm].alpha = Math.random()*Math.PI;
        };*/

        proj.position.set(projectVec.x, projectVec.y, projectVec.z);

        let sp = new Vector(Math.cos(this.theta) * Math.sin(this.alpha), Math.cos(this.alpha) * Math.sin(this.theta), Math.cos(this.alpha));
        let projPoint = projectVec.add(sp.mult(30));

        projp.position.set(projPoint.x, projPoint.y, projPoint.z);

        let desired = projectVec.add(projPoint);
        desired.normalize();
        desired.mult(this.maxSpeed);
        desired.sub(fromBabylon(this.mesh.physicsImpostor.getLinearVelocity()));
        desired.limit(this.maxForce);
        this.applyForce(desired);
    };

    //attractor class
    function Snake(x, y, z, radius, scene) {
        this.meshs = [];

        this.material = new BABYLON.StandardMaterial("texture1", scene);
        this.material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());

        for (var i = 0; i < 10; i++) {
            this.meshs.push(new BABYLON.MeshBuilder.CreateSphere("sphere" + Math.random(), {
                diameter: 2 * radius - (i / 10) * radius * 2 + 5
            }, scene, false));

            this.meshs[i].physicsImpostor = new BABYLON.PhysicsImpostor(this.meshs[i], BABYLON.PhysicsImpostor.SphereImpostor, {
                mass: 0,
                restitution: 0.9
            }, scene);

            this.meshs[i].position.x = x;
            this.meshs[i].position.y = y;
            this.meshs[i].position.z = z;
            this.meshs[i].material = this.material;
        }
    }

    Snake.prototype.applyForce = function (force) {
        this.mesh.physicsImpostor.physicsImpostor.applyForce(force.toBabylon(), this.mesh.getAbsolutePosition());
    };

    Snake.prototype.update = function (boid) {
        for (var i = 1; i < this.meshs.length; i++) {

        }
    };

    //create Boid
    boids = [];
    for (var i = 0; i < 1; i++) {
        boids.push(new Boid((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, Math.random() * 10 + 1, scene, i));
    }

    //create Snakes
    snakes = [];
    for (var i = 0; i < 1; i++) {
        snakes.push(new Snake((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, Math.random() * 10 + 1, scene));
    }

    //animate
    scene.registerBeforeRender(function () {
        for (let i = 0; i < boids.length; i++) {
            boids[i].update();
        }

        for (let i = 0; i < snakes.length; i++) {
            snakes[i].update(boids[0]);
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
