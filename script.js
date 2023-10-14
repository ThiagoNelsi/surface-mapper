const canvas = document.getElementById('canvas');
const mapCanvas = document.getElementById('map');

const ctx = canvas.getContext('2d');
const mapCtx = mapCanvas.getContext('2d');

const statsX = document.getElementById('x');
const statsY = document.getElementById('y');
const statsDirection = document.getElementById('direction');
const statsSensor = document.getElementById('sensor');

const width = canvas.width = 200;
const height = canvas.height = 200;

mapCanvas.width = width * 1.5;
mapCanvas.height = height * 1.5;

const robot = {
    x: 100,
    y: 100,
    color: 'white',
    radius: width / 20,
    direction: 0,
    speed: 1,
    setX: (x) => {
        if (x < robot.radius) {
            x = robot.radius;
        } else if (x > width - robot.radius) {
            x = width - robot.radius;
        }
        robot.x = x;
        draw();
    },
    setY: (y) => {
        if (y < robot.radius) {
            y = robot.radius;
        } else if (y > height - robot.radius) {
            y = height - robot.radius;
        }
        robot.y = y;
        draw();
    },
    setColor: (color) => {
        robot.color = color;
        draw();
    },
    setRadius: (radius) => {
        robot.radius = radius;
        draw();
    },
    setDirection: (direction) => {
        robot.direction = direction;
        draw();
    },
    getSensor: () => {
        // return distance to the wall in front of the robot
        let sensorX = robot.x + Math.cos(robot.direction) * robot.radius;
        let sensorY = robot.y + Math.sin(robot.direction) * robot.radius;
        let distance = 0;
        while (sensorX > 0 && sensorX < width && sensorY > 0 && sensorY < height) {
            sensorX += Math.cos(robot.direction);
            sensorY += Math.sin(robot.direction);
            distance++;
        }
        return distance;
    },
    moveForward: () => {
        robot.setX(robot.x + Math.cos(robot.direction) * robot.speed);
        robot.setY(robot.y + Math.sin(robot.direction) * robot.speed);
    },
    moveBackward: () => {
        robot.setX(robot.x - Math.cos(robot.direction) * robot.speed);
        robot.setY(robot.y - Math.sin(robot.direction) * robot.speed);
    },
    turnLeft: async (deg = 5) => {
        const rotation = Math.PI * deg / 180;
        for (let i = 0; i < 100; i++) {
            robot.setDirection(robot.direction - rotation / 100);
            await sleep(1);
        }
    },
    turnRight: async (deg = 5) => {
        const rotation = Math.PI * deg / 180;
        for (let i = 0; i < 100; i++) {
            robot.setDirection(robot.direction + rotation / 100);
            await sleep(1);
        }
    }
};

draw();

function draw() {
    // clear the canvas
    ctx.clearRect(0, 0, width, height);

    // fill the canvas background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
    ctx.fillRect(0, 0, width, height);

    // draw the ball
    ctx.fillStyle = robot.color;
    ctx.beginPath();
    ctx.arc(robot.x, robot.y, robot.radius, 0, 2 * Math.PI);
    ctx.fill();

    // draw the direction line
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.moveTo(robot.x, robot.y);
    ctx.lineTo(robot.x + Math.cos(robot.direction) * robot.radius, robot.y + Math.sin(robot.direction) * robot.radius);
    ctx.stroke();

    // draw the sensor line
    ctx.strokeStyle = 'red';
    ctx.beginPath();
    ctx.moveTo(robot.x, robot.y);
    ctx.lineTo(robot.x + Math.cos(robot.direction) * (robot.getSensor() + robot.radius), robot.y + Math.sin(robot.direction) * (robot.getSensor() + robot.radius));
    ctx.stroke();

    // write the stats
    statsX.innerText = `x: ${robot.x}`;
    statsY.innerText = `y: ${robot.y}`;
    statsDirection.innerText = `direction: ${robot.direction}`;
    statsSensor.innerText = `sensor: ${robot.getSensor()}`;
}

function drawMap(map) {
    // draw matrix
    mapCtx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);
    mapCtx.fillStyle = 'rgba(0, 0, 0, 0.95)';
    mapCtx.fillRect(0, 0, mapCanvas.width, mapCanvas.height);

    const cellWidth = mapCanvas.width / map.length;
    const cellHeight = mapCanvas.height / map[0].length;

    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {

            if (map[i][j] === 1) {
                mapCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                mapCtx.fillRect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
            }

            mapCtx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            mapCtx.strokeRect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
        }
    }
}

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'ArrowUp':
            robot.moveForward();
            break;
        case 'ArrowDown':
            robot.moveBackward();
            break;
        case 'ArrowLeft':
            robot.turnLeft();
            break;
        case 'ArrowRight':
            robot.turnRight();
            break;
    }
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function ai() {
    const map = new Array(30).fill(0).map(() => new Array(30).fill(0));

    let forwardCounter = 0;
    let i = map.length / 2;
    let j = map[0].length / 2;

    while (1) {
        if (robot.getSensor() > 5 && map[i + Math.round(Math.cos(robot.direction))][j + Math.round(Math.sin(robot.direction))] !== 1) {
            robot.moveForward();
            forwardCounter++;

            if (forwardCounter >= robot.radius) {
                forwardCounter = 0;
                map[i][j] = 1;
                i += Math.round(Math.cos(robot.direction));
                j += Math.round(Math.sin(robot.direction));
            }
        } else {
            await robot.turnLeft(90);
        }

        drawMap(map);

        await sleep(0);
    }
}

ai();
