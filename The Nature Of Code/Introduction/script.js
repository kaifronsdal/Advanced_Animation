var version = 'randomWalk';
var cleanSlate = true;
var time = 0;
var prevState = version;

function setup() {
     createCanvas(window.innerWidth, window.innerHeight);
     var rad = document.getElementsByName('state');
     var con = document.getElementsByName('stateC');
     var sol = document.getElementsByName('stateS');


     toggleButtons('walkerButtons');

     for (var i = 0; i < rad.length; i++) {
          rad[i].onclick = function () {
               prevState = version;
               version = this.value;
               cleanSlate = true;
          };
     }

     for (var i = 0; i < con.length; i++) {
          con[i].onclick = function () {
               toggleButtons(this.value);
               for (var c = 0; c < sol.length; c++) {
                    sol[c].checked = false;
               }
          };
     }

     for (var i = 0; i < sol.length; i++) {
          sol[i].onclick = function () {
               prevState = version;
               version = this.value;
               cleanSlate = true;
               toggleButtons('');
               for (var c = 0; c < con.length; c++) {
                    con[c].checked = false;
               }
          };
     }
}
function toggleButtons(cur) {
     var a = document.getElementsByClassName("speButtons");
     for (var i = 0; i < a.length; i++) {
          if (a[i].childNodes[1].id !== cur) {
               a[i].style.display = 'none';
          } else {
               a[i].style.display = "block";
          }
     }
}

var randomCounts = [];
for (var i = 0; i < 20; i++) {
     randomCounts.push(0);
}

