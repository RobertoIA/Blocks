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
    spriteSheet = new Image(),
    
    gameState;

function Block(index) {
    'use strict';
    var i,
        shape;
    
    this.sprite = blockData[index].sprite;
    this.shape = [];
    
    shape = blockData[index].shape;
    for (i = 0; i < shape.length; i += 1) {
        this.shape.push(shape[i].slice(0));
    }
    
    this.position = {'x': -5, 'y': 0};
    this.angle = 0;
    
    this.absolutePosition = function () {
        return {'x': (this.position.x * fragmentSize) + LEFT_MARGIN,
                'y': (this.position.y * fragmentSize) + TOP_MARGIN};
    };
    
    this.width = function () {
        return this.shape[0].length;
    };
    
    this.height = function () {
        var i, rowCount = 0;
        
        for (i = 0; i < this.shape.length; i += 1) {
            if (this.shape[i].length !== 0) {
                rowCount += 1;
            }
        }
        
        return rowCount;
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
    
    this.clone = function () {
        var i,
            clone = new Block(index);
        
        clone.position.x = this.position.x;
        clone.position.y = this.position.y;
        
        for (i = 0; i < this.angle / 90; i += 1) {
            clone.rotate();
        }
        
        return clone;
    };
    
    this.print = function () {
        var i, j, row;
        
        for (i = 0; i < this.shape.length; i += 1) {
            row = "";
            for (j = 0; j < this.shape[0].length; j += 1) {
                row += this.shape[i][j] ? 'x ' : '_ ';
            }
            console.log(row);
        }
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
            row, rowIndex;
    
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
            rowIndex = 0;
            for (j = 0; j < this.blocks[i].shape.length; j += 1) {
                if (this.blocks[i].shape[j].length !== 0) {
                    for (k = 0; k < this.blocks[i].shape[j].length; k += 1) {
                        grid[this.blocks[i].position.y + rowIndex][
                            this.blocks[i].position.x + k
                        ] = this.blocks[i].shape[j][k];
                    }
                    rowIndex += 1;
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
        var i, j,
            grid = this.grid(),
            blockShape = {right: [], left: [], bottom: []},
            collisions = {down: true, right: true, left: true};
        
        // Horizontal collisions
        if (block.position.x + 1 > (WIDTH - block.width())) {
            collisions.right = false;
        } else if (block.position.x - 1 < 0) {
            collisions.left = false;
        } else {
            // With other blocks.
            for (i = 0; i < block.shape.length; i += 1) {
                for (j = block.shape[i].length - 1; j >= 0; j -= 1) {
                    if (block.shape[i][j]) {
                        blockShape.right.push(j + 1);
                        break;
                    }
                }
                for (j = 0; j < block.shape[i].length; j += 1) {
                    if (block.shape[i][j]) {
                        blockShape.left.push(j - 1);
                        break;
                    }
                }
            }
            for (i = 0; i < blockShape.right.length; i += 1) {
                if (grid[block.position.y + i][block.position.x +
                                                    blockShape.right[i]]) {
                    collisions.right = false;
                }
                if (grid[block.position.y + i][block.position.x +
                                                    blockShape.left[i]]) {
                    collisions.left = false;
                }
            }
        }
        
        // Vertical collisions.
        if (block.position.y + 1 > HEIGHT - block.height()) {
            collisions.down = false;
        } else {
            // With other blocks.
            for (i = 0; i < block.shape[0].length; i += 1) {
                for (j = block.shape.length - 1; j >= 0; j -= 1) {
                    if (block.shape[j][i]) {
                        blockShape.bottom.push(j + 1);
                        break;
                    }
                }
            }
            for (i = 0; i < blockShape.bottom.length; i += 1) {
                if (grid[block.position.y + blockShape.bottom[i]][block.position.x +
                                                                       i]) {
                    collisions.down = false;
                }
            }
        }
        
        return collisions;
    };
    
    this.checkRotation = function (block) {
        var i, j,
            board = this.grid(),
            auxBlock = block.clone();
        
        auxBlock.rotate();
        if (auxBlock.position.x + auxBlock.shape.length > WIDTH) {
            return false;
        }
        if (auxBlock.position.y + auxBlock.shape[0].length > HEIGHT) {
            return false;
        }
        
        //console.log(board);
        for (i = 0; i < auxBlock.shape.length; i += 1) {
            for (j = 0; j < auxBlock.shape[i].length; j += 1) {
                console.log(auxBlock.shape[i][j]);
                console.log(auxBlock.position.x + j);
                console.log(board[auxBlock.position.x + j]);
                //console.log(board[auxBlock.position.x + j][auxBlock.position.y + i]);
            }
        }
        
        return true;
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

function GameState() {
    'use strict';
    var indexA,
        indexB;
    
    indexA = Math.floor(Math.random() * 7);
    indexB = Math.floor(Math.random() * 7);
    
    this.board = new Board();
    
    this.block = new Block(indexA);
    this.movement = {right: false, left: false, rotate: false};
    
    this.block.position = {'x': 4, 'y': 0};
    this.board.addBlock(this.block);
    
    this.nextBlock = new Block(indexB);
    
    this.draw = function () {
        this.board.draw();
        this.nextBlock.draw();
    };
    
    this.moveLeft = function () {
        this.movement.left = true;
    };
    
    this.moveRight = function () {
        this.movement.right = true;
    };
    
    this.rotate = function () {
        this.movement.rotate = true;
    };
    
    this.advance = function () {
        var index;
        
        if (this.movement.left && this.board.checkCollision(this.block).left) {
            this.block.moveLeft();
        }
        if (this.movement.right && this.board.checkCollision(this.block).right) {
            this.block.moveRight();
        }
        if (this.movement.rotate && this.board.checkRotation(this.block)) {
            this.block.rotate();
        }
        
        this.movement.left = false;
        this.movement.right = false;
        this.movement.rotate = false;
        
        if (this.board.checkCollision(this.block).down) {
            this.block.moveDown();
        } else {
            this.block = this.nextBlock;
            this.block.position = {'x': 4, 'y': 0};
            this.board.addBlock(this.block);
            
            index = Math.floor(Math.random() * 7);
            this.nextBlock = new Block(index);
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
                shape = [[true, true, true, true]];
                break;
            case "J.png":
                shape = [[true, false, false], [true, true, true]];
                break;
            case "L.png":
                shape = [[false, false, true], [true, true, true]];
                break;
            case "O.png":
                shape = [[true, true], [true, true]];
                break;
            case "S.png":
                shape = [[false, true, true], [true, true, false]];
                break;
            case "T.png":
                shape = [[false, true, false], [true, true, true]];
                break;
            case "Z.png":
                shape = [[true, true, false], [false, true, true]];
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
    canvas.height = 700;
    
    // Fragment size is the minor side of the I piece.
    fragmentSize = Math.min(blockData[0].sprite.frame.w, blockData[0].sprite.frame.h);

    console.log('Setup completed.');
};

var debugLoop = function () {
    'use strict';
    
    // Clean screen.
    context.clearRect(0, 0, canvas.width, canvas.height);

    gameState.advance();
    gameState.draw();
    
    context.stroke();
};

// Kicks in once the DOM has been loaded.
window.onload = function () {
    'use strict';
    var board,
        block,
        nextBlock;
    
    load();
    setup();
    
    gameState = new GameState();
    
    document.addEventListener('keydown', function (event) {
        if (event.keyCode === 38) {
            gameState.rotate();
        } else if (event.keyCode === 37) {
            gameState.moveLeft();
        } else if (event.keyCode === 39) {
            gameState.moveRight();
        }
    });
    
    gameState.board.print();
    console.log('');
    gameState.block.print();
    
    //debugLoop();
    window.setInterval(debugLoop, 1000 / FPS);
};