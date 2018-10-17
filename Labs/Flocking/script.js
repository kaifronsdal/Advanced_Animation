var models = {};

var createScene = function () {
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
        this.mesh = i === 0 ? models.wolf : models.wolf.createInstance("i" + i);
        this.rotation = new Vector();
        this.tang = new Vector();
        this.curbinormangle = 0;
        this.mesh.position.x = x;
        this.mesh.position.y = y;
        this.mesh.position.z = z;

        this.pos = new Vector(x, y, z);
        this.vel = new Vector(0, -1, 1);
        this.acc = new Vector(0, 0, 0);

        this.maxSpeed = 4;
        this.maxForce = 0.03;

        this.radius = radius + 2;

        this.mesh.physicsImpostor = new BABYLON.PhysicsImpostor(this.mesh, BABYLON.PhysicsImpostor.SphereImpostor, {
            mass: 1,
            restitution: 0.9
        }, scene);

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

        this.flockOpt(boids);

        //update movement variables
        this.vel.add(this.acc);
        //this.vel.limit(this.maxSpeed);
        this.vel.setMag(this.maxSpeed);
        this.pos.add(this.vel);
        this.mesh.position = this.pos.toBabylon();
        //rotate
        this.rotation = this.vel.clone();
        //approximate binormal vector to find angle to rotate dog on roll axis
        let oldtang = this.tang.clone();
        this.tang = this.vel.clone().unit();
        let norm = this.tang.clone().sub(oldtang);
        this.binorm = Vector.cross(this.tang, norm);
        let c = Vector.angleBetween(new Vector(0, 1, 0), this.binorm)*2-Math.PI;
        this.curbinormangle -= c > - 10 ? (this.curbinormangle - c)/50 : 0;

        this.mesh.lookAt(this.rotation.add(this.pos).toBabylon(), 0, 0, this.curbinormangle);
        this.acc.mult(0);
    };

    Boid.prototype.flockOpt = function (boids) {
        let neighborDist = 100;
        //align
        let velSum = new Vector();
        //cohesion
        let posSum = new Vector();
        //separate
        let posSum2 = new Vector();
        let repulse;

        let count = 0;
        for (var i = 0; i < boids.length; i++) {
            let b = boids[i];
            let d = Vector.dist(this.pos, b.pos);

            if (d > 0 && d <= neighborDist) {
                //sum velocities
                velSum.add(b.vel);
                //sum positions
                posSum.add(b.pos);
                //for each pair, this + a boid, find the unit vector between them and scale its magnitude based on distance
                repulse = Vector.sub(this.pos, b.pos);
                repulse.normalize();
                repulse.div(d);
                posSum2.add(repulse);
                count++;
            }
        }
        if (count > 0) {
            //average velocities and positions
            velSum.div(count);
            velSum.limit(this.maxForce);
            posSum.div(count);
        }
        let ali = velSum;

        //steer toward average positions
        let steer = Vector.sub(posSum, this.pos);
        steer.limit(this.maxForce);
        let coh = steer;

        let sep = posSum2;
        this.acc.add(Vector.mult(ali, 1));
        this.acc.add(Vector.mult(coh, 3));
        this.acc.add(Vector.mult(sep, 1));
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
var scene = new BABYLON.Scene(engine);
//camera
var camera = new BABYLON.ArcRotateCamera("Camera", 0, 0.8, 200, new BABYLON.Vector3.Zero(), scene);
camera.setTarget(new BABYLON.Vector3(0, 0, 0));
camera.attachControl(canvas, true);

BABYLON.SceneLoader.ImportMesh("", "./", "Wolf.babylon", scene, function (newMeshes) {
    scene.executeWhenReady(function () {
        models.wolf = newMeshes[0];
        models.wolf.scaling = new BABYLON.Vector3(5, 5, 5);
        createScene();
    });
});

engine.runRenderLoop(function () {
    if (scene) {
        scene.render();
    }
});

// Resize
window.addEventListener("resize", function () {
    engine.resize();
});
