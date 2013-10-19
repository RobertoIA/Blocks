/*global console, window, document, XMLHttpRequest, Image*/

// Constants.
var FPS = 6,
    LEFT_MARGIN = 150,
    TOP_MARGIN = 10,
    WIDTH = 10,
    HEIGHT = 20,

    // Size of the minimun fragment of a block.
    fragmentSize,

    // Graphic elements.
    canvas = null,
    context = null,

    // Spritesheet and block data.
    blockData = [],
    spriteSheet = new Image();

function Block(sprite, shape) {
    'use strict';
    var i;

    this.sprite = sprite;
    this.shape = [];
    
    for (i = 0; i < shape.length; i += 1) {
        this.shape.push(shape[i].slice(0));
    }
    
    this.position = {'x': 4, 'y': 0};
    this.angle = 0;
    
    this.absolutePosition = function () {
        return {'x': (this.position.x * fragmentSize) + LEFT_MARGIN,
                'y': (this.position.y * fragmentSize) + TOP_MARGIN};
    };
    
    this.rotate = function () {
        var i, j,
            rowShape,
            rotatedShape = [];
        
        this.angle += 90;
        this.angle %= 360;
        
        // Matrix rotation.
        for (i = 0; i < this.shape[0].length; i += 1) {
            rowShape = [];
            for (j = this.shape.length - 1; j >= 0; j -= 1) {
                rowShape.push(this.shape[j][i]);
            }
            rotatedShape.push(rowShape);
        }
        
        this.shape = rotatedShape;
    };
}

// Loads sprites and sprite data.
var load = function () {
    'use strict';
    var xhr = new XMLHttpRequest(),
        spriteData,
        sprite,
        shape;
    
    // Loads spritesheet.
    spriteSheet.src = 'sprites.png';
    
    // Loads spritesheet data.
    xhr.open('GET', 'sprites.json', false); // not asynchronous
    xhr.onload = function () {
        spriteData = JSON.parse(this.responseText);
    };
    xhr.send();
    
    // Shape of every block
    for (sprite in spriteData.frames) {
        if (spriteData.frames.hasOwnProperty(sprite)) {
            
            switch (spriteData.frames[sprite].filename) {
            case "I.png":
                shape = [[1, 1, 1, 1]];
                break;
            case "J.png":
                shape = [[1, 0, 0], [1, 1, 1]];
                break;
            case "L.png":
                shape = [[0, 0, 1], [1, 1, 1]];
                break;
            case "O.png":
                shape = [[1, 1], [1, 1]];
                break;
            case "S.png":
                shape = [[0, 1, 1], [1, 1, 0]];
                break;
            case "T.png":
                shape = [[0, 1, 0], [1, 1, 1]];
                break;
            case "Z.png":
                shape = [[1, 1, 0], [0, 1, 1]];
                break;
            }
            
            blockData.push({
                'sprite': spriteData.frames[sprite],
                'shape': shape
            });
        }
    }

    console.log('Loading completed.');
};

// Sets up basics elements.
var setup = function () {
    'use strict';
    var i, j, row;
    
    canvas = document.getElementById("canvas");
    context = canvas.getContext('2d');
    canvas.width = 800;
    canvas.height = 800;
    
    // Fragment size is the minor side of the I piece.
    fragmentSize = Math.min(blockData[0].sprite.frame.w, blockData[0].sprite.frame.h);

    console.log('Setup completed.');
};

