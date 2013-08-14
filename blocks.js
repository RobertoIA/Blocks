var canvas = null;
var context = null;

// Kicks in once the DOM has been loaded.
window.onload = function () {
    canvas = document.getElementById("canvas");
    context = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 600;
};