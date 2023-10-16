let KARHIDE = 0;
let ORGOREYN = 1;

class Citizen {
  constructor(_x, _y, _w, _region) {
    this.x = _x;
    this.y = _y;
    this.w = _w;
    this.angle = 0;
    this.angleVelocity = radians(20 * noise(this.x, this.y));

    this.region = _region;
    if (this.region == KARHIDE) {
      this.color = 0;
    } else if (this.region == ORGOREYN) {
      this.color = 255;
    }
  }

  update() {
    // TODO: color and rotation updates
    if (this.region == KARHIDE) {
      // One region will get color based on distance
      //   from a point (x, y) within the region
    } else if (this.region == ORGOREYN) {
      // The other region will get color based on distance
      //   from the line separating the two regions
    }

    // this is here just to test the logic
    this.angle += this.angleVelocity;
  }

  draw() {
    push();
    translate(this.x + this.w / 2, this.y + this.w / 2);
    rotate(this.angle);
    translate(-this.w / 2, -this.w / 2);

    // TODO: animate rotation based on update/color change
    stroke(255 - this.color);
    fill(this.color);
    rect(0, 0, this.w, this.w);
    pop();
  }
}

let BOOK_COVER_RATIO = 8.27 / 5.51;
let CIT_PER_ROW = 30;
let TIMEOUT_PERIOD = 60 * 1000; // 1 minute

let cWidth;
let mPeople;
let nextAutoColorUpdate;

function setup() {
  createCanvas(windowHeight / BOOK_COVER_RATIO, windowHeight);

  cWidth = width / CIT_PER_ROW;
  mPeople = [];

  for (let y = 0; y < height - cWidth; y += cWidth) {
    for (let x = 0; x < width - cWidth; x += cWidth) {
      let mRegion = ORGOREYN;

      // y = mx + b
      // y = -height/width * x + height
      // y > -height/width * x + height
      // height/width * x > height - y
      if ((height / (width - cWidth)) * x < height - y) {
        mRegion = KARHIDE;
      }
      mPeople.push(new Citizen(x, y, cWidth, mRegion));
    }
  }

  nextAutoColorUpdate = millis() + TIMEOUT_PERIOD;
}

function draw() {
  background(0);
  noStroke();
  fill(255);
  triangle(0, 0, width, 0, 0, height);

  for (let ci = 0; ci < mPeople.length; ci++) {
    mPeople[ci].update();
    mPeople[ci].draw();
  }

  // TODO: if no clicks in last minute,
  //   pick random point in specific region and trigger a color change
  if (millis() > nextAutoColorUpdate) {
    // clear timer
    nextAutoColorUpdate = millis() + TIMEOUT_PERIOD;
  }
}

// TODO: this should detect clicks, and
//   if in a certain region, trigger a color change
function mouseClicked() {
  // clear timer
  nextAutoColorUpdate = millis() + TIMEOUT_PERIOD;
}
