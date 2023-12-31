// the two nations/halves of the canvas
let KARHIDE = 0;
let ORGOREYN = 1;

class Gethenian {
  constructor(_x, _y, _w, _region) {
    this.x = _x;
    this.y = _y;
    this.w = _w;
    this.angle = 0;
    this.region = _region;
    this.cx = 0;
    this.cy = 0;
    this.m = -height / width;
    this.b = height;
    this.radius = 0;
    this.radiusVelocity = 0;
    this.colorAmmount = 0;
    this.colorVelocity = 0;

    if (this.region == KARHIDE) {
      this.baseFillColor = color(0);
      this.baseStrokeColor = color(255);
      this.kemmerFillColor = color("skyblue");
      this.kemmerStrokeColor = color(0);
    } else if (this.region == ORGOREYN) {
      this.baseFillColor = color(255);
      this.baseStrokeColor = color(0);
      this.kemmerFillColor = color("royalblue");
      this.kemmerStrokeColor = color(255);
    }

    let distanceFromCenter = distanceToLine(-height / width, height, this.x, this.y);
    let distanceFromDiagonal = distanceToLine(height / width, 0, this.x, this.y);
    let distanceFactor = distanceFromCenter * distanceFromDiagonal;
    this.alpha = 255 - distanceFactor * 0.002;

    this.fillColor = this.baseFillColor;
    this.strokeColor = this.baseStrokeColor;
  }

  startKemmer(_x, _y) {
    this.cx = _x;
    this.cy = _y;
    this.m = -height / width;
    this.b = 2 * height - (this.cy - this.m * this.cx);
    this.radius = 0;
    this.colorAmmount = 0;
    this.radiusVelocity = this.region == KARHIDE ? 5 : 3;
    this.colorVelocity = this.radiusVelocity / 100;
  }

  stopKemmer() {
    this.radius = 0;
    this.colorVelocity *= -1;
    this.baseFillColor = invertColor(this.baseFillColor);
    this.baseStrokeColor = invertColor(this.baseStrokeColor);
  }

  // color and rotation updates
  update() {
    let distanceFrom;

    if (this.region == KARHIDE) {
      // Color based on distance from a point (x, y) within the region
      distanceFrom = dist(this.cx, this.cy, this.x, this.y);
    } else if (this.region == ORGOREYN) {
      // Color updates based on distance from line separating the two regions
      distanceFrom = distanceToLine(this.m, this.b, this.x, this.y);
    }

    if (distanceFrom < this.radius) {
      this.colorAmmount += this.colorVelocity;
      this.colorAmmount = constrain(this.colorAmmount, 0, 1);
    } else {
      this.radius += this.radiusVelocity;
    }

    this.fillColor = lerpColor(
      this.baseFillColor,
      this.kemmerFillColor,
      this.colorAmmount
    );

    // alpha based on distance and colorAmmount
    let mAlpha = map(this.colorAmmount, 0, 1, 255, this.alpha, true);
    this.fillColor.setAlpha(mAlpha);

    this.strokeColor = lerpColor(
      this.baseStrokeColor,
      this.kemmerStrokeColor,
      this.colorAmmount
    );

    this.angle = PI * this.colorAmmount;
  }

  draw() {
    push();
    translate(this.x + this.w / 2, this.y + this.w / 2);
    rotate(this.angle);
    translate(-this.w / 2, -this.w / 2);
    stroke(this.strokeColor);
    fill(this.fillColor);
    rect(0, 0, this.w, this.w);
    pop();
  }
}

let BOOK_COVER_RATIO = 25 / 17;
let NUM_COLS = 28;
let TIMEOUT_PERIOD = 60 * 1000; // 1 minute

let TITLE = "The Left Hand\nof Darkness";
let AUTHOR = "Ursula K. Le Guin";

let cWidth;
let gethen;
let karhide;
let orgoreyn;

let nextAutoUpdate;

let mFont;

function preload() {
  mFont = loadFont("./assets/e.ttf");
}

