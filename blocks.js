/*global console, window, document, XMLHttpRequest, Image*/

// Constants
var FPS = 30;

var canvas = null;
var context = null;

var sprites = [];
var spriteSheet = new Image();

// Block status
var blockAngle = 0,
    blockPosition = {x:0, y:0};

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
    var nextBlock = sprites[0].frame//sprites[Math.floor(Math.random() * 7)].frame;
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    context.rect(0, 0, canvas.width, canvas.height);
    context.stroke();

    context.save();
    context.translate((nextBlock.w / 2),
                      (nextBlock.h / 2));
    context.rotate(blockAngle * (Math.PI / 180)); // to radians
    context.translate(-(nextBlock.w / 2),
                      -(nextBlock.h / 2));
    context.drawImage(spriteSheet,
                      nextBlock.x, nextBlock.y,
                      nextBlock.w, nextBlock.h,
                      blockPosition.x,
                      blockPosition.x,
                      nextBlock.w, nextBlock.h);
    context.restore();
    
    blockAngle += 90;
    blockAngle %= 360;
    
    //blockPosition.y += 10;
    //blockPosition.y %= canvas.height - nextBlock.h;
};

// Kicks in once the DOM has been loaded.
window.onload = function () {
    'use strict';
    load();
    setup();
    // window.setInterval(mainloop, 1000 / FPS);
    window.setInterval(mainloop, 1000);
};