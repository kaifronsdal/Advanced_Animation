//constructor
//default: (0, 0)
function JSVector(x, y) {
    this.x = x || 0;
    this.y = y || 0;
}

// Set the magnitude of the vector,
// retaining the angle (direction).
JSVector.prototype.setMagnitude = function (mag) {
    let curMag = this.getMagnitude();
    this.x *= mag / curMag;
    this.y *= mag / curMag;
};

// Get the magnitude of the vector using pythagorean theorem
JSVector.prototype.getMagnitude = function () {
    return Math.sqrt(this.x * this.x + this.y * this.y);
};

// Set the angle (direction) of the vector,
// retaining the magnitude.
JSVector.prototype.setDirection = function (angle) {
    let curMag = this.getMagnitude();
    this.x = curMag * Math.cos(angle);
    this.y = curMag * Math.sin(angle);
};

// Get the direction (angle) of the vector
JSVector.prototype.getDirection = function () {
    return Math.atan2(this.y, this.x);
};

//Add another vector to this vector
JSVector.prototype.add = function (v) {
    this.x += v.x;
    this.y += v.y;
};

//Subtract another vector to this vector
JSVector.prototype.sub = function (v) {
    this.x -= v.x;
    this.y -= v.y;
};


// Class method to return a new vector that is the sum of two vectors
JSVector.addGetNew = function (v1, v2) {
    return new JSVector(v1.x + v2.x, v1.y + v2.y);
}

// Class method to return a new vector that is the difference of two vectors
JSVector.subGetNew = function (v1, v2) {
    return new JSVector(v1.x - v2.x, v1.y - v2.y);
}

// Multiply this vector by a scalar
JSVector.prototype.multiply = function (scalar) {
    this.x *= scalar;
    this.y *= scalar;
}

// Divide this vector by a scalar
JSVector.prototype.divide = function (scalar) {
    this.x /= scalar;
    this.y /= scalar;
}

// Normalize this vector so that it has a magnitude of 1
JSVector.prototype.normalize = function () {
    var curMag = this.getMagnitude();
    this.x /= curMag;
    this.y /= curMag;
}

// Limit the magnitude of this vector
JSVector.prototype.limit = function (lim) {
    var curMag = this.getMagnitude();
    if (curMag > lim) {
        this.setMagnitude(lim);
    }
}

// Get the distance between this vector and another one
JSVector.prototype.distance = function (v2) {
    return Math.sqrt((this.x - v2.x) * (this.x - v2.x) + (this.y - v2.y) * (this.y - v2.y));
}

// Get square of the distance between this vector and another one
JSVector.prototype.distanceSquared = function (v2) {
    return (this.x - v2.x) * (this.x - v2.x) + (this.y - v2.y) * (this.y - v2.y);
}

// Rotate this vector by some number of radians
// using the rotation matrix |  cos   -sin  |
//                           |  sin   +cos  |

JSVector.prototype.rotate = function (angle) {
    this.x = this.x * Math.cos(angle) - this.y * Math.sin(angle);
    this.y = this.y * Math.cos(angle) + this.x * Math.sin(angle);
}


// Get the angle between this vector and another one
JSVector.prototype.angleBetween = function (v2) {
    return Math.acos(this.dotProduct(v2) / (this.getMagnitude() * v2.getMagnitude()));
}

// Get the dot product between this vector and another one
JSVector.prototype.dotProduct = function (v2) {
    return this.x * v2.x + this.y * v2.y;
}

// Make a copy of this vector
JSVector.prototype.copy = function () {
    return new JSVector(this.x, this.y);
}

// Override inherited toString() to describe this instance
JSVector.prototype.toString = function () {
    return "(" + this.x + ", " + this.y + ")";
}