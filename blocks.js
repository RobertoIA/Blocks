/*global console, window, document, XMLHttpRequest, Image*/

// Constants
var FPS = 60,
    LEFT_MARGIN = 200,
    RIGHT_MARGIN = 600,
    TOP_MARGIN = 0,
    BOTTOM_MARGIN = 800,
    BLOCK_FALLING_SPEED = 3,
    BLOCK_LATERAL_SPEED = 30;

var canvas = null,
    context = null;

var sprites = [],
    spriteSheet = new Image();

// Next block
var nextBlock;

// Current block and status
var currentBlock,
    currentBlockAngle = 0,
    currentBlockPosition = {x: 0, y: 0};

// Blocks already placed.
var placedBlocks = [];

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

var drawBlock = function (block, position, angle) {
    'use strict';
    var positionShift = {x: position.x, y: position.y};
    
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
    
    context.drawImage(spriteSheet,
                      block.x, block.y,
                      block.w, block.h,
                      positionShift.x,
                      positionShift.y,
                      block.w, block.h);
    context.restore();
};

var draw = function () {
    'use strict';

    // Clean screen.
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw placed blocks.
    for (var i = 0; i < placedBlocks.length; i++) {
        drawBlock(placedBlocks[i].block, placedBlocks[i].position,
                  placedBlocks[i].angle);
    }
    
    // Draw current block.
    drawBlock(currentBlock, currentBlockPosition, currentBlockAngle);
    
    // Draw next block.
    drawBlock(nextBlock, {x: 0, y: 0}, 0);
    
    // Draw board limits.
    context.rect(LEFT_MARGIN, TOP_MARGIN,
                 RIGHT_MARGIN - LEFT_MARGIN, BOTTOM_MARGIN - TOP_MARGIN);
    context.stroke();
};

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
    currentBlockPosition.x = LEFT_MARGIN + (RIGHT_MARGIN - LEFT_MARGIN) / 2;
};

var setup = function () {
    'use strict';
    canvas = document.getElementById("canvas");
    context = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 800;
    
    document.addEventListener('keydown', function (event) {
        var blockWidth = (currentBlockAngle === 0 || currentBlockAngle === 180 ?
                          currentBlock.w : currentBlock.h );
        
        if (event.keyCode === 38) {
            currentBlockAngle += 90;
        } else if (event.keyCode === 40) {
            currentBlockPosition.y += BLOCK_FALLING_SPEED * 2;
        } else if (event.keyCode === 37) {
            currentBlockPosition.x -= BLOCK_LATERAL_SPEED;
        } else if (event.keyCode === 39) {
            currentBlockPosition.x += BLOCK_LATERAL_SPEED;
        }
        
        console.log(event.keyCode);
        
        // Check margins.
        if(currentBlockPosition.x < LEFT_MARGIN)
            currentBlockPosition.x = LEFT_MARGIN;
        else if(currentBlockPosition.x > RIGHT_MARGIN - blockWidth)
            currentBlockPosition.x = RIGHT_MARGIN - blockWidth;
        
        // currentBlockAngle = Math.abs(currentBlockAngle);
        currentBlockAngle %= 360;
    });
    
    // Generate first block.
    getNextBlock();
    
    console.log('Setup completed.');
};

var updatePosition = function () {
    'use strict';
    currentBlockPosition.y += BLOCK_FALLING_SPEED;
};

var mainloop = function () {
    'use strict';
    if (!currentBlock || currentBlockPosition.y +
            (currentBlockAngle === 0 || currentBlockAngle === 180 ? currentBlock.h :
                    currentBlock.w) >= canvas.height) {
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