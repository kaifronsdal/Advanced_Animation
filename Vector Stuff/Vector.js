//constructor
//default: (0, 0)
function JSVector(x, y) {
    this.x = x || 0;
    this.y = y || 0;
}

// Set the magnitude of the vector,
// retaining the angle (direction).
JSVector.prototype.setMagnitude = function(mag){
    var curMag = this.getMagnitude();
    this.x *= mag/curMag;
    this.y *= mag/curMag;
};

// Get the magnitude of the vector using pythagorean theorem
JSVector.prototype.getMagnitude = function(){
    return Math.sqrt(this.x*this.x+this.y*this.y);
};

// Set the angle (direction) of the vector,
// retaining the magnitude.
JSVector.prototype.setDirection = function(angle){
    var curMag = this.getMagnitude();
    this.x = curMag*Math.cos(angle);
    this.y = curMag*Math.sin(angle);
};

// Get the direction (angle) of the vector
JSVector.prototype.getDirection = function(){
    return Math.atan2(this.y, this.x);
};

//Add another vector to this vector
JSVector.prototype.add = function(v){
    this.x += v.x;
    this.y += v.y;
};

//Subtract another vector to this vector
JSVector.prototype.sub = function(v){
    this.x -= v.x;
    this.y -= v.y;
};
