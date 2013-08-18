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
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    context.rect(0, 0, canvas.width, canvas.height);
    context.stroke();
    
    var sp = sprites['L.png'].frame;
    context.drawImage(spriteSheet, sp.x, sp.y, sp.w, sp.h, 0, 0, sp.w, sp.h);
};

// Kicks in once the DOM has been loaded.
window.onload = function () {
    'use strict';
    load();
    setup();
    window.setInterval(mainloop, 1000 / FPS);
};