/*global console, window, document, XMLHttpRequest, Image*/

// Constants
var FPS = 30;

var canvas = null;
var context = null;

var sprites = [];
var spriteSheet = new Image();

// Next block
var nextBlock;

// Current block and status
var currentBlock,
    blockAngle = 0,
    blockPosition = {x: 150, y: 0};

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

var draw = function () {
    'use strict';

    // Clean screen.
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw current block.
    var position = {x: blockPosition.x, y: blockPosition.y};

    context.save();
    if (blockAngle === 90) {
        position.x = blockPosition.y;
        position.y = -blockPosition.x;
        context.translate(currentBlock.h, 0);
    } else if (blockAngle === 180) {
        context.translate(currentBlock.w, currentBlock.h);
        position.x = -blockPosition.x;
        position.y = -blockPosition.y;
    } else if (blockAngle === 270) {
        position.x = -blockPosition.y;
        position.y = blockPosition.x;
        context.translate(0, currentBlock.w);
    }
    context.rotate(blockAngle * (Math.PI / 180)); // to radians
    
    context.drawImage(spriteSheet,
                      currentBlock.x, currentBlock.y,
                      currentBlock.w, currentBlock.h,
                      position.x,
                      position.y,
                      currentBlock.w, currentBlock.h);
    context.restore();
    
    // Draw next block.
    context.drawImage(spriteSheet,
                      nextBlock.x, nextBlock.y,
                      nextBlock.w, nextBlock.h,
                      0, 0,
                      nextBlock.w, nextBlock.h);
    
    // Draw canvas limits.
    context.rect(0, 0, canvas.width, canvas.height);
    context.stroke();
};

var getNextBlock = function () {
    'use strict';
    // Generate new block and change current one.
    currentBlock = nextBlock;
    nextBlock = sprites[Math.floor(Math.random() * 7)].frame;
    
    // Reset position.
    blockPosition.y = 0;
    blockPosition.x = 150;
};

var setup = function () {
    'use strict';
    canvas = document.getElementById("canvas");
    context = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 200;
    
    // Generate first block.
    getNextBlock();
    
    console.log('Setup completed.');
};

var mainloop = function () {
    'use strict';
    
    if (blockPosition.y >= canvas.height || !currentBlock) {
        getNextBlock();
    }
    
    //blockAngle += 90;
    blockAngle %= 360;
    
    draw();
};

var updatePosition = function () {
    'use strict';
    blockPosition.y += 30;
};

// Kicks in once the DOM has been loaded.
window.onload = function () {
    'use strict';
    load();
    setup();
    // window.setInterval(mainloop, 1000 / FPS);
    window.setInterval(mainloop, 1000 / 3);
    window.setInterval(updatePosition, 1000);
};