function setup() {
  createCanvas(windowHeight / BOOK_COVER_RATIO, windowHeight);

  cWidth = width / NUM_COLS;
  gethen = [];

  for (let y = 0; y < height; y += cWidth) {
    for (let x = 0; x < width; x += cWidth) {
      let mRegion = isInKarhide(x, y) ? KARHIDE : ORGOREYN;
      gethen.push(new Gethenian(x, y, cWidth, mRegion));
    }
  }
  nextAutoUpdate = millis() + TIMEOUT_PERIOD;
}

function titleAuthor() {
  textFont(mFont);
  textSize(34);

  fill(karhide[0].strokeColor);
  textAlign(LEFT, TOP);
  text(TITLE, 5, 5);

  fill(orgoreyn[0].strokeColor);
  textAlign(RIGHT, BOTTOM);
  text(TITLE, width - 5, height - 5);

  textSize(16);

  fill(karhide[0].strokeColor);
  textAlign(LEFT, TOP);
  text(AUTHOR, 5, 2 * 34 + 17);

  fill(orgoreyn[0].strokeColor);
  textAlign(RIGHT, BOTTOM);
  text(AUTHOR, width - 5, height - (2 * 34 + 17));
}

function draw() {
  noStroke();

  karhide = gethen.filter(isKarhide);
  orgoreyn = gethen.filter(isOrgoreyn);

  fill(karhide[0].strokeColor);
  triangle(0, 0, width, 0, 0, height);

  fill(orgoreyn[0].strokeColor);
  triangle(width, 0, width, height, 0, height);

  let isKarhideKemmered = karhide.reduce(allKemmered, true);
  let isOrgoreynKemmered = orgoreyn.reduce(allKemmered, true);

  if (isKarhideKemmered && isOrgoreynKemmered) {
    nextAutoUpdate = millis() + TIMEOUT_PERIOD;
  }

  for (let ci = 0; ci < gethen.length; ci++) {
    if (isKarhideKemmered && isOrgoreynKemmered) {
      gethen[ci].stopKemmer();
    }
    gethen[ci].update();
    gethen[ci].draw();
  }

  // if no clicks in last minute, trigger a color change at random x,y
  if (millis() > nextAutoUpdate) {
    let rX = random(width / 2);
    let rY = random(height / 2);
    startKarhideKemmer(rX, rY);
  }

  titleAuthor();
}

function startKarhideKemmer(_x, _y) {
  let isKarhideReady = karhide.reduce(readyToKemmer, true);
  let isOrgoreynReady = orgoreyn.reduce(readyToKemmer, true);

  // if in karhide and ready, start kemmer
  if (isKarhideReady && isOrgoreynReady && isInKarhide(_x, _y)) {
    for (let ci = 0; ci < gethen.length; ci++) {
      gethen[ci].startKemmer(_x, _y);
    }
    nextAutoUpdate = millis() + TIMEOUT_PERIOD;
  }
}

function mouseClicked() {
  startKarhideKemmer(mouseX, mouseY);
}

function distanceToLine(_m, _b, _x, _y) {
  let mnMag = sqrt(_m * _m + 1);
  let numerator = abs(_m * _x - _y + _b);
  return numerator / mnMag;
}

function invertColor(_color) {
  var r = 255 - red(_color);
  var g = 255 - green(_color);
  var b = 255 - blue(_color);
  return color(r, g, b);
}

function isInKarhide(_x, _y) {
  // y = mx + b
  // y = -height/width * x + height
  // y > -height/width * x + height
  // height/width * x > height - y
  return (height / (width - cWidth)) * _x < height - _y;
}

function isKarhide(g) {
  return g.region == KARHIDE;
}

function isOrgoreyn(g) {
  return g.region == ORGOREYN;
}

function allKemmered(acc, g) {
  return acc && g.colorAmmount >= 0.999 && g.colorVelocity > 0;
}

function readyToKemmer(acc, g) {
  return acc && g.colorAmmount <= 0.001;
}
