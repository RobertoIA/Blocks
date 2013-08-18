/*global console, window, document, XMLHttpRequest, Image*/

// Constants
var FPS = 30;

var canvas = null;
var context = null;

var sprites = [];
var spriteSheet = new Image();

var load = function () {
    'use strict';
    var xhr = new XMLHttpRequest(),
        spriteData,
        spriteName,
        sprite;
    
    // Loads spritesheet.
    spriteSheet.src = 'sprites.png';
    
    // Loads spritesheet data.
    xhr.open('GET', 'sprites.json', false); // not asynchronous
    xhr.onload = function () {
        spriteData = JSON.parse(this.responseText);
    };
    xhr.send();
    sprites = spriteData.frames;
    
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
    var nextBlock = Math.floor(Math.random() * 7),
        nextBlockSprite;
    
    switch(nextBlock) {
            case 0:
                nextBlockSprite = sprites['I.png'].frame;
                break;
            case 1:
                nextBlockSprite = sprites['O.png'].frame;
                break;
            case 2:
                nextBlockSprite = sprites['J.png'].frame;
                break;
            case 3:
                nextBlockSprite = sprites['L.png'].frame;
                break;
            case 4:
                nextBlockSprite = sprites['S.png'].frame;
                break;
            case 5:
                nextBlockSprite = sprites['Z.png'].frame;
                break;
            case 6:
                nextBlockSprite = sprites['T.png'].frame;
                break;
    }
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    context.rect(0, 0, canvas.width, canvas.height);
    context.stroke();

    context.drawImage(spriteSheet, nextBlockSprite.x, nextBlockSprite.y,
                      nextBlockSprite.w, nextBlockSprite.h,
                      0, 0,
                      nextBlockSprite.w, nextBlockSprite.h);
};

// Kicks in once the DOM has been loaded.
window.onload = function () {
    'use strict';
    load();
    setup();
    window.setInterval(mainloop, 1000 / FPS);
};