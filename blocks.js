/*global console, window, document, XMLHttpRequest, Image*/

// Constants.
var FPS = 60,
    SCORE_1LINE = 40,
    SCORE_2LINE = 100,
    SCORE_3LINE = 300,
    SCORE_4LINE = 1200,

    // Size of the minimun fragment of a block.
    fragmentSize,

    // Graphic elements.
    canvas = null,
    context = null,

    // Spritesheet and block data.
    blockData = [],
    spriteSheet = new Image(),
    
    // Current games.
    gameStates = [];

function Block(index, boardSize, boardPosition) {
    'use strict';
    var i,
        shape;
    
    this.sprite = blockData[index].sprite;
    this.shape = [];
    
    shape = blockData[index].shape;
    for (i = 0; i < shape.length; i += 1) {
        this.shape.push(shape[i].slice(0));
    }
    
    this.position = {'x': -5, 'y': 1};
    this.angle = 0;
    
    this.absolutePosition = function () {
        return {'x': (this.position.x * fragmentSize) + boardPosition.x,
                'y': (this.position.y * fragmentSize) + boardPosition.y};
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
    
    this.markRow = function (row) {
        var i, j,
            currentRow = 0;
        
        context.fillStyle = "rgba(255, 255, 255, 1)";
        for (i = 0; i < this.shape.length; i += 1) {
            if (this.shape[i].length > 0) {
                if (currentRow === row) {
                    for (j = 0; j < this.shape[i].length; j += 1) {
                        if (this.shape[i][j]) {
                            context.fillRect(this.absolutePosition().x + fragmentSize * j,
                                 this.absolutePosition().y + fragmentSize * currentRow,
                                 fragmentSize, fragmentSize);
                        }
                    }
                    break;
                }
                currentRow += 1;
            }
        }
        context.fillStyle = "rgba(0, 0, 0, 1)";
    };
    
    this.deleteRow = function (row) {
        var i, currentRow = 0;
        
        for (i = 0; i < this.shape.length; i += 1) {
            if (this.shape[i].length > 0) {
                if (currentRow === row) {
                    this.shape[i] = [];
                    break;
                }
                currentRow += 1;
            }
        }
    };
    
    this.clone = function () {
        var i,
            clone = new Block(index, boardSize, boardPosition);
        
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

function Board(size, position) {
    'use strict';
    
    this.grid = function () {
        return this.partialGrid(null);
    };
    
    this.partialGrid = function (block) {
        var i, j, k,
            x, y,
            grid = [],
            row, rowIndex;
    
        // Initialize grid.
        for (i = 0; i < size.height; i += 1) {
            row = [];
            for (j = 0; j < size.width; j += 1) {
                row.push(false);
            }
            grid.push(row);
        }
        
        // Add blocks.
        for (i = 0; i < this.blocks.length; i += 1) {
            if (this.blocks[i] !== block) { // discriminate block.
                x = this.blocks[i].position.x;
                y = this.blocks[i].position.y;
                rowIndex = 0;
                for (j = 0; j < this.blocks[i].shape.length; j += 1) {
                    if (this.blocks[i].shape[j].length !== 0) {
                        for (k = 0; k < this.blocks[i].shape[j].length; k += 1) {
                            if (this.blocks[i].shape[j][k]) {
                                grid[y + rowIndex][x + k] = true;
                            }
                        }
                        rowIndex += 1;
                    }
                }
            }
        }
        
        return grid;
    };
    
    this.blocks = [];
    
    this.addBlock = function (block) {
        this.blocks.push(block);
    };
    
    this.removeBlock = function (block) {
        var index = this.blocks.indexOf(block);
        
        if (index !== -1) {
            this.blocks.splice(index, 1);
        }
    };
    
    this.checkCollision = function (block) {
        var i, j,
            grid = this.grid(),
            blockShape = {right: [], left: [], bottom: []},
            collisions = {down: true, right: true, left: true};
        
        // Horizontal collisions
        if (block.position.x + 1 > (size.width - block.width())) {
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
        if (block.position.y + 1 > size.height - block.height()) {
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
            board = this.partialGrid(block),
            auxBlock = block.clone(),
            blockPiece, auxBlockPiece, boardPiece;
        
        auxBlock.rotate();
        if (auxBlock.position.x + auxBlock.shape[0].length > size.width) {
            return false;
        }
        if (auxBlock.position.y + auxBlock.shape.length > size.height) {
            return false;
        }

        for (i = 0; i < auxBlock.shape.length; i += 1) {
            for (j = 0; j < auxBlock.shape[i].length; j += 1) {
                auxBlockPiece = auxBlock.shape[i][j];
                boardPiece = board[auxBlock.position.y + i][auxBlock.position.x + j];
                
                if (auxBlockPiece && boardPiece) {
                    return false;
                }
            }
        }
        
        return true;
    };
    
    this.checkLoad = function (savedBlock, currBlock) {
        var i, j,
            board = this.partialGrid(currBlock),
            auxBlockPiece, boardPiece;
        
        for (i = 0; i < savedBlock.shape.length; i += 1) {
            for (j = 0; j < savedBlock.shape[i].length; j += 1) {
                auxBlockPiece = savedBlock.shape[i][j];
                boardPiece = board[currBlock.position.y + i][currBlock.position.x + j];
                
                if (auxBlockPiece && boardPiece) {
                    return false;
                }
            }
        }
        
        return true;
    };
    
    this.checkFilledRows = function () {
        var i, j,
            row,
            grid = this.grid(),
            filledRows = [];
        
        for (i = 0; i < size.height; i += 1) {
            row = true;
            for (j = 0; j < size.width; j += 1) {
                row = row && grid[i][j];
            }
            if (row) {
                filledRows.push(i);
            }
        }
        
        return filledRows;
    };
    
    this.deleteRow = function (row) {
        var i, height, position;

        for (i = 0; i < this.blocks.length; i += 1) {
            height = this.blocks[i].height();
            position = this.blocks[i].position.y;
            
            if (position <= row) {
                if (position + height > row) {
                    this.blocks[i].deleteRow(row - position);
                }
                if (this.blocks[i].height() >= 0) {
                    this.blocks[i].moveDown();
                } else {
                    this.removeBlock(this.blocks[i]);
                }
            }
        }
    };
    
    this.markRow = function (row) {
        var i, height, position;

        for (i = 0; i < this.blocks.length; i += 1) {
            height = this.blocks[i].height();
            position = this.blocks[i].position.y;
            
            if (position <= row && position + height > row) {
                this.blocks[i].markRow(row - position);
            }
        }
    };
    
    this.draw = function () {
        var i, j;
        
        context.rect(position.x, position.y,
                 fragmentSize * size.width, fragmentSize * size.height);
        
        for (i = 0; i < this.blocks.length; i += 1) {
            this.blocks[i].draw();
        }
    };
    
    this.print = function () {
        var i, j, row,
            grid = this.grid();
        
        for (i = 0; i < size.height; i += 1) {
            row = "";
            for (j = 0; j < size.width; j += 1) {
                row += grid[i][j] ? 'x ' : '_ ';
            }
            console.log(row);
        }
    };
}

function GameState(size, position, controls) {
    'use strict';
    var drawText,
        drawScreenFilter,
        reference = this;
    
    document.addEventListener('keydown', function (event) {
        if (!reference.over) {
            if (!reference.paused) {
                if (event.keyCode === controls.rotate) {
                    reference.rotate();
                } else if (event.keyCode === controls.left) {
                    reference.moveLeft();
                } else if (event.keyCode === controls.right) {
                    reference.moveRight();
                } else if (event.keyCode === controls.advance) {
                    reference.advance();
                } else if (event.keyCode === controls.save) {
                    reference.save();
                }
            }
            
            if (event.keyCode === controls.pause) {
                reference.paused = !reference.paused;
            }
        } else if (event.keyCode === controls.rotate ||
                   event.keyCode === controls.left ||
                   event.keyCode === controls.right ||
                   event.keyCode === controls.advance ||
                   event.keyCode === controls.save) {
            reference.reset();
        }
    });
    
    drawText = function (text, x, y, color) {
        context.fillStyle = color;
        context.fillText(text,
                         position.x + (x * fragmentSize),
                         position.y + (y * fragmentSize));
        context.fillStyle = "rgba(0, 0, 0, 1)";
    };
    
    drawScreenFilter = function () {
        context.fillStyle = "rgba(0, 0, 0, 0.5)";
        context.fillRect(position.x, position.y,
                         fragmentSize * size.width, fragmentSize * size.height);
        context.fillStyle = "rgba(0, 0, 0, 1)";
    };
    
    this.draw = function () {
        var i;
        
        this.board.draw();
        this.nextBlock.draw();
        this.savedBlock.draw();
        
        drawText("Next:", -5, 0.5);
        drawText("Saved:", -5, 4.5);
        drawText("Score: " + this.score, -5, 9.5);
        
        for (i = 0; i < this.markedRows.length; i += 1) {
            this.board.markRow(this.markedRows[i]);
        }
        
        if (this.over) {
            drawText("GAME OVER", -5, 10.5);
            drawScreenFilter();
        } else if (this.paused) {
            drawText("PAUSED", -5, 10.5);
            drawScreenFilter();
        }
        
        context.stroke();
    };
    
    this.moveLeft = function () {
        if (this.board.checkCollision(this.block).left) {
            this.block.moveLeft();
        }
    };
    
    this.moveRight = function () {
        if (this.board.checkCollision(this.block).right) {
            this.block.moveRight();
        }
    };
    
    this.rotate = function () {
        if (this.board.checkRotation(this.block)) {
            this.block.rotate();
        }
    };
    
    this.advance = function () {
        var index,
            filledRows,
            i;
        
        for (i = 0; i < this.markedRows.length; i += 1) {
            this.board.deleteRow(this.markedRows[i]);
        }
        
        this.markedRows = [];
        
        if (this.board.checkCollision(this.block).down) {
            this.block.moveDown();
        } else {
            filledRows = this.board.checkFilledRows();
            
            switch (filledRows.length) {
            case 1:
                this.score += SCORE_1LINE;
                break;
            case 2:
                this.score += SCORE_2LINE;
                break;
            case 3:
                this.score += SCORE_3LINE;
                break;
            case 4:
                this.score += SCORE_4LINE;
                break;
            }
            
            for (i = 0; i < filledRows.length; i += 1) {
                this.markedRows.push(filledRows[i]);
            }
            
            this.block = this.nextBlock;
            this.block.position = {'x': 4, 'y': 0};
            this.board.addBlock(this.block);
            
            index = Math.floor(Math.random() * 7);
            this.nextBlock = new Block(index, size, position);
            
            if (!this.board.checkCollision(this.block).down) {
                this.over = true;
            }
        }
    };
    
    this.save = function () {
        if (this.board.checkLoad(this.savedBlock, this.block)) {
            var savedBlock = this.savedBlock;
            this.board.removeBlock(this.block);
            this.savedBlock = this.block;
            savedBlock.position.x = this.block.position.x;
            savedBlock.position.y = this.block.position.y;
            this.block = savedBlock;
            this.board.addBlock(savedBlock);
            this.savedBlock.position.x = -5;
            this.savedBlock.position.y = 5;
        }
    };
    
    this.markedRows = [];
    
    this.loop = function () {
        if (!this.over) {
            if (!this.paused) {
                this.advance();
            }
            window.setTimeout(function () {
                reference.loop();
            }, 1000 / reference.speed);
        }
    };
    
    this.start = function () {
        this.loop();
    };
    
    this.reset = function () {
        var indexA,
            indexB,
            indexC;
        
        indexA = Math.floor(Math.random() * 7);
        indexB = Math.floor(Math.random() * 7);
        indexC = Math.floor(Math.random() * 7);
        
        this.paused = false;
        this.over = false;
        
        this.score = 0;
        this.speed = 5;
        this.board = new Board(size, position);
        this.block = new Block(indexA, size, position);
        
        this.block.position = {'x': 4, 'y': 0};
        this.board.addBlock(this.block);
        
        this.nextBlock = new Block(indexB, size, position);
        this.savedBlock = new Block(indexC, size, position);
        this.savedBlock.position.y += 4;
        this.start();
    };
    
    this.reset();
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
    canvas.width = 1200;
    canvas.height = 700;
    
    // Fragment size is the minor side of the I piece.
    fragmentSize = Math.min(blockData[0].sprite.frame.w, blockData[0].sprite.frame.h);
    
    context.font = "bold 20px Arial";

    console.log('Setup completed.');
};

var drawLoop = function () {
    'use strict';
    var i;
    
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    for (i = 0; i < gameStates.length; i += 1) {
        gameStates[i].draw();
    }
    
    window.setTimeout(drawLoop, 1000 / FPS);
};

// Kicks in once the DOM has been loaded.
window.onload = function () {
    'use strict';
    var i,
        size,
        position,
        controls;
    
    load();
    setup();
    
    document.addEventListener('keydown', function (event) {
        console.log('Pressed keyCode ' + event.keyCode);
    });
    
    size = {'width': 10,
            'height': 20};
    
    position = {'x': 150,
                'y': 10};
    
    controls = {'rotate': 87,
                'left': 65,
                'right': 68,
                'pause': 32,
                'advance': 83,
                'save': 81};
    
    gameStates.push(new GameState(size, position, controls));
    
    position = {'x': 650,
                'y': 10};
    
    controls = {'rotate': 38,
                'left': 37,
                'right': 39,
                'pause': 32,
                'advance': 40,
                'save': 17};
    
    gameStates.push(new GameState(size, position, controls));
    
    drawLoop();
};