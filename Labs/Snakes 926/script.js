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

    //skybox
    var skybox = BABYLON.MeshBuilder.CreateSphere("skyBox", {diameter: 10000}, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("https://www.babylonjs.com/assets/skybox/nebula", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;

    //camera
    var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0.8, 200, new BABYLON.Vector3.Zero(), scene);
    camera.setTarget(new BABYLON.Vector3(0, 15, 0));
    camera.attachControl(canvas, true);


    var width = 1000;
    var height = 1000;
    var length = 1000;
    //bounding box
    {
        var Bmaterial = new BABYLON.StandardMaterial("boundingMaterial", scene);
        Bmaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        Bmaterial.alpha = 0.5;

        var b1 = BABYLON.MeshBuilder.CreateBox("myBox", {height: height, width: width, depth: 1}, scene);
        b1.position.z = -length / 2;
        /*b1.physicsImpostor = new BABYLON.PhysicsImpostor(b1, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 0.9
        }, scene);*/
        var b2 = BABYLON.MeshBuilder.CreateBox("myBox", {height: height, width: width, depth: 1}, scene);
        b2.position.z = length / 2;
        /*b2.physicsImpostor = new BABYLON.PhysicsImpostor(b2, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 0.9
        }, scene);*/

        var b3 = BABYLON.MeshBuilder.CreateBox("myBox", {height: height, width: 1, depth: length}, scene);
        b3.position.x = -width / 2;
        /*b3.physicsImpostor = new BABYLON.PhysicsImpostor(b3, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 0.9
        }, scene);*/
        var b4 = BABYLON.MeshBuilder.CreateBox("myBox", {height: height, width: 1, depth: length}, scene);
        b4.position.x = width / 2;
        /*b4.physicsImpostor = new BABYLON.PhysicsImpostor(b4, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 0.9
        }, scene);*/

        var b5 = BABYLON.MeshBuilder.CreateBox("myBox", {height: 1, width: width, depth: length}, scene);
        b5.position.y = -height / 2;
        /*b5.physicsImpostor = new BABYLON.PhysicsImpostor(b5, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 0.9
        }, scene);*/
        var b6 = BABYLON.MeshBuilder.CreateBox("myBox", {height: 1, width: width, depth: length}, scene);
        b6.position.y = height / 2;
        /*b6.physicsImpostor = new BABYLON.PhysicsImpostor(b6, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 0.9
        }, scene);*/

        b1.material = b2.material = b3.material = b4.material = b5.material = b6.material = Bmaterial;
    }


    var snakes;
    var boids;

    //boid class
    function Boid(x, y, z, radius, scene, i) {
        this.mesh = new BABYLON.MeshBuilder.CreateSphere("sphere" + Math.random(), {
            diameter: 2 * radius
        }, scene, false);
        this.mesh.position.x = x;
        this.mesh.position.y = y;
        this.mesh.position.z = z;

        this.pos = new Vector(x, y, z);
        this.vel = new Vector(0, 0, 1);
        this.acc = new Vector(0, 0, 0);

        this.maxSpeed = 40;
        this.maxForce = 0.1;

        this.radius = radius + 2;

        this.mesh.physicsImpostor = new BABYLON.PhysicsImpostor(this.mesh, BABYLON.PhysicsImpostor.SphereImpostor, {
            mass: 1,
            restitution: 0.9
        }, scene);

        this.material = new BABYLON.StandardMaterial("texture1", scene);
        this.material.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());
        this.mesh.material = this.material;

        this.theta = 0;
        this.alpha = 0;
    }

    Boid.prototype.applyForce = function (force) {
        this.acc.add(force);
    };

    Boid.prototype.update = function () {
        //check edges
        if (this.pos.x < -width / 2 || this.pos.x > width / 2) {
            this.pos.x /= Math.abs(this.pos.x);
            this.pos.x *= -1;
            this.pos.x *= width / 2;
        }
        if (this.pos.z < -length / 2 || this.pos.z > length / 2) {
            this.pos.z /= Math.abs(this.pos.z);
            this.pos.z *= -1;
            this.pos.z *= length / 2;
        }
        if (this.pos.y < -height / 2 || this.pos.y > height / 2) {
            this.pos.y /= Math.abs(this.pos.y);
            this.pos.y *= -1;
            this.pos.y *= height / 2;
        }

        //steer in toward random point projected in front of boid
        let projDist = 50;
        let projVecDir = this.vel.clone().normalize().mult(projDist);
        let projectVec = this.pos.clone().add(projVecDir);

        this.theta += (Math.random() - 0.5) * 2 * 15 / 180 * Math.PI;
        this.alpha += (Math.random() - 0.5) * 2 * 15 / 180 * Math.PI;

        let sp = new Vector(Math.cos(this.theta) * Math.sin(this.alpha), Math.cos(this.alpha) * Math.sin(this.theta), Math.cos(this.alpha));
        let projPoint = projectVec.add(sp.mult(30));

        let desired = projPoint.sub(this.pos);
        desired.normalize();
        desired.mult(this.maxSpeed);
        desired.limit(this.maxForce / 10);
        this.applyForce(desired);

        //update movement variables
        this.vel.add(this.acc);
        this.acc.mult(0);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel.div(10));
        this.mesh.position = this.pos.toBabylon();
    };

    //snake class
    function Snake(x, y, z, radius, scene) {
        this.meshs = [];
        this.distances = [];
        this.points = [];

        this.materialt = new BABYLON.StandardMaterial("texture1", scene);
        this.materialt.alpha = 0;
        this.material = new BABYLON.StandardMaterial("texture1", scene);
        this.material.diffuseColor = new BABYLON.Color3(0.3, 0.5, 0.1);
        this.material.specularColor = new BABYLON.Color3(0,0,0);

        for (var i = 0; i < 10; i++) {
            this.meshs.push(new BABYLON.MeshBuilder.CreateSphere("sphere" + Math.random(), {
                diameter: 4 * radius
            }, scene, false));

            this.meshs[i].physicsImpostor = new BABYLON.PhysicsImpostor(this.meshs[i], BABYLON.PhysicsImpostor.SphereImpostor, {
                mass: 0.1,
                restitution: 0
            }, scene);

            this.distances.push(radius);

            this.meshs[i].position.x = x + 20 * i;
            this.meshs[i].position.y = y;
            this.meshs[i].position.z = z;
            this.points.push(new BABYLON.Vector3(x + 20 * i, y, z));
            this.meshs[i].material = this.materialt;
        }

        this.meshs[0].material = this.material;

        this.shape = [];

        for (var i = 0; i < 21; i++) {
            this.shape.push(new BABYLON.Vector3(Math.cos((i / 20) * Math.PI * 2), Math.sin((i / 20) * Math.PI * 2), 0));
        }
        this.scaling = function (i, distance) {
            return radius*2 - (i / 25) * radius;
        };

        this.catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(this.points, 5, false);

        this.extrusion = BABYLON.MeshBuilder.ExtrudeShapeCustom("star", {
            shape: this.shape,
            path: this.catmullRom.getPoints(),
            scaleFunction: this.scaling,
            sideOrientation: BABYLON.Mesh.DOUBLESIDE,
            updatable: true
        }, scene);

        this.extrusion.material = this.material;

        this.maxSpeed = 200;
        this.maxForce = 10 * this.meshs[0].physicsImpostor.mass;
    }

    Snake.prototype.applyForce = function (force, j) {
        this.meshs[j].physicsImpostor.applyForce(force.toBabylon(), this.meshs[j].getAbsolutePosition());
    };

    Snake.prototype.update = function (boid) {
        let target = boid.pos.clone();
        let desired = Vector.sub(target, fromBabylon(this.meshs[0].position));
        desired.normalize();
        desired.mult(this.maxSpeed / 2);
        let steer = Vector.sub(desired, fromBabylon(this.meshs[0].physicsImpostor.getLinearVelocity()));
        steer.limit(this.maxForce);
        this.applyForce(steer, 0);
        this.points[0] = this.meshs[0].position;
        for (var i = 1; i < this.meshs.length; i++) {
            /*let d = Vector.sub(fromBabylon(this.meshs[i].position), fromBabylon(this.meshs[i - 1].position));
            let r = d.mag() / ((this.distances[i] + this.distances[i - 1]) / 4) - 1;
            //if (d.mag() < this.distances[i]) r = 0;
            d.normalize();
            this.meshs[i].position.x -= d.x * r;
            this.meshs[i].position.y -= d.y * r;
            this.meshs[i].position.z -= d.z * r;*/

            let target = fromBabylon(this.meshs[i - 1].position);
            let desired = Vector.sub(target, fromBabylon(this.meshs[i].position));
            let d = desired.dot(desired);
            if (d > 30) {
                desired.normalize();
                desired.mult(this.maxSpeed);
                let steer = Vector.sub(desired, fromBabylon(this.meshs[i].physicsImpostor.getLinearVelocity()));
                steer.limit(this.maxForce);
                this.applyForce(steer, i);
            }
            this.points[i] = this.meshs[i].position;
        }

        this.catmullRom = BABYLON.Curve3.CreateCatmullRomSpline(this.points, 5, false);

        this.extrusion = BABYLON.MeshBuilder.ExtrudeShapeCustom("star", {
            shape: this.shape,
            path: this.catmullRom.getPoints(),
            scaleFunction: this.scaling,
            instance: this.extrusion
        });
    };

    function closestBoid(snake, boids) {
        var ind = 0;
        var dist = Number.MAX_VALUE;
        for (var i = 0; i < boids.length; i++) {
            var td = Math.pow(snake.meshs[0].position.x-boids[i].mesh.position.x, 2) + Math.pow(snake.meshs[0].position.y-boids[i].mesh.position.y, 2) + Math.pow(snake.meshs[0].position.z-boids[i].mesh.position.z, 2);
            if (td < dist) {
                dist = td;
                ind = i;
            }
        }
        return ind;
    }

    //create Boid
    boids = [];
    for (var i = 0; i < 10; i++) {
        boids.push(new Boid((Math.random() - 0.5) * width, (Math.random() - 0.5) * height, (Math.random() - 0.5) * length, Math.random() * 10 + 1, scene, i));
    }

    //create Snakes
    snakes = [];
    for (var i = 0; i < 10; i++) {
        snakes.push(new Snake((Math.random() - 0.5) * width, (Math.random() - 0.5) * height, (Math.random() - 0.5) * length, 2.3, scene));
    }

    //animate
    scene.registerBeforeRender(function () {
        for (let i = 0; i < boids.length; i++) {
            boids[i].update();
        }

        for (let i = 0; i < snakes.length; i++) {
            let c = closestBoid(snakes[i], boids);
            snakes[i].update(boids[c]);
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
