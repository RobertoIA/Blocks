/*global console, window, document, XMLHttpRequest, Image*/

// Constants.
var FPS = 60,
    LEFT_MARGIN = 150,
    TOP_MARGIN = 10,
    BLOCK_FALLING_SPEED = 500,
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
    placedBlocks = [];

/*
Utility functions.
*/

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
        for (j = currentBlock.shape.length - 1; j >= 0; j -= 1) {
            rowShape.push(currentBlock.shape[j][i]);
        }
        rotatedShape.push(rowShape);
    }
    
    currentBlock.shape = rotatedShape;
};

// Checks if the current block collides with a previously placed block horizontally.
var checkHorizontalCollision = function () {
    'use strict';
    var i, j,
        horizontalCollisions = {right: false,
                                 left: false},
        blockWidth = (currentBlockAngle === 0 || currentBlockAngle === 180 ?
                      currentBlock.sprite.frame.w : currentBlock.sprite.frame.h),
        width = {right: [],
                 left: []};
  
    // Right side.
    if (currentBlockPosition.x + 1 > (WIDTH - (blockWidth / fragmentSize))) {
        horizontalCollisions.right = true;
    } else {
    
        for (i = 0; i < currentBlock.shape.length; i += 1) {
            for (j = currentBlock.shape[i].length - 1; j >= 0; j -= 1) {
                if (currentBlock.shape[i][j]) {
                    width.right.push(j + 1);
                    break;
                }
            }
        }
        // console.log(width.right);
        
        for (i = 0; i < width.right.length; i += 1) {
            if (board[currentBlockPosition.y
                      + i][currentBlockPosition.x + width.right[i]]) {
                horizontalCollisions.right = true;
            }
        }
    }
    
        // Left side.
    if (currentBlockPosition.x - 1 < 0) {
        horizontalCollisions.left = true;
    } else {
        
        for (i = 0; i < currentBlock.shape.length; i += 1) {
            for (j = 0; j < currentBlock.shape[i].length; j += 1) {
                if (currentBlock.shape[i][j]) {
                    width.left.push(j - 1);
                    break;
                }
            }
        }
        // console.log(width.left);
        
        for (i = 0; i < width.left.length; i += 1) {
            if (board[currentBlockPosition.y
                      + i][currentBlockPosition.x + width.left[i]]) {
                horizontalCollisions.left = true;
            }
        }
    }
    
    return horizontalCollisions;
};

// Checks if the current block collides with a previously placed block vertically.
var checkVerticalCollision = function () {
    'use strict';
    var i, j,
        nextPosition = {x: 0, y: 0},
        blockHeight = (currentBlockAngle === 0 || currentBlockAngle === 180 ?
                    currentBlock.sprite.frame.h : currentBlock.sprite.frame.w),
        height = [];
    
    blockHeight /= fragmentSize;
    
    nextPosition.x = currentBlockPosition.x;
    nextPosition.y = currentBlockPosition.y + blockHeight;
    
    // Checks height of each column.
    for (i = 0; i < currentBlock.shape[0].length; i += 1) {
        for (j = currentBlock.shape.length - 1; j >= 0; j -= 1) {
            if (currentBlock.shape[j][i] === 1) {
                height.push(j + 1);
                break;
            }
        }
    }
    
    // checks for collisions.
    for (i = 0; i < height.length; i += 1) {
        if (board[currentBlockPosition.y + height[i]][currentBlockPosition.x + i]) {
            return true;
        }
    }
    return false;
};

// Places block on the board.
var addToBoard = function (block, position, angle) {
    'use strict';
    var i, j;
    
    placedBlocks.push({block: block,
                           position: {x: position.x,
                                      y: position.y},
                           angle: angle});
    
    for (i = 0; i < block.shape.length; i += 1) {
        for (j = 0; j < block.shape[0].length; j += 1) {
            board[position.y + i][position.x + j] = block.shape[i][j];
        }
    }
};

// Changes block to the next one.
var getNextBlock = function () {
    'use strict';
    var nextBlockNum = Math.floor(Math.random() * 7);
    
    // Generate new block and change current one.
    currentBlock = nextBlock;
    
    nextBlock = {'sprite': blocks[nextBlockNum].sprite,
                 'shape': blocks[nextBlockNum].shape};
    
    // Reset position.
    currentBlockPosition.y = 0;
    currentBlockPosition.x = 4;
    currentBlockAngle = 0;
};

// Updates current block position.
var moveDown = function () {
    'use strict';
    var blockHeight = (currentBlockAngle === 0 || currentBlockAngle === 180 ?
                    currentBlock.sprite.frame.h : currentBlock.sprite.frame.w),
        isAtBottom;
    
    currentBlockPosition.y += 1;
    isAtBottom = currentBlockPosition.y >= HEIGHT - (blockHeight / fragmentSize);
    
    if (!currentBlock || isAtBottom || checkVerticalCollision()) {
        addToBoard(currentBlock, currentBlockPosition, currentBlockAngle);
        getNextBlock();
    }
};

// Moves current block to the right.
var moveRight = function () {
    'use strict';
    var blockWidth = (currentBlockAngle === 0 || currentBlockAngle === 180 ?
                  currentBlock.sprite.frame.w : currentBlock.sprite.frame.h);
  
    if (!checkHorizontalCollision().right) {
        currentBlockPosition.x += 1;
    }
};

// Moves current block to the left.
var moveLeft = function () {
    'use strict';
    
    if (!checkHorizontalCollision().left) {
        currentBlockPosition.x -= 1;
    }
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

/*
Main functions.
*/

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
var drawBlock = function (block, gridPosition, angle) {
    'use strict';
    var i,
        fragments = [],
        fragmentsDrawn = 0,
        position = translateCoordinates(gridPosition),
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
    
    // TEST - Draw board fragments.
    for (i = 0; i < HEIGHT; i += 1) {
        for (j = 0; j < WIDTH; j += 1) {
            context.rect(LEFT_MARGIN + fragmentSize * j,
                         TOP_MARGIN + fragmentSize * i,
                         fragmentSize,
                         fragmentSize);
        }
    }

    context.stroke();
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
    getNextBlock();
    getNextBlock();
    
    document.addEventListener('keydown', function (event) {
        if (event.keyCode === 38) {
            rotate();
        } else if (event.keyCode === 37) {
            moveLeft();
        } else if (event.keyCode === 39) {
            moveRight();
        }
    });

    console.log('Setup completed.');
};

// Main game loop.
var mainloop = function () {
    'use strict';
    
    draw();
};

// Kicks in once the DOM has been loaded.
window.onload = function () {
    'use strict';
    load();
    setup();
    window.setInterval(mainloop, 1000 / FPS);
    window.setInterval(moveDown, BLOCK_FALLING_SPEED);
};