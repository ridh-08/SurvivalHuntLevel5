//separation and cohesion
//flock position randomised

let flock;
let increaseSpeedButton;
let decreaseSpeedButton;
let increaseBoidsButton;
let decreaseBoidsButton;
let speed = 1.5;
let minSpeed = 0.5;
let maxSpeed = 10;
let minBoids = 10;
let maxBoids = 700;
let boidIncrement = 15;
let score = 0;
let totalClicks = 0; 
let startTime;
let elapsedTime = 0;
let gameRunning = true;

function setup() 
{
    createCanvas(windowWidth, windowHeight);
  cursor(CROSS); 
  
  flock = new Flock();

  for (let i = 0; i < 200; i++) {
    let x = random(width); // Generate random x position
    let y = random(height); // Generate random y position
    let b = new Boid(x, y); // Create a new boid at random position
    flock.addBoid(b);
  }

  increaseSpeedButton = createButton('Increase Speed');
  increaseSpeedButton.position(20, height + 20);
  increaseSpeedButton.mousePressed(increaseSpeed);

  decreaseSpeedButton = createButton('Decrease Speed');
  decreaseSpeedButton.position(160, height + 20);
  decreaseSpeedButton.mousePressed(decreaseSpeed);

  increaseBoidsButton = createButton('Increase Boids');
  increaseBoidsButton.position(300, height + 20);
  increaseBoidsButton.mousePressed(increaseBoids);

  decreaseBoidsButton = createButton('Decrease Boids');
  decreaseBoidsButton.position(440, height + 20);
  decreaseBoidsButton.mousePressed(decreaseBoids);
  
  startTime = millis();
}

function draw() {
  if (gameRunning) {
    background(51);
    flock.run();
    fill(255);
    textSize(16);
    text('Score: ' + score, 20, 30); // Display the score
    text('Total Clicks: ' + totalClicks, 20, 50); // Display the total clicks

    elapsedTime = (millis() - startTime) / 1000.0;
    let remainingTime = 60 - elapsedTime;

    

    if (elapsedTime >= 60) {
      gameRunning = false;
    }
  } else {
    // Display game over message or other logic after timer ends
    background(0);
    fill(255);
    textSize(32);
    textFont('Courier New');
    textSize(24);
    textAlign(CENTER);
    text("Time's Up!", width/2, 100);
    text('Your score is ' + score, width/2,200);
    text('Total Clicks = ' + totalClicks, width/2, 250)
    textSize(24);
    textWrap(WORD);
    textAlign(LEFT);
    textSize(12);
    text("", width/3, 300, width/3);
    
  }
  
  let remainingTime = 60 - elapsedTime;
  let minutes = Math.floor(remainingTime / 60); // Calculate minutes
  let seconds = Math.floor(remainingTime % 60); // Calculate seconds with modulo

  // Format seconds with leading zero if needed
  seconds = seconds < 10 ? "0" + seconds : seconds;

  text('Time: ' + minutes + ':' + seconds, width - 100, 30); // Display timer at top right

}


function increaseSpeed() {
  speed += 0.5;
  if (speed > maxSpeed) {
    speed = maxSpeed;
  }
  flock.updateSpeed(speed);
}

function decreaseSpeed() {
  speed -= 0.5;
  if (speed < minSpeed) {
    speed = minSpeed;
  }
  flock.updateSpeed(speed);
}

function increaseBoids() {
  for (let i = 0; i < boidIncrement; i++) {
    let newBoid = new Boid(width / 2, height / 2);
    flock.addBoid(newBoid);
  }
}

function decreaseBoids() {
  for (let i = 0; i < boidIncrement; i++) {
    flock.removeBoid();
  }
}

function Flock() {
  this.boids = [];
}

Flock.prototype.run = function () {
  for (let i = 0; i < this.boids.length; i++) {
    this.boids[i].run(this.boids);
  }
}

Flock.prototype.addBoid = function (b) {
  if (this.boids.length < maxBoids) {
    this.boids.push(b);
  }
}

