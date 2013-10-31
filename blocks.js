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
    
    this.width = function () {
        
    };
    
    this.height = function () {
        
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
    
    this.moveLeft = function () {
        this.position.x -= 1;
    };
    
    this.moveRight = function () {
        this.position.x += 1;
    };
    
    this.moveDown = function () {
        this.position.y += 1;
    };
    
    this.draw = function () {
        var i,
            fragments = [],
            fragmentsDrawn = 0,
            fragmentsCount = 0,
            position = this.absolutePosition(),
            positionShift = {x: position.x, y: position.y},
            frame = this.sprite.frame;
        
        for (i = 0; i < this.shape.length; i += 1) {
            fragments.push(this.shape[i].length !== 0);
            fragmentsCount += this.shape[i].length !== 0;
        }
        
        context.save();
        if (this.angle === 90) {
            positionShift.x = position.y;
            positionShift.y = -position.x;
            context.translate(frame.h, 0);
        } else if (this.angle === 180) {
            positionShift.x = -position.x;
            positionShift.y = -position.y;
            context.translate(frame.w, frame.h);
        } else if (this.angle === 270) {
            positionShift.x = -position.y;
            positionShift.y = position.x;
            context.translate(0, frame.w);
        }
        context.rotate(this.angle * (Math.PI / 180)); // to radians
    
        if (this.angle === 0) {
            for (i = 0; i < fragments.length; i += 1) {
                if (fragments[i]) {
                    context.drawImage(spriteSheet,
                                      frame.x,
                                      frame.y + (fragmentSize * i),
                                      frame.w, fragmentSize,
                                      positionShift.x,
                                      positionShift.y +
                                      (fragmentSize * fragmentsDrawn),
                                      frame.w, fragmentSize);
                    fragmentsDrawn += 1;
                }
            }
        } else if (this.angle === 90) {
            for (i = 0; i < fragments.length; i += 1) {
                if (fragments[i]) {
                    context.drawImage(spriteSheet,
                                      frame.x + (fragmentSize * i),
                                      frame.y,
                                      fragmentSize, frame.h,
                                      positionShift.x +
                                      (fragmentSize * fragmentsDrawn),
                                      positionShift.y,
                                      fragmentSize, frame.h);
                    fragmentsDrawn += 1;
                }
            }
        } else if (this.angle === 180) {
            for (i = 0; i < fragments.length; i += 1) {
                if (fragments[(fragments.length - 1) - i]) {
                    context.drawImage(spriteSheet,
                                      frame.x,
                                      frame.y + (fragmentSize * i),
                                      frame.w, fragmentSize,
                                      positionShift.x,
                                      positionShift.y + (fragmentSize * fragmentsDrawn)
                                      + fragmentSize *
                                      (fragments.length - fragmentsCount),
                                      frame.w, fragmentSize);
                    fragmentsDrawn += 1;
                }
            }
        } else { // 270
            for (i = 0; i < fragments.length; i += 1) {
                if (fragments[(fragments.length - 1) - i]) {
                    context.drawImage(spriteSheet,
                                      frame.x + (fragmentSize * i),
                                      frame.y,
                                      fragmentSize, frame.h,
                                      positionShift.x + (fragmentSize * fragmentsDrawn)
                                      + fragmentSize *
                                      (fragments.length - fragmentsCount),
                                      positionShift.y,
                                      fragmentSize, frame.h);
                    fragmentsDrawn += 1;
                }
            }
        }
    
        context.restore();
    };
}

function Board() {
    'use strict';
    
    this.grid = function () {
        var i, j, k,
            grid = [],
            row;
    
        // Initialize grid.
        for (i = 0; i < HEIGHT; i += 1) {
            row = [];
            for (j = 0; j < WIDTH; j += 1) {
                row.push(false);
            }
            grid.push(row);
        }
        
        // Add blocks.
        for (i = 0; i < this.blocks.length; i += 1) {
            for (j = 0; j < this.blocks[i].shape.length; j += 1) {
                for (k = 0; k < this.blocks[i].shape[j].length; k += 1) {
                    grid[this.blocks[i].position.y + j][
                        this.blocks[i].position.x + k
                    ] = this.blocks[i].shape[j][k];
                }
            }
        }
        
        return grid;
    };
    
    this.blocks = [];
    
    this.addBlock = function (block) {
        this.blocks.push(block);
    };
    
    this.checkCollision = function (block) {
        var grid = this.grid(),
            collisions = {down: false, right: false, left: false};
        
        // Border collisions.
        if (block.position.x + 1 > (WIDTH - block.width())) {
            collisions.right = true;
        } else if (block.position.x - 1 < 0) {
            collisions.left = true;
        }
        if (block.position.y + 1 > HEIGHT - block.height()) {
            collisions.down = true;
        }
        
        return collisions;
    };
    
    this.draw = function () {
        var i;
        
        context.rect(LEFT_MARGIN, TOP_MARGIN,
                 fragmentSize * WIDTH, fragmentSize * HEIGHT);
        
        for (i = 0; i < this.blocks.length; i += 1) {
            this.blocks[i].draw();
        }
    };
    
    this.print = function () {
        var i, j, row,
            grid = this.grid();
        
        for (i = 0; i < HEIGHT; i += 1) {
            row = "";
            for (j = 0; j < WIDTH; j += 1) {
                row += grid[i][j] ? 'x ' : '_ ';
            }
            console.log(row);
        }
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

var debugLoop = function () {
    'use strict';
    var testBlock1 = new Block(blockData[0].sprite,
                          blockData[0].shape),
        testBlock2 = new Block(blockData[3].sprite,
                          blockData[3].shape),
        testBoard = new Board();
    
    //testBlock1.rotate();
    testBoard.addBlock(testBlock1);
    testBlock2.position.x = 0;
    testBlock2.position.y = 18;
    console.log(testBoard.checkCollision(testBlock2));
    testBoard.addBlock(testBlock2);
    //testBoard.print();
    testBoard.draw();
    
    context.stroke();
};

// Kicks in once the DOM has been loaded.
window.onload = function () {
    'use strict';
    load();
    setup();
    
    //debugLoop();
    window.setInterval(debugLoop, 1000 / FPS);
};