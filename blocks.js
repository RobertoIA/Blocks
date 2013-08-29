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

    // Spritesheet and sprite data.
    sprites = [],
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
        sprite;
    
    // Loads spritesheet.
    spriteSheet.src = 'sprites.png';
    
    // Loads spritesheet data.
    xhr.open('GET', 'sprites.json', false); // not asynchronous
    xhr.onload = function () {
        spriteData = JSON.parse(this.responseText);
    };
    xhr.send();
    
    for (sprite in spriteData.frames) {
        if (spriteData.frames.hasOwnProperty(sprite)) {
            sprites.push(spriteData.frames[sprite]);
        }
    }

    console.log('Loading completed.');
};

// Draws a block with the specified parameters.
var drawBlock = function (block, position, angle, fragments) {
    'use strict';
    var i,
        fragmentsDrawn = 0,
        positionShift = {x: position.x, y: position.y};
    
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
    
    if (!fragments) {
        context.drawImage(spriteSheet,
                      block.x, block.y,
                      block.w, block.h,
                      positionShift.x,
                      positionShift.y,
                      block.w, block.h);
    } else {
        for (i = 0; i < fragments.length; i += 1) {
            if (fragments[i]) {
                if (angle === 0 || angle === 180) {
                    context.drawImage(spriteSheet,
                                      block.x, block.y + (fragmentSize * fragmentsDrawn),
                                      block.w, fragmentSize,
                                      positionShift.x,
                                      positionShift.y + (fragmentSize * fragmentsDrawn),
                                      block.w, fragmentSize);
                } else {
                    context.drawImage(spriteSheet,
                                      block.x + (fragmentSize * fragmentsDrawn), block.y,
                                      fragmentSize, block.h,
                                      positionShift.x + (fragmentSize * fragmentsDrawn),
                                      positionShift.y,
                                      fragmentSize, block.h);
                }
                fragmentsDrawn += 1;
            }
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
    
    // TEST - width and height calculation in fragments.
    /*
    if (currentBlockAngle === 0 || currentBlockAngle === 180) {
        console.log('width ' + Math.round(currentBlock.w / fragmentSize));
        console.log('height ' + Math.round(currentBlock.h / fragmentSize));
    } else {
        console.log('height ' + Math.round(currentBlock.w / fragmentSize));
        console.log('width ' + Math.round(currentBlock.h / fragmentSize));
    }
    */
    
    // TEST - draw part of a block
    // drawBlock(sprites[0].frame, {x: 0, y: 100}, 90, [true, false, false, true]);
};

// Changes block to the next one.
var getNextBlock = function () {
    'use strict';
    if (currentBlock) {
        placedBlocks.push({block: currentBlock,
                           position: {x: currentBlockPosition.x,
                                      y: currentBlockPosition.y},
                           angle: currentBlockAngle});
    }
    // Generate new block and change current one.
    currentBlock = nextBlock;
    nextBlock = sprites[Math.floor(Math.random() * 7)].frame;
    
    // Reset position.
    currentBlockPosition.y = TOP_MARGIN;
    currentBlockPosition.x = LEFT_MARGIN + fragmentSize * 5;
    currentBlockAngle = 0;
};

// Sets up basics elements.
var setup = function () {
    'use strict';
    canvas = document.getElementById("canvas");
    context = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 800;
    
    // Fragment size is the minor side of the I piece.
    fragmentSize = Math.min(sprites[0].frame.w, sprites[0].frame.h);
    
    document.addEventListener('keydown', function (event) {
        var blockWidth = (currentBlockAngle === 0 || currentBlockAngle === 180 ?
                          currentBlock.w : currentBlock.h);
        
        if (event.keyCode === 38) {
            currentBlockAngle += 90;
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
        
        // currentBlockAngle = Math.abs(currentBlockAngle);
        currentBlockAngle %= 360;
    });
    
    // Generate first block.
    getNextBlock();
    
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
            (currentBlockAngle === 0 || currentBlockAngle === 180 ? currentBlock.h :
                    currentBlock.w) >= TOP_MARGIN + fragmentSize * 20) {
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