// Standard Normal variate using Box-Muller transform.
function gausianDistribution() {
     var u = 0, v = 0;
     while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
     while (v === 0) v = Math.random();
     return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function monteCarlo() {
     while (true) {
          var r1 = random(1);
          var probability = r1;
          var r2 = random(1);

          if (r2 < probability) {
               return r1;
          }
     }
}

function Walker(x, y) {
     this.x = x;
     this.y = y;
}
Walker.prototype.display = function () {
     point(this.x, this.y);
}
Walker.prototype.step = function () {
     var choice = Math.floor(Math.random() * 4);
     var speed = 3;
     if (choice == 0) {
          this.x += speed;
     } else if (choice == 1) {
          this.x -= speed;
     } else if (choice == 2) {
          this.y += speed;
     } else {
          this.y -= speed;
     }
}
Walker.prototype.stepRight = function () {
     var choice = Math.random();

     var speed = 3;
     if (choice < 0.4) {
          this.x += speed;
     } else if (choice < 0.6) {
          this.x -= speed;
     } else if (choice < 0.8) {
          this.y += speed;
     } else {
          this.y -= speed;
     }
}
Walker.prototype.stepPerlin = function () {
     this.x = map(noise(time), 0, 1, 0, width);
     this.y = map(noise(time + 1000), 0, 1, 0, height);

     time += 0.005;
}

var w = new Walker(window.innerWidth / 2, window.innerHeight / 2);

function draw() {
     switch (version) {
          case 'randomWalk':
               if (cleanSlate && prevState !== 'directionalWalker') { cleanSlate = false; background(22); }

               stroke(255);
               strokeWeight(2);
               var oldX = w.x;
               var oldY = w.y;
               w.step();
               w.display();
               stroke(200, 0, 50);
               point(oldX, oldY);
               break;
          case 'directionalWalker':
               if (cleanSlate && prevState !== 'randomWalk') { cleanSlate = false; background(22); }
               
               stroke(255);
               strokeWeight(2);
               var oldX = w.x;
               var oldY = w.y;
               w.stepRight();
               w.display();
               stroke(200, 100, 0);
               point(oldX, oldY);
               break;
          case 'perlinWalker':
               background(22);
               stroke(255);
               strokeWeight(30);
               w.stepPerlin();
               w.display();
               break;
          case 'randomDistribution':
               background(22);
               var index = Math.floor(Math.random() * randomCounts.length);
               randomCounts[index] += 2;

               stroke(22);
               strokeWeight(0.5);
               fill(255);
               var q = window.innerWidth / randomCounts.length;
               for (var x = 0; x < randomCounts.length; x++) {
                    rect(x * q, height - randomCounts[x], q - 1, randomCounts[x]);
               }
               break;
          case 'gausianDistribution':
               if (cleanSlate) { background(22); cleanSlate = false; }
               var num = gausianDistribution();
               var sd = 200;
               var mean = window.innerWidth / 2;

               var x = sd * num + mean;

               noStroke();
               fill(255, 10);
               ellipse(x, window.innerHeight / 2 - Math.random()*Math.exp(-(x-mean)*(x-mean)/40000)*200, 16, 16);
               ellipse(x, window.innerHeight / 4 * 3, 16, 16);
               break;
          case 'monteCarlo':
               if (cleanSlate) { background(22); cleanSlate = false; }
               var num = monteCarlo();
               var sd = 400;
               var mean = window.innerWidth / 2 - 200;

               var x = sd * num + mean;

               noStroke();
               fill(255, 10);
               ellipse(x, window.innerHeight / 2 + 200 - Math.random() * num * 400, 16, 16);
               ellipse(x, window.innerHeight / 8 * 7, 16, 16);
               break;
          case 'perlinNoise':
               time += 0.005;
               if (cleanSlate) { background(22); cleanSlate = false; }
               var num = quickNoise.noise(1423.6432, 574837, time) / 2 + 0.5;
               num += quickNoise.noise(1423.6432, 574837, time * 2) / 4;
               num += quickNoise.noise(1423.6432, 574837, time * 4) / 10;
               num += quickNoise.noise(1423.6432, 574837, time * 8) / 20;
               num += quickNoise.noise(1423.6432, 574837, time * 32) / 40;

               strokeWeight(5);
               stroke(255);
               point(time * 100, num * 500 - 250 + window.innerHeight / 2);
               break;
          case '2DPerlinNoise':
               if (cleanSlate) {

                    //colorMode(HSB);
                    var l1 = color(248, 247, 197);
                    var l2 = color(252, 204, 44);
                    var l3 = color(228, 95, 42);
                    var l4 = color(204, 50, 37);
                    var l5 = color(118, 25, 17);
                    var l6 = color(22, 22, 22);

                    loadPixels();
                    for (var x = 0; x < width; x++) {
                         for (var y = 0; y < height; y++) {
                              var c1 = quickNoise.noise(x / 80, y / 80, time) / 2 + 0.5;
                              c1 += quickNoise.noise(x / 40, y / 40, time) / 4;
                              c1 += quickNoise.noise(x / 20, y / 20, time) / 6;
                              c1 += quickNoise.noise(x / 10, y / 10, time) / 10;
                              c1 += quickNoise.noise(x / 5, y / 5, time) / 15;
                              c1 += quickNoise.noise(x / 2.5, y / 2.5, time) / 20;
                              c1 += c1 * 0.02 + 0.01;
                              var c;
                              if (c1 < 0.3) {
                                   c = lerpColor(l1, l2, c1 / 0.35);
                              } else if (c1 < 0.4) {
                                   c = lerpColor(l2, l3, (c1 - 0.3) / 0.1);
                              } else if (c1 < 0.42) {
                                   c = lerpColor(l3, l4, (c1 - 0.4) / 0.02);
                              } else if (c1 < 0.5) {
                                   c = lerpColor(l4, l5, (c1 - 0.42) / 0.1);
                              } else {
                                   c = lerpColor(l5, l6, (c1 - 0.5) / 0.2);
                              }


                              //c = color(c, 100, 100, 1);
                              var i = x + y * width;
                              i *= 4;
                              pixels[i] = red(c);
                              pixels[i + 1] = green(c);
                              pixels[i + 2] = blue(c);
                              //pixels[i+3] = 255;
                         }
                    }
                    updatePixels();
                    time += 0.03;
                    //colorMode(RGB);
                    cleanSlate = false;
               }
               break;
     }
}