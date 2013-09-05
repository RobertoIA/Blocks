/*global console, window, document, XMLHttpRequest, Image*/

// Constants.
var FPS = 60,
    LEFT_MARGIN = 150,
    TOP_MARGIN = 0,
    BLOCK_FALLING_SPEED = 3,

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

    // Blocks already placed.
    placedBlocks = [];

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

// Draws a block with the specified parameters.
var drawBlock = function (block, position, angle) {
    'use strict';
    var i,
        fragments = [],
        fragmentsDrawn = 0,
        positionShift = {x: position.x, y: position.y},
        rowSum = function (prev, cur) {
            return prev + cur;
        };
    
    for (i = 0; i < block.shape.length; i += 1) {
        if (block.shape[i].reduce(rowSum) > 0) {
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

// Draws current screen contents.
var draw = function () {
    'use strict';
    var i;

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
    drawBlock(nextBlock, {x: 0, y: 0}, 0);
    
    // Draw board limits.
    context.rect(LEFT_MARGIN, TOP_MARGIN,
                 fragmentSize * 10, fragmentSize * 20);
    context.stroke();
};

// Changes block to the next one.
var getNextBlock = function () {
    'use strict';
    var nextBlockNum = Math.floor(Math.random() * 7);
    
    if (currentBlock) {
        placedBlocks.push({block: currentBlock,
                           position: {x: currentBlockPosition.x,
                                      y: currentBlockPosition.y},
                           angle: currentBlockAngle});
    }
    // Generate new block and change current one.
    currentBlock = nextBlock;
    console.log();
    nextBlock = {'sprite': blocks[nextBlockNum].sprite,
                 'shape': blocks[nextBlockNum].shape};
    
    // Reset position.
    currentBlockPosition.y = TOP_MARGIN;
    currentBlockPosition.x = LEFT_MARGIN + fragmentSize * 5;
    currentBlockAngle = 0;
};

// Rotates current block.
var rotate = function () {
    'use strict';
    var i, j,
        rowShape,
        rotatedShape = [];
    
    currentBlockAngle += 90;
    // currentBlockAngle = Math.abs(currentBlockAngle);
    currentBlockAngle %= 360;
    
    // Matrix rotation.
    for (i = 0; i < currentBlock.shape[0].length; i += 1) {
        rowShape = [];
        for (j = 0; j < currentBlock.shape.length; j += 1) {
            rowShape.push(currentBlock.shape[j][i]);
        }
        rotatedShape.push(rowShape);
    }
    
    currentBlock.shape = rotatedShape;
};

// Sets up basics elements.
var setup = function () {
    'use strict';
    canvas = document.getElementById("canvas");
    context = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 800;
    
    // Fragment size is the minor side of the I piece.
    fragmentSize = Math.min(blocks[0].sprite.frame.w, blocks[0].sprite.frame.h);
    
    // Generate first block and next block.
    getNextBlock();
    getNextBlock();
    
    document.addEventListener('keydown', function (event) {
        var blockWidth = (currentBlockAngle === 0 || currentBlockAngle === 180 ?
                          currentBlock.sprite.frame.w : currentBlock.sprite.frame.h);
        
        if (event.keyCode === 38) {
            rotate();
        } else if (event.keyCode === 37) {
            currentBlockPosition.x -= fragmentSize;
        } else if (event.keyCode === 39) {
            currentBlockPosition.x += fragmentSize;
        }
        
        // Check margins.
        if (currentBlockPosition.x < LEFT_MARGIN) {
            currentBlockPosition.x = LEFT_MARGIN;
        } else if (currentBlockPosition.x >
                   (LEFT_MARGIN + (fragmentSize * 10)) - blockWidth) {
            currentBlockPosition.x = (LEFT_MARGIN + (fragmentSize * 10)) - blockWidth;
        }
    });

    console.log('Setup completed.');
};

// Updates current block position.
var updatePosition = function () {
    'use strict';
    currentBlockPosition.y += BLOCK_FALLING_SPEED;
};

// Main game loop.
var mainloop = function () {
    'use strict';
    if (!currentBlock || currentBlockPosition.y +
            (currentBlockAngle === 0 || currentBlockAngle === 180 ?
                    currentBlock.sprite.frame.h : currentBlock.sprite.frame.w)
            >= TOP_MARGIN + fragmentSize * 20) {
        getNextBlock();
    }
    
    updatePosition();
    draw();
};

// Kicks in once the DOM has been loaded.
window.onload = function () {
    'use strict';
    load();
    setup();
    window.setInterval(mainloop, 1000 / FPS);
};