/*global console, window, document, XMLHttpRequest, Image*/

// Constants.
var FPS = 6,
    LEFT_MARGIN = 150,
    TOP_MARGIN = 10,
    WIDTH = 10,
    HEIGHT = 20,

    // Size of the minimun fragment of a block.
    fragmentSize,

    // Graphic elements.
    canvas = null,
    context = null,

    // Spritesheet and block data.
    blocks = [],
    spriteSheet = new Image(),

    // Next block
    nextBlock,

    // Current block and status
    currentBlock,
    currentBlockAngle = 0,
    currentBlockPosition = {x: 0, y: 0},

    // Board
    board = [],
    // Blocks already placed.
    placedBlocks = [],
    // Marks filled rows
    filledRows = [];

// Loads sprites and sprite data.
var load = function () {
    'use strict';
    var xhr = new XMLHttpRequest(),
        spriteData,
        sprite,
        shape;
    
    // Loads spritesheet.
    spriteSheet.src = 'sprites.png';
    
    // Loads spritesheet data.
    xhr.open('GET', 'sprites.json', false); // not asynchronous
    xhr.onload = function () {
        spriteData = JSON.parse(this.responseText);
    };
    xhr.send();
    
    // Shape of every block
    for (sprite in spriteData.frames) {
        if (spriteData.frames.hasOwnProperty(sprite)) {
            
            switch (spriteData.frames[sprite].filename) {
            case "I.png":
                shape = [[1, 1, 1, 1]];
                break;
            case "J.png":
                shape = [[1, 0, 0], [1, 1, 1]];
                break;
            case "L.png":
                shape = [[0, 0, 1], [1, 1, 1]];
                break;
            case "O.png":
                shape = [[1, 1], [1, 1]];
                break;
            case "S.png":
                shape = [[0, 1, 1], [1, 1, 0]];
                break;
            case "T.png":
                shape = [[0, 1, 0], [1, 1, 1]];
                break;
            case "Z.png":
                shape = [[1, 1, 0], [0, 1, 1]];
                break;
            }
            
            blocks.push({
                'sprite': spriteData.frames[sprite],
                'shape': shape
            });
        }
    }

    console.log('Loading completed.');
};

// Sets up basics elements.
var setup = function () {
    'use strict';
    var i, j, row;
    
    canvas = document.getElementById("canvas");
    context = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 800;
    
    // Fragment size is the minor side of the I piece.
    fragmentSize = Math.min(blocks[0].sprite.frame.w, blocks[0].sprite.frame.h);
    
    // Initialize 10x20 board.
    for (i = 0; i < HEIGHT; i += 1) {
        row = [];
        for (j = 0; j < WIDTH; j += 1) {
            row.push(0);
        }
        board.push(row);
    }
    
    // Generate first block and next block.
    // getNextBlock();
    // getNextBlock();
    
    document.addEventListener('keydown', function (event) {
        if (event.keyCode === 38) {
            currentBlockAngle = rotate(currentBlock, currentBlockPosition,
                                       currentBlockAngle);
        } else if (event.keyCode === 37) {
            moveLeft();
        } else if (event.keyCode === 39) {
            moveRight();
        }
    });

    console.log('Setup completed.');
};

var draw = function () {
    'use strict';
    
    var i, j;

    // Clean screen.
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw placed blocks.
    for (i = 0; i < placedBlocks.length; i += 1) {
        drawBlock(placedBlocks[i].block, placedBlocks[i].position,
                  placedBlocks[i].angle);
    }
    
    // Draw current block.
    drawBlock(currentBlock, currentBlockPosition, currentBlockAngle);
    
    // Draw next block.
    drawBlock(nextBlock, {x: -5, y: 0}, 0);
    
    // Draw board limits.
    context.rect(LEFT_MARGIN, TOP_MARGIN,
                 fragmentSize * 10, fragmentSize * 20);
    
    context.stroke();
};

// Translates from grid position to canvas position.
var translateCoordinates = function (position) {
    'use strict';
    
    var translatedPosition = {
        'x': (position.x * fragmentSize) + LEFT_MARGIN,
        'y': (position.y * fragmentSize) + TOP_MARGIN
    };
    return translatedPosition;
};

// Draws a block with the specified parameters.
var drawBlock = function (block) {
    'use strict';
    var i,
        fragments = [],
        fragmentsDrawn = 0,
        angle = block.angle,
        position = translateCoordinates(block.position),
        positionShift = {x: position.x, y: position.y},
        rowSum = function (prev, cur) {
            return prev + cur;
        };
    
    block = block.blockData;
    
    for (i = 0; i < block.shape.length; i += 1) {
        if (block.shape[i].length != 0 && block.shape[i].reduce(rowSum) > 0) {
            fragments.push(true);
        }
    }
    
    block = block.sprite.frame;
    
    context.save();
    if (angle === 90) {
        positionShift.x = position.y;
        positionShift.y = -position.x;
        context.translate(block.h, 0);
    } else if (angle === 180) {
        positionShift.x = -position.x;
        positionShift.y = -position.y;
        context.translate(block.w, block.h);
    } else if (angle === 270) {
        positionShift.x = -position.y;
        positionShift.y = position.x;
        context.translate(0, block.w);
    }
    context.rotate(angle * (Math.PI / 180)); // to radians
    

    for (i = fragments.length - 1; i >= 0; i -= 1) {
        if (fragments[i]) {
            if (angle === 0 || angle === 180) {
                context.drawImage(spriteSheet,
                                  block.x,
                                  block.y + (fragmentSize *
                                             (fragments.length -
                                              (fragmentsDrawn + 1))),
                                  block.w, fragmentSize,
                                  positionShift.x,
                                  positionShift.y + (fragmentSize *
                                             (fragments.length -
                                              (fragmentsDrawn + 1))),
                                  block.w, fragmentSize);
            } else {
                context.drawImage(spriteSheet,
                                  block.x + (fragmentSize *
                                             (fragments.length -
                                              (fragmentsDrawn + 1))),
                                  block.y,
                                  fragmentSize, block.h,
                                  positionShift.x + (fragmentSize *
                                             (fragments.length -
                                              (fragmentsDrawn + 1))),
                                  positionShift.y,
                                  fragmentSize, block.h);
            }
            fragmentsDrawn += 1;
        }
    }

    context.restore();
};

// Main game loop.
var mainloop = function () {
    'use strict';
    var i;
    
    for (i = 0; i < filledRows.length; i += 1) {
        // markLine(filledRows[i]);
        clearLine(filledRows[i]);
    }
    filledRows = [];
    
    draw();
    moveDown();
};

var debugLoop = function () {
    'use strict';
    var i,
        testBlock = {blockData: {sprite: null, shape: null},
                     position: {x: 0, y: 0},
                     angle: 0},
        testBlockNum = 2,
        testBlockShape = [];
    
    for (i = 0; i < blocks[testBlockNum].shape.length - 1; i += 1) {
        testBlockShape.push(blocks[testBlockNum].shape[i].slice(0));
    } 
    testBlockShape.push([]);
    
    testBlock.blockData.sprite = blocks[testBlockNum].sprite;
    testBlock.blockData.shape = testBlockShape;
    testBlock.position.x = -5;
    testBlock.position.y = 0;
    
    drawBlock(testBlock);
    context.stroke();
};

// Kicks in once the DOM has been loaded.
window.onload = function () {
    'use strict';
    load();
    setup();
    //window.setInterval(mainloop, 1000 / FPS);
    window.setInterval(debugLoop, 1000 / FPS);
};