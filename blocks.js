/*global console, window, document, XMLHttpRequest, Image*/

// Constants
var FPS = 30;

var canvas = null;
var context = null;

var sprites = [];
var spriteSheet = new Image();

// Block status
var blockAngle = 0,
    blockPosition = {x: 0, y: 0};

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

var setup = function () {
    'use strict';
    canvas = document.getElementById("canvas");
    context = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 200;
    
    console.log('Setup completed.');
};

var mainloop = function () {
    'use strict';
    var nextBlock = sprites[Math.floor(Math.random() * 7)].frame,
        position = {x: blockPosition.x, y: blockPosition.y};
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    context.rect(0, 0, canvas.width, canvas.height);
    context.stroke();

    context.save();
    if (blockAngle === 90) {
        position.x = blockPosition.y;
        position.y = -blockPosition.x;
        context.translate(nextBlock.h, 0);
    } else if (blockAngle === 180) {
        context.translate(nextBlock.w, nextBlock.h);
        position.x = -blockPosition.x;
        position.y = -blockPosition.y;
    } else if (blockAngle === 270) {
        position.x = -blockPosition.y;
        position.y = blockPosition.x;
        context.translate(0, nextBlock.w);
    }
    context.rotate(blockAngle * (Math.PI / 180)); // to radians
    
    context.drawImage(spriteSheet,
                      nextBlock.x, nextBlock.y,
                      nextBlock.w, nextBlock.h,
                      position.x,
                      position.y,
                      nextBlock.w, nextBlock.h);
    context.restore();
    
    blockAngle += 90;
    blockAngle %= 360;
    
    blockPosition.x += 10;
    blockPosition.x %= canvas.width;
    blockPosition.y += 10;
    blockPosition.y %= canvas.height;
};

// Kicks in once the DOM has been loaded.
window.onload = function () {
    'use strict';
    load();
    setup();
    // window.setInterval(mainloop, 1000 / FPS);
    window.setInterval(mainloop, 1000 / 3);
};