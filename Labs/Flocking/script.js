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
    /*skyboxMaterial.diffuseTexture = new BABYLON.Texture("https://i.imgur.com/EbtfXWV.jpg", scene);
    skyboxMaterial.specularTexture = new BABYLON.Texture("https://i.imgur.com/EbtfXWV.jpg", scene);
    skyboxMaterial.emissiveTexture = new BABYLON.Texture("https://i.imgur.com/EbtfXWV.png", scene);
    skyboxMaterial.ambientTexture = new BABYLON.Texture("https://i.imgur.com/EbtfXWV.png", scene);*/
    skyboxMaterial.diffuseColor = new BABYLON.Color3.White();
    skyboxMaterial.specularColor = new BABYLON.Color3.White();
    skyboxMaterial.ambientColor = new BABYLON.Color3.White();
    skyboxMaterial.emissiveColor = new BABYLON.Color3.White();
    skybox.material = skyboxMaterial;
    var hl2 = new BABYLON.HighlightLayer("hl", scene);
    hl2.addMesh(skybox, BABYLON.Color3.White());
    hl2.blurHorizontalSize = 0.3;
    hl2.blurVerticalSize = 0.3;


    var width = 1000;
    var height = 1000;
    var length = 1000;
    //bounding box
    /*{
        var Bmaterial = new BABYLON.StandardMaterial("boundingMaterial", scene);
        Bmaterial.diffuseColor = new BABYLON.Color3(0.5, 0.5, 0.5);
        Bmaterial.alpha = 0.5;

        var b1 = BABYLON.MeshBuilder.CreateBox("myBox", {height: height, width: width, depth: 1}, scene);
        b1.position.z = -length / 2;
        /*b1.physicsImpostor = new BABYLON.PhysicsImpostor(b1, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 0.9
        }, scene);
        var b2 = BABYLON.MeshBuilder.CreateBox("myBox", {height: height, width: width, depth: 1}, scene);
        b2.position.z = length / 2;
        /*b2.physicsImpostor = new BABYLON.PhysicsImpostor(b2, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 0.9
        }, scene);

        var b3 = BABYLON.MeshBuilder.CreateBox("myBox", {height: height, width: 1, depth: length}, scene);
        b3.position.x = -width / 2;
        /*b3.physicsImpostor = new BABYLON.PhysicsImpostor(b3, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 0.9
        }, scene);
        var b4 = BABYLON.MeshBuilder.CreateBox("myBox", {height: height, width: 1, depth: length}, scene);
        b4.position.x = width / 2;
        /*b4.physicsImpostor = new BABYLON.PhysicsImpostor(b4, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 0.9
        }, scene);

        var b5 = BABYLON.MeshBuilder.CreateBox("myBox", {height: 1, width: width, depth: length}, scene);
        b5.position.y = -height / 2;
        /*b5.physicsImpostor = new BABYLON.PhysicsImpostor(b5, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 0.9
        }, scene);
        var b6 = BABYLON.MeshBuilder.CreateBox("myBox", {height: 1, width: width, depth: length}, scene);
        b6.position.y = height / 2;
        /*b6.physicsImpostor = new BABYLON.PhysicsImpostor(b6, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 0,
            restitution: 0.9
        }, scene);

        b1.material = b2.material = b3.material = b4.material = b5.material = b6.material = Bmaterial;
    }*/

    var boids;
    var cohw = 5;
    var aliw = 10;
    var sepw = 1;
    var num = 100;

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

        this.maxSpeed = 1;
        this.maxForce = 0.01;

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
        let wallDist = 300;
        let wallForce = 3;
        //check if boid is past boundary
        if (this.pos.x < -width / 2 + wallDist) {
            //this.pos.x = width / 2;
            let desired = new Vector(this.maxSpeed - this.vel.x, 0, 0);
            desired.limit(this.maxForce * wallForce);
            this.applyForce(desired);
        }
        if (this.pos.x > width / 2 - wallDist) {
            //this.pos.x = -width / 2;
            let desired = new Vector(this.vel.x - this.maxSpeed, 0, 0);
            desired.limit(this.maxForce * wallForce);
            this.applyForce(desired);
        }
        if (this.pos.y < -height / 2 + wallDist) {
            //this.pos.y = height / 2;
            let desired = new Vector(0, this.maxSpeed - this.vel.y, 0);
            desired.limit(this.maxForce * wallForce);
            this.applyForce(desired);
        }
        if (this.pos.y > height / 2 - wallDist) {
            //this.pos.y = -height / 2;
            let desired = new Vector(0, this.vel.y - this.maxSpeed, 0);
            desired.limit(this.maxForce * wallForce);
            this.applyForce(desired);
        }
        if (this.pos.z < -length / 2 + wallDist) {
            //this.pos.z = length / 2;
            let desired = new Vector(0, 0, this.maxSpeed - this.vel.z);
            desired.limit(this.maxForce * wallForce);
            this.applyForce(desired);
        }
        if (this.pos.z > length / 2 - wallDist) {
            //this.pos.z = -length / 2;
            let desired = new Vector(0, 0, this.vel.z - this.maxSpeed);
            desired.limit(this.maxForce * wallForce);
            this.applyForce(desired);
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
        let c = Vector.angleBetween(new Vector(0, 1, 0), this.binorm) * 2 - Math.PI;
        this.curbinormangle -= c > -10 ? (this.curbinormangle - c) / 50 : 0;

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
                repulse.div(d*2);
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

        //steer toward average positions for cohesion
        let steer = Vector.sub(posSum, this.pos);
        steer.limit(this.maxForce);
        let coh = steer;

        let sep = posSum2;
        this.acc.add(ali.mult(aliw));
        this.acc.add(coh.mult(cohw));
        this.acc.add(sep.mult(sepw));
    };

    //create Boid
    boids = [];
    for (var i = 0; i < num; i++) {
        boids.push(new Boid((Math.random() - 0.5) * 400, (Math.random() - 0.5) * 400, (Math.random() - 0.5) * 400, Math.random() * 10 + 1, scene, i));
    }

    //animate
    scene.registerBeforeRender(function () {
        for (let i = 0; i < boids.length; i++) {
            boids[i].update();
        }
    });

    //sliders
    var slider = document.getElementById("coh");
    var output = document.getElementById("output");
    output.innerHTML = "&#160;5.00";

    slider.oninput = function () {
        cohw = parseFloat(this.value) / 1000;
        output.innerHTML = Math.abs(parseFloat(this.value / 100));
        if (output.innerHTML.length === 1) output.innerHTML += ".00";
        if (output.innerHTML.length === 2) output.innerHTML += ".0";
        if (output.innerHTML.length === 3) output.innerHTML += "0";
        if (this.value < 0) output.innerHTML = "-" + output.innerHTML;
        else output.innerHTML = "&#160;" + output.innerHTML
    };

    var slider2 = document.getElementById("ali");
    var output2 = document.getElementById("output2");
    output2.innerHTML = "&#160;10.0";

    slider2.oninput = function () {
        aliw = parseFloat(this.value) / 1000;
        output2.innerHTML = Math.abs(parseFloat(this.value / 100));
        if (output2.innerHTML.length === 1) output2.innerHTML += ".00";
        if (output2.innerHTML.length === 2) output2.innerHTML += ".0";
        if (output2.innerHTML.length === 3) output2.innerHTML += "0";
        if (this.value < 0) output2.innerHTML = "-" + output2.innerHTML;
        else output2.innerHTML = "&#160;" + output2.innerHTML
    };

    var slider3 = document.getElementById("sep");
    var output3 = document.getElementById("output3");
    output3.innerHTML = "&#160;1.00";

    slider3.oninput = function () {
        sepw = parseFloat(this.value) / 1000;
        output3.innerHTML = Math.abs(parseFloat(this.value / 100));
        if (output3.innerHTML.length === 1) output3.innerHTML += ".00";
        if (output3.innerHTML.length === 2) output3.innerHTML += ".0";
        if (output3.innerHTML.length === 3) output3.innerHTML += "0";
        if (this.value < 0) output3.innerHTML = "-" + output3.innerHTML;
        else output3.innerHTML = "&#160;" + output3.innerHTML
    };

    var slider4 = document.getElementById("num");
    var output4 = document.getElementById("output4");
    output4.innerHTML = "100&#160;&#160;";

    slider4.oninput = function () {
        num = parseFloat(this.value);
        let i = 0;
        while(boids.length !== num) {
            i++;
            if (boids.length > num) {
                boids[boids.length-1].mesh.dispose();
                boids.pop();
            }
            if (boids.length < num) {
                boids.push(new Boid((Math.random() - 0.5) * 400, (Math.random() - 0.5) * 400, (Math.random() - 0.5) * 400, Math.random() * 10 + 1, scene, num-1));
            }
        }
        output4.innerHTML = parseFloat(this.value);
        if (output4.innerHTML.length === 1) output4.innerHTML += "&#160;&#160;&#160;&#160;&#160;&#160;";
        if (output4.innerHTML.length === 2) output4.innerHTML += "&#160;&#160;&#160;&#160;";
        if (output4.innerHTML.length === 3) output4.innerHTML += "&#160;&#160;";
    };

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
        //var hl = new BABYLON.HighlightLayer("hl", scene);
        //hl.addMesh(models.wolf, BABYLON.Color3.Black());
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
