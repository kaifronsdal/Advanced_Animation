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
    var skybox = BABYLON.MeshBuilder.CreateSphere("skyBox", {
        diameter: 10000,
        sideOrientation: BABYLON.Mesh.BACKSIDE
    }, scene);
    skybox.rotation.x = Math.PI;
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.diffuseTexture = new BABYLON.Texture("https://i.imgur.com/EbtfXWV.jpg", scene);
    skyboxMaterial.specularTexture = new BABYLON.Texture("https://i.imgur.com/EbtfXWV.jpg", scene);
    skyboxMaterial.emissiveTexture = new BABYLON.Texture("https://i.imgur.com/EbtfXWV.png", scene);
    skyboxMaterial.ambientTexture = new BABYLON.Texture("https://i.imgur.com/EbtfXWV.png", scene);
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
        this.vel = new Vector(0, -1, 1);
        this.acc = new Vector(0, 0, 0);

        this.maxSpeed = 4;
        this.maxForce = 0.3;

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
        //check if boid is past boundary
        if (this.pos.x < -width / 2) {
            this.pos.x = width / 2;
        }
        if (this.pos.x > width / 2) {
            this.pos.x = -width / 2;
        }
        if (this.pos.y < -height / 2) {
            this.pos.y = height / 2;
        }
        if (this.pos.y > height / 2) {
            this.pos.y = -height / 2;
        }
        if (this.pos.z < -length / 2) {
            this.pos.z = length / 2;
        }
        if (this.pos.z > length / 2) {
            this.pos.z = -length / 2;
        }

        let sep = this.separate(boids).mult(2.5);
        let coh = this.cohesion(boids).mult(0.4);
        let ali = this.align(boids).mult(1.6);

        this.applyForce(sep);
        this.applyForce(coh);
        this.applyForce(ali);

        //this.acc.limit(this.maxForce);

        //update movement variables
        this.vel.add(this.acc);
        this.acc.mult(0);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        this.mesh.position = this.pos.toBabylon();
    };

    Boid.prototype.seek = function(target) {
        let desired = target;
        desired.sub(this.pos);
        var d = desired.mag();
        desired.normalize();
        if (d < 100) {
            d /= 100;
            d *= this.maxSpeed;
            desired.mult(d);
        }
        else {
            desired.mult(this.maxSpeed);
        }
        desired.sub(this.vel);
        desired.limit(this.maxforce);

        return desired;
    };

    Boid.prototype.separate = function (boids) {
        let desiredSep = 50*50;
        let sum = new Vector();
        let count = 0;

        for (var i = 0; i < boids.length; i++) {
            let dist = (this.pos.clone()).sub(boids[i].pos);
            let d = dist.magSq();


            if ((d > 0) && (d < desiredSep)) {
                count++;
                dist.normalize();
                //dist.div(Math.sqrt(d)*10);
                sum.add(dist);
            }
        }
        if (count > 0) {
            sum.div(count);
            sum.setMag(this.maxSpeed);

            let steer = Vector.sub(sum, this.vel);
            steer.limit(this.maxForce);

            return steer;
        }
        return new Vector();
    };

    Boid.prototype.cohesion = function (boids) {
        let neighborDist = 50 * 50;

        let sum = new Vector();

        let count = 0;
        for (var i = 0; i < boids.length; i++) {
            let dist = (this.pos.clone()).sub(boids[i].pos);
            let d = dist.magSq();


            if ((d > 0) && (d < neighborDist)) {
                sum.add(boids[i].pos);
                count++;
            }
        }
        if (count > 0) {
            sum.div(count);

            return this.seek(sum);
        }
        return new Vector(0, 0, 0);
    };

    Boid.prototype.align = function (boids) {
        let neighborDist = 100 * 100;

        let sum = new Vector();
        let count = 0;
        for (var i = 0; i < boids.length; i++) {
            let dist = (this.pos.clone()).sub(boids[i].pos);
            let d = dist.magSq();


            if ((d > 0) && (d < neighborDist)) {
                sum.add(boids[i].vel);
                count++;
            }
        }
        if (count > 0) {
            sum.div(boids.length);
            sum.setMag(this.maxSpeed);

            let steer = Vector.sub(sum, this.vel);
            steer.limit(this.maxForce);

            return steer;
        }
        return new Vector();
    };

    //create Boid
    boids = [];
    for (var i = 0; i < 100; i++) {
        boids.push(new Boid((Math.random() - 0.5) * 400, (Math.random() - 0.5) * 400, (Math.random() - 0.5) * 400, Math.random() * 10 + 1, scene, i));
    }

    //animate
    scene.registerBeforeRender(function () {
        for (let i = 0; i < boids.length; i++) {
            boids[i].update();
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