// Draws a block with the specified parameters.
var drawBlock = function (block) {
    'use strict';
    var i,
        fragments = [],
        fragmentsDrawn = 0,
        fragmentsCount = 0,
        angle = block.angle,
        position = block.absolutePosition(),
        positionShift = {x: position.x, y: position.y},
        frame = block.sprite.frame;
    
    for (i = 0; i < block.shape.length; i += 1) {
        fragments.push(block.shape[i].length !== 0);
        fragmentsCount += block.shape[i].length !== 0;
    }
    
    context.save();
    if (angle === 90) {
        positionShift.x = position.y;
        positionShift.y = -position.x;
        context.translate(frame.h, 0);
    } else if (angle === 180) {
        positionShift.x = -position.x;
        positionShift.y = -position.y;
        context.translate(frame.w, frame.h);
    } else if (angle === 270) {
        positionShift.x = -position.y;
        positionShift.y = position.x;
        context.translate(0, frame.w);
    }
    context.rotate(angle * (Math.PI / 180)); // to radians

    if (angle === 0) { // WORKS, CLEAN
        for (i = 0; i < fragments.length; i += 1) {
            if (fragments[i]) {
                context.drawImage(spriteSheet,
                                  frame.x,
                                  frame.y + (fragmentSize * i),
                                  frame.w, fragmentSize,
                                  positionShift.x,
                                  positionShift.y + (fragmentSize * fragmentsDrawn),
                                  frame.w, fragmentSize);
                fragmentsDrawn += 1;
            }
        }
    } else if (angle === 90) { // WORKS, CLEAN
        for (i = 0; i < fragments.length; i += 1) {
            if (fragments[i]) {
                context.drawImage(spriteSheet,
                                  frame.x + (fragmentSize * i),
                                  frame.y,
                                  fragmentSize, frame.h,
                                  positionShift.x + (fragmentSize * fragmentsDrawn),
                                  positionShift.y,
                                  fragmentSize, frame.h);
                fragmentsDrawn += 1;
            }
        }
    } else if (angle === 180) { // CLEAN
        for (i = 0; i < fragments.length; i += 1) {
            if (fragments[i]) {
                context.drawImage(spriteSheet,
                                  frame.x,
                                  frame.y + (fragmentSize * i),
                                  frame.w, fragmentSize,
                                  positionShift.x,
                                  positionShift.y + (fragmentSize * fragmentsDrawn),
                                  frame.w, fragmentSize);
                fragmentsDrawn += 1;
            }
        }
    } else { // 270 // CLEAN
        for (i = 0; i < fragments.length; i += 1) {
            if (fragments[i]) {
                console.log();
                context.drawImage(spriteSheet,
                                  frame.x + (fragmentSize * i),
                                  frame.y,
                                  fragmentSize, frame.h,
                                  positionShift.x + (fragmentSize * fragmentsDrawn),
                                  positionShift.y,
                                  fragmentSize, frame.h);
                fragmentsDrawn += 1;
            }
        }
    }

    context.restore();
};

var debugLoop = function () {
    'use strict';
    var i,
        testBlock,
        testBlock2,
        testBlock3,
        testBlock4,
        testBlockNum = 2,
        testBlockShape = [];
    
    testBlock = new Block(blockData[testBlockNum].sprite, blockData[testBlockNum].shape);
    testBlock.position.x = -2;
    //testBlock.shape[0] = [];
    //testBlock.shape[1] = [];
    
    testBlock2 = new Block(blockData[testBlockNum].sprite, blockData[testBlockNum].shape);
    testBlock2.rotate();
    //testBlock2.shape[0] = [];
    //testBlock2.shape[1] = [];
    //testBlock2.shape[2] = [];
    
    testBlock3 = new Block(blockData[testBlockNum].sprite, blockData[testBlockNum].shape);
    testBlock3.position.x = 8;
    testBlock3.rotate();
    testBlock3.rotate();
    //testBlock3.shape[0] = [];
    //testBlock3.shape[1] = [];
    
    testBlock4 = new Block(blockData[testBlockNum].sprite, blockData[testBlockNum].shape);
    testBlock4.position.x = 12;
    testBlock4.rotate();
    testBlock4.rotate();
    testBlock4.rotate();
    //testBlock4.shape[0] = [];
    //testBlock4.shape[1] = [];
    //testBlock4.shape[2] = [];
    
    drawBlock(testBlock);
    drawBlock(testBlock2);
    drawBlock(testBlock3);
    drawBlock(testBlock4);
    
    context.stroke();
};

// Kicks in once the DOM has been loaded.
window.onload = function () {
    'use strict';
    load();
    setup();
    window.setInterval(debugLoop, 1000 / FPS);
};