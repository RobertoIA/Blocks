/*global console, window, document, Image*/

// Constants
var FPS = 30;

var canvas = null;
var context = null;

var sprites = [];

var load = function () {
    'use strict';
    var xhr = new XMLHttpRequest();
    var spriteData;
    xhr.open('GET', 'sprites.json', false); // not asynchronous
    xhr.onload = function () {
        spriteData = JSON.parse(this.responseText);
    }
    xhr.send();
    
    /*
    sprites['I'] = ;
    sprites['O'] = ;
    sprites['J'] = ;
    sprites['L'] = ;
    sprites['S'] = ;
    sprites['Z'] = ;
    sprites['T'] = ;
    */
    
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
    
    // context.drawImage(sprites['L'], 0, 0);
};

// Kicks in once the DOM has been loaded.
window.onload = function () {
    'use strict';
    load();
    setup();
    window.setInterval(mainloop, 1000 / FPS);
};