Flock.prototype.removeBoid = function () {
  if (this.boids.length > minBoids) {
    this.boids.pop();
  }
}

Flock.prototype.updateSpeed = function (speed) {
  for (let i = 0; i < this.boids.length; i++) {
    this.boids[i].maxspeed = speed;
  }
}

function Boid(x, y) {
  this.acceleration = createVector(0, 0);
  this.velocity = createVector(random(-2, 2), random(-2, 2));
  this.position = createVector(x, y);
  this.r = 16.0;
  this.maxspeed = speed;
  this.maxforce = 0.05;
  this.clicked = false;
  
  this.isSmall = random() < 0.3;
  if (this.isSmall) {
    this.r -= 7; // Increase speed for smaller boids
  }
  
}



Boid.prototype.run = function (boids) {
  this.flock(boids);
  this.update();
  this.borders();
  this.render();
}

Boid.prototype.applyForce = function (force) {
  this.acceleration.add(force);
}

Boid.prototype.flock = function (boids) {
  let sep = this.separate(boids);
  let ali = this.align(boids);
  let coh = this.cohesion(boids);

  sep.mult(1.5); // Adjust the magnitude of separation force
  ali.mult(1.0); // Adjust the magnitude of alignment force
  coh.mult(1.0); // Adjust the magnitude of cohesion force

  this.applyForce(sep);
  this.applyForce(ali);
  this.applyForce(coh);
}

Boid.prototype.update = function () {
  this.velocity.add(this.acceleration);
  this.velocity.limit(this.maxspeed);
  this.position.add(this.velocity);
  this.acceleration.mult(0);
}


Boid.prototype.borders = function () {
  if (this.position.x < -this.r) this.position.x = width + this.r;
  if (this.position.y < -this.r) this.position.y = height + this.r;
  if (this.position.x > width + this.r) this.position.x = -this.r;
  if (this.position.y > height + this.r) this.position.y = -this.r;
}

Boid.prototype.separate = function (boids) {
  let desiredseparation = 25.0;
  let steer = createVector(0, 0);
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position);
    if ((d > 0) && (d < desiredseparation)) {
      let diff = p5.Vector.sub(this.position, boids[i].position);
      diff.normalize();
      diff.div(d);
      steer.add(diff);
      count++;
    }
  }
  if (count > 0) {
    steer.div(count);
  }
  if (steer.mag() > 0) {
    steer.normalize();
    steer.mult(this.maxspeed);
    steer.sub(this.velocity);
    steer.limit(this.maxforce);
  }
  return steer;
}

Boid.prototype.align = function (boids) {
  let neighbordist = 50;
  let sum = createVector(0, 0);
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].velocity);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    sum.normalize();
    sum.mult(this.maxspeed);
    let steer = p5.Vector.sub(sum, this.velocity);
    steer.limit(this.maxforce);
    return steer;
  } else {
    return createVector(0, 0);
  }
}

Boid.prototype.cohesion = function (boids) {
  let neighbordist = 50;
  let sum = createVector(0, 0);
  let count = 0;
  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position);
    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].position);
      count++;
    }
  }
  if (count > 0) {
    sum.div(count);
    return this.seek(sum);
  } else {
    return createVector(0, 0);
  }
}

Boid.prototype.seek = function (target) {
  let desired = p5.Vector.sub(target, this.position);
  desired.normalize();
  desired.mult(this.maxspeed);
  let steer = p5.Vector.sub(desired, this.velocity);
  steer.limit(this.maxforce);
  return steer;
}

// function mouseClicked() {
//   totalClicks++;

//   for (let i = flock.boids.length - 1; i >= 0; i--) {
//     let boid = flock.boids[i];
    
//     if (!boid.clicked && boid.isPink && dist(mouseX, mouseY, boid.position.x, boid.position.y) < boid.r+5) {
      
//       console.log("Boid clicked!");
//       boid.clicked = true; 
//       score++; 
//       break; 
//     }
//   }
// }

