let PAT = "RRLLLRLLLLL";
let STEP = 1000000;
const ANTUP = 0;
const ANTRIGHT = 1;
const ANTDOWN = 2;
const ANTLEFT = 3;

let grid = [];
let x, y, dir;
let count = 0;
let grid_w, grid_h;
let palette = [];
let stop = false;
let out_of_range;

let slider_step, button_pause, button_changecolor, button_reset, input_pat, button_apply, button_save;

function setup() {
    let canvas = createCanvas(1000, 1000);
    canvas.parent(mycanvas);
    frameRate(10);
    pixelDensity(1);
    createUi();
    reset();
}

function reset() {
    grid_w = 5000;
    grid_h = 5000;
    for (let i = 0; i < grid_h; i++) {
        grid.push([]);
        for (let j = 0; j < grid_w; j++) {
            grid[i][j] = 0;
        }
    }
    dir = ANTUP;
    x = grid_w / 2;
    y = grid_h / 2;
    grid[y][x] = 0;
    out_of_range = false;
    generatePallete();
}

function createUi() {
    createP();
    input_pat = createInput("RRLLLRLLLLL");
    button_apply = createButton("APPLY");
    button_apply.mousePressed(() => {
        let new_pat = validateInput(input_pat.value());
        console.log(new_pat);
        if (new_pat == null) {
            input_pat.value("ERROR!");
            stop = true;
            return;
        }
        input_pat.value(new_pat);
        PAT = new_pat;
        reset();
        stop = false;
    });
    createP();
    createSpan("step/frame");
    slider_step = createSlider(10, 10000000, 1000000, 10);
    createP();
    button_pause = createButton("RUN/PAUSE");
    button_pause.mousePressed(() => {
        stop = !stop;
    });
    button_changecolor = createButton("CHANGE COLOR");
    button_changecolor.mousePressed(() => {
        generatePallete();
    });
    button_reset = createButton("RESET");
    button_reset.mousePressed(() => {
        reset();
    });
    button_save = createButton("SAVE");
    button_save.mousePressed(saveImage);
}

function turnRight() {
    dir++;
    if (dir > ANTLEFT) dir = ANTUP;
}

function turnLeft() {
    dir--;
    if (dir < ANTUP) dir = ANTLEFT;
}

function moveForward() {
    count++;
    if (dir == ANTUP) y--;
    else if (dir == ANTRIGHT) x++;
    else if (dir == ANTDOWN) y++;
    else if (dir == ANTLEFT) x--;
    if (x > grid_w - 1 || x < 0 || y > grid_h - 1 || y < 0) {
        out_of_range = true;
        stop = true;
        console.log("stopped : out_of_range");
    }
}

function draw() {
    background(255);
    if (out_of_range) stop = true;
    for (let i = 0; i < slider_step.value(); i++) {
        if (out_of_range || stop) break;
        let state = grid[y][x];
        if (PAT[state] == 'R') turnRight();
        if (PAT[state] == 'L') turnLeft();
        grid[y][x] = (grid[y][x] + 1) % PAT.length;
        moveForward();
    }

    loadPixels();
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            let pix = (i * width + j) * 4;
            let col = palette[grid[i + (grid_h - height) / 2][j + (grid_w - width) / 2]];
            pixels[pix] = red(col);
            pixels[pix + 1] = green(col);
            pixels[pix + 2] = blue(col);
            pixels[pix + 3] = alpha(col);
        }
    }
    updatePixels();
    drawUi();
}

function drawUi() {
    fill(0);
    text("STEP/FRAME :" + slider_step.value().toExponential(2), 10, height - 60);
    text(stop ? "PAUSING" : "RUNNING", 10, height - 80);
    text("step: " + count, 10, height - 20);
    text("framerate: " + frameRate(), 10, height - 40);
    if (out_of_range) {
        text("TERMINATED. THE ANT IS OUT OF RANGE.", 10, height - 100);
    }
}

function validateInput(pat) {
    let result = "";
    if (pat.length < 2) return null;
    for (let i = 0; i < pat.length; i++) {
        let c = pat.charAt(i)
        if (c == 'R' || c == 'r') result += 'R';
        else if (c == 'L' || c == 'l') result += 'L';
        else return null;
    }
    return result;
}

function generatePallete() {
    palette = [];
    palette.push(color(255));
    for (let i = 1; i < PAT.length; i++) {
        let r = random(50, 256);
        let g = random(50, 256);
        let b = random(50, 256);
        palette.push(color(r, g, b));
    }
}

function saveImage() {
    let img = createImage(width, height);
    stop = true;
    img.loadPixels();
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            let pix = (i * width + j) * 4;
            let col = palette[grid[i + (grid_h - height) / 2][j + (grid_w - width) / 2]];
            img.pixels[pix] = red(col);
            img.pixels[pix + 1] = green(col);
            img.pixels[pix + 2] = blue(col);
            img.pixels[pix + 3] = alpha(col);
        }
    }
    img.updatePixels();
    img.save("langtons_ant_" + year() + month() + day() + hour() + minute() + second() + ".png");
}