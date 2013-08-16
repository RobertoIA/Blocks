/*global console, window, document, Image*/

// Constants
var FPS = 30;

var canvas = null;
var context = null;

var L = new Image();

var setup = function () {
    'use strict';
    canvas = document.getElementById("canvas");
    context = canvas.getContext('2d');
    canvas.width = 200;
    canvas.height = 200;
    
    L.src = "L.png";
    
    console.log('Setup completed.');
};

var mainloop = function () {
    'use strict';
    console.log('Starting mainloop');
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    context.rect(0, 0, canvas.width, canvas.height);
    context.stroke();
    
    context.drawImage(L, 0, 0);
    
    console.log('Mainloop finished');
};

// Kicks in once the DOM has been loaded.
window.onload = function () {
    'use strict';
    setup();
    window.setInterval(mainloop, 1000 / FPS);
};