Boid.prototype.render = function () {
  let theta = this.velocity.heading() + radians(90);
  
  if (this.clicked) { // Highlight clicked boid with green
    fill(0, 255, 0);
  } else if (this.isSmall) {
    fill(205, 92, 92);
  } else {
    fill(200);
  }
  stroke(200);
  push();
  translate(this.position.x, this.position.y);
  rotate(theta);
  beginShape();
  vertex(0, -this.r * 2);
  vertex(-this.r, this.r * 2);
  vertex(this.r, this.r * 2);
  endShape(CLOSE);
  pop();
}

function mouseClicked() {
  totalClicks++;

  for (let i = flock.boids.length - 1; i >= 0; i--) {
    let boid = flock.boids[i];
    
    if (!boid.clicked && boid.isSmall && pointInBoid(mouseX, mouseY, boid)) {
      console.log("Boid clicked!");
      boid.clicked = true; 
      score++; 
      break; 
    }
  }
}

function pointInBoid(x, y, boid) {
  let vertices = getBoidVertices(boid);
  let inside = false;

  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    let xi = vertices[i].x, yi = vertices[i].y;
    let xj = vertices[j].x, yj = vertices[j].y;

    let intersect = ((yi > y) != (yj > y)) &&
                    (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}

function getBoidVertices(boid) {
  let vertices = [];
  let theta = boid.velocity.heading() + radians(90);
  let cosTheta = cos(theta);
  let sinTheta = sin(theta);

  // Calculate the vertices of the triangle representing the boid
  let v1 = createVector(boid.position.x, boid.position.y - boid.r * 2);
  let v2 = createVector(boid.position.x - boid.r, boid.position.y + boid.r * 2);
  let v3 = createVector(boid.position.x + boid.r, boid.position.y + boid.r * 2);

  // Rotate the vertices according to boid's heading
  let rotatedV1 = createVector(
    cosTheta * (v1.x - boid.position.x) - sinTheta * (v1.y - boid.position.y) + boid.position.x,
    sinTheta * (v1.x - boid.position.x) + cosTheta * (v1.y - boid.position.y) + boid.position.y
  );
  let rotatedV2 = createVector(
    cosTheta * (v2.x - boid.position.x) - sinTheta * (v2.y - boid.position.y) + boid.position.x,
    sinTheta * (v2.x - boid.position.x) + cosTheta * (v2.y - boid.position.y) + boid.position.y
  );
  let rotatedV3 = createVector(
    cosTheta * (v3.x - boid.position.x) - sinTheta * (v3.y - boid.position.y) + boid.position.x,
    sinTheta * (v3.x - boid.position.x) + cosTheta * (v3.y - boid.position.y) + boid.position.y
  );

  vertices.push(rotatedV1, rotatedV2, rotatedV3);
  return vertices;
}

Boid.prototype.separate = function (boids) {
  let desiredSeparation = 40.0; // Minimum separation distance
  let steer = createVector(0, 0);
  let count = 0;

  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position);

    if ((d > 0) && (d < desiredSeparation)) {
      let diff = p5.Vector.sub(this.position, boids[i].position);
      diff.normalize();
      diff.div(d); // Weight by distance
      steer.add(diff);
      count++;
    }
  }

  if (count > 0) {
    steer.div(count);
  }

  if (steer.mag() > 0) {
    steer.normalize();
    steer.mult(this.maxspeed);
    steer.sub(this.velocity);
    steer.limit(this.maxforce);
  }

  return steer;
}

Boid.prototype.cohesion = function (boids) {
  let neighbordist = 50; // Maximum distance to consider a boid as a neighbor
  let sum = createVector(0, 0);
  let count = 0;

  for (let i = 0; i < boids.length; i++) {
    let d = p5.Vector.dist(this.position, boids[i].position);

    if ((d > 0) && (d < neighbordist)) {
      sum.add(boids[i].position);
      count++;
    }
  }

  if (count > 0) {
    sum.div(count);
    return this.seek(sum); // Use seek behavior to move towards the center of mass of neighbors
  } else {
    return createVector(0, 0);
  }
}
