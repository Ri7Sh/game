/*****

Jigsaw puzzle front-end 
@Credits: Neethu Mariya Joy
(roboneet.github.io)

*****/


/***************
================

CONSTANTS

================
***************/
var PIECE_WIDTH = 70, PIECE_HEIGHT = 70, ROWS = 3, COLS = 3;


/***************
================

Game
@config
grid: Grid
peiceList: Array<Peice>
[debug] = false

@function start
@params `none` 

@function setPieceEventListeners
@params peice: Peice


@function snapPeice
@params peice: Peice


@function dragDiv
@params piece: Peice


@function log
@params (same as console.log params)


@function debug
@params bool: boolean


================
***************/
function Game(grid, pieceList, debug=false){
	this.grid = grid;
	this.pieceList = pieceList;
	this.debug(debug);
}


Game.prototype.start = function(){
	this.dragDiv = this.dragDiv.bind(this);

	pieceList.forEach(p => {
		this.setPieceEventListeners(p);
	})
}

Game.prototype.setPieceEventListeners = function(piece){
	var ele = piece.ele;
	piece.ele.setAttribute('draggable', false);
	ele.addEventListener('click', controlPiece.bind(this));

	function controlPiece(){
		this.log("CONTROL PIECE");
		this.snapPiece(piece);
		if(piece.toggleDrag()){
			ele.addEventListener('mousemove',this.dragDiv(piece) , false);		
		}else{
			ele.removeEventListener('mousemove', this.dragDiv(piece), false);
			this.log('removeEventListener...', ele.onmousemove);
		}
	}
}

Game.prototype.snapPiece = function(piece){
	if(this.grid.isInsideTable(piece.rect())){
		this.grid.snapToGrid(piece);
	}else{
		piece.setBack();
		this.grid.hightlightGridBlock(piece.rect());
	}
}

Game.prototype.dragDiv = function(piece){
	return (function(e){
		if(piece.isDraggable){
			piece.removeCell();
			var ele = e.target;
			
			var [left, top] = services.getAbsolutePosition(ele.parentNode, [e.clientX, e.clientY]);
			ele.style.left = left - (ele.offsetWidth/2) + "px";
			ele.style.top = top - (ele.offsetHeight/2) + "px";

			this.grid.hightlightGridBlock(ele.getClientRects()[0]);
		}
	}).bind(this)
}

Game.prototype.log = function(msg){
	// do nothing 
}

Game.prototype.debug = function(bool){
	if(bool)
		this.log = console.log;
	this.grid.log = this.log;
	this.pieceList.forEach(p=> {
		p.log = this.log
	})
	this.grid.cells.forEach(c=> {
		c.log = this.log
	})
}

Game.prototype.setSequence = function(arr){
	arr.forEach((el, index)=>{
		this.grid.addPiece()	
	})
	
}

Game.prototype.getSequence = function(){
	return this.grid.cells.map(c => c.getPieceIndex());
}

/***************
================

Piece
@config
ele : HTMLNode
[cell : Cell] = null

@function rect 
@params `none`


@function setCell 
@params cell: Cell


@function toggleDrag 
@params `none`


@function highlight 
@params `none`


@function removeCell 
@params `none`


@function getIndex 
@params `none`


@function setBack 
@params `none`


================
***************/
function Piece(ele,id=0, cell=null){
	this.ele = ele;
	this.cell = cell;
	this.isDraggable = false;
	this.id = id;
}

Piece.prototype.rect = function(){
	return this.ele.getClientRects()[0];
}

Piece.prototype.setCell = function(cell){
	this.cell = cell;
	var [left, top] = services.getAbsolutePosition(this.ele.parentNode, [cell.rect().left, cell.rect().top])
	this.ele.style.top = top + "px";
	this.ele.style.left = left + "px";	
}

Piece.prototype.toggleDrag = function(){
	this.isDraggable = !this.isDraggable;
	if(this.isDraggable){
		this.ele.style.zIndex = 999;
	}else{
		this.ele.style.zIndex = 0;
	}
	this.highlight();
	return this.isDraggable;
}

Piece.prototype.highlight = function(){
	var old = document.querySelector('.selected');
	if(this.isDraggable){
		if(old)
			old.className = old.className.replace('selected', '');
		this.ele.className += " selected";
	}else{
		if(old == this.ele){
			old.className = old.className.replace('selected', '');
		}

	}
}

Piece.prototype.removeCell = function(){
	if(this.cell){
		console.log(this.cell)
		this.cell.removePiece();
	}
	this.cell = null;
}

Piece.prototype.getIndex = function(){
	// return this.ele.getAttribute('data-index');
	return this.id;
}

Piece.prototype.setBack = function(){
	var [left, top] = services.getPieceDefaultPosition(this.ele.parentNode, this.getIndex());
	this.ele.style.top = top + "px";
	this.ele.style.left = left + "px";
}


/***************
================

Grid
@config
table: HTMLNode
cells: HTMLNodeList
[config] = {rows:3 , height:3}

@function addPiece 
@params piece: Peice, cell: Cell

@function hightlightGridBlock 
@params eleRect: DOMRect

@function snapToGrid 
@params piece: Peice

@function findClosestBlock 
@params eleRect: DOMRect

@function isInsideTable 
@params eleRect: DOMRect

@function getCenterX 
@params rect: DOMRect

@function getCenterY 
@params rect: DOMRect

================
***************/
function Grid(table, cells, config={rows:3, cols:3}){
	this.table = table;
	this.cells = Array.prototype.map.call(cells, c => new Cell(c));
	this.tableRect = table.getClientRects()[0];
	this.pieceList = new Array();
	this.config = config;
}

Grid.prototype.addPiece = function(piece, cell){
	this.log(piece, cell, this);
	piece.setCell(cell);
	cell.setPiece(piece);
}

Grid.prototype.hightlightGridBlock = function(eleRect){
	if(this.isInsideTable(eleRect)){
		var cell = this.findClosestBlock(eleRect);
		cell.highlight();
	}else{
		var old = document.querySelector('.highlighted');
		if(old){
			old.classname = old.className.replace('highlighted', '');
		}
	}
}

Grid.prototype.snapToGrid = function(piece){
	var eleRect = piece.rect();
	var cell = this.findClosestBlock(eleRect);
	this.log(cell);
	this.addPiece(piece, cell);
}

Grid.prototype.findClosestBlock = function(eleRect){
	var xLines = new Array(this.config.rows - 1).fill(0).map((ele, index)=>{
		return this.cells[index].rect().right;
	});
	var yLines = new Array(this.config.cols - 1).fill(0).map((ele, index)=>{
		return this.cells[this.config.rows*index].rect().bottom;
	});

	var colPos = findPosToInsert(this.getCenterX(eleRect), xLines);
	var rowPos = findPosToInsert(this.getCenterY(eleRect), yLines);				
	
	return this.cells[rowPos*this.config.rows + colPos];

	function findPosToInsert(ele, arr){ //sorted array 
		for(i in arr){
			if(arr[i] >= ele){
				return parseInt(i); 
			}
		}
		return arr.length;
	}

}


Grid.prototype.isInsideTable = function(eleRect){
	
	var rightBoundary = (this.getCenterX(eleRect) < this.tableRect.right);
	var leftBoundary = (this.getCenterX(eleRect) > this.tableRect.left);
	var bottomBoundary = (this.getCenterY(eleRect) < this.tableRect.bottom);
	var topBoundary = (this.getCenterY(eleRect) > this.tableRect.top);
	
	return (
		rightBoundary &&
		leftBoundary && 
		bottomBoundary &&
		topBoundary
	)
}

Grid.prototype.getCenterX = function(rect){

	// this.log('getCenterX >> ', rect.x, rect.width);
	return rect.x + (rect.width/2);
}

Grid.prototype.getCenterY = function(rect){
	return rect.y + (rect.height/2);
}

/***************
================

Cell

@function rect
@params `none`

@function setPiece
@params piece: Peice

@function getPieceIndex
@params `none`

@function removePiece
@params piece: Peice

@function highlight
@params piece: Peice


================
***************/
function Cell(cell, piece=null){
	this.cell = cell;
	this.highlighted = false;
	this.piece = piece;
}

Cell.prototype.rect = function(){
	return this.cell.getClientRects()[0];
}

Cell.prototype.setPiece = function(piece){
	this.piece = piece;
}

Cell.prototype.getPieceIndex = function(){
	if(this.piece){
		return this.piece.getIndex();
	}
	return null;
}

Cell.prototype.removePiece = function(piece){
	this.piece = null;
}

Cell.prototype.highlight = function(piece){
	var old = document.querySelector('.highlighted');
	if(old){
		old.className = old.className.replace('highlighted', '');
	}
	this.cell.className += ' highlighted';
}
Cell.prototype.setRed = function(peice){
	this.cell.className += " red";
	console.log(this.cell.className)
	setTimeout(()=>{
		this.cell.className = this.cell.className.replace(' red', '');
	}, 4000)
}


/***************
================

other very useful functions

================
***************/

services = {};

services.getAbsolutePosition = function(eleParent, pageOffsets){	
	var [pageLeft, pageTop] = pageOffsets;
	// console.log(pageOffsets)
	return [pageLeft - eleParent.offsetLeft + window.scrollX, pageTop - eleParent.offsetTop + window.scrollY]
}

services.getPieceDefaultPosition = function(eleParent, index){
	var container = document.querySelector('.image_container');
	var containerRect = container.getClientRects()[0];
	var spacing = 10;
	var padding = 20;
	var leftOffset = (PIECE_WIDTH + spacing )* index;

	var left = leftOffset % (containerRect.width - padding*2) + padding;
	var top = padding + Math.floor(leftOffset/(containerRect.width - 2*padding))*(PIECE_HEIGHT + spacing);
	
	return services.getAbsolutePosition(eleParent, [left + containerRect.left, top + containerRect.top]);
}


/***************
================

create scene

================
***************/




var pieces = ['./img/pieces/superman/image_part_005.jpg', './img/pieces/superman/image_part_009.jpg', './img/pieces/superman/image_part_001.jpg', './img/pieces/superman/image_part_007.jpg', './img/pieces/superman/image_part_002.jpg', './img/pieces/superman/image_part_004.jpg', './img/pieces/superman/image_part_008.jpg', './img/pieces/superman/image_part_003.jpg', './img/pieces/superman/image_part_006.jpg']

var board = document.getElementById('board');
var container  = document.createElement('div');
container.className = "image_container";
board.appendChild(container);

var scene = document.createDocumentFragment();

var tableEle = document.createElement('table');
tableEle.className = 'grid';
for(var i = 0; i< ROWS; i++){
	var tr = document.createElement('tr');
	for(var k = 0; k< COLS; k++){
		tr.appendChild(document.createElement('td'));
	}
	tableEle.appendChild(tr);
}

board.insertBefore(tableEle, board.firstChild);


//For all practical purposes .......

pieces.forEach((src, index)=>{
	var img = document.createElement('img');
	img.className = 'piece';
	img.src = src;
	// img.setAttribute("data-index", index);
	img.position = "absolute";
	var pos = services.getPieceDefaultPosition(document.getElementById('board'), index)
	img.style.top = pos[1] + "px";
	img.style.left = pos[0] + "px";
	img.style.width = PIECE_WIDTH + "px";
	img.style.height = PIECE_HEIGHT +  "px";

	scene.appendChild(img);
})



// new Array((ROWS * COLS)).fill(0).forEach((ele, index)=>{
// 	var div = document.createElement('div');
// 	div.className = 'piece number';
// 	div.innerText = index;

// 	div.style.backgroundColor = "#" + getRandomNumber();

// 	div.setAttribute("data-index", index);
// 	div.position = "absolute";
// 	var pos = services.getPieceDefaultPosition(document.getElementById('board'), index)
// 	div.style.top = pos[1] + "px";
// 	div.style.left = pos[0] + "px";
// 	div.style.width = PIECE_WIDTH + "px";
// 	div.style.height = PIECE_HEIGHT +  "px";

// 	scene.appendChild(div);
// })

function getRandomNumber(){
	return ("000"+(Math.random()*999).toString()).slice(-3)
}

board.appendChild(scene);




/***************
================

my game config

================
***************/

var table = document.querySelector('.grid');
var cells = document.querySelector('.grid').querySelectorAll('td');
var pieces = document.querySelectorAll('.piece');

var grid = new Grid(table, cells, {
	rows: ROWS,
	cols: COLS
});
var pieceList = Array.prototype.map.call(pieces , (ele, i) => new Piece(ele, i));
var game = new Game(grid, pieceList);


/***************
================

Start ^_^ (yay!)

================
***************/
game.start();


document.querySelector('button').addEventListener('click', ()=>{
 	var boardSequence = game.getSequence();
 	console.log(boardSequence);
 	// if(result.status){
 	// 	table.className += " won";
 	// 	document.querySelector('#output').innerText = "You Win!";
 	// }else{
 	// 	result.cells.forEach((ele)=>{
 	// 		this.grid.cells[ele].setRed();		
 	// 	})
 	// }

})

// dummy implementation
// Game.prototype.checkSequence = function(){
// 	var sequence = this.getSequence()
// 	var result = {
// 		status: true,

// 	}

// 	sequence.forEach((ele, index)=>{
// 		if(ele!=index){
// 			result.status = false;
// 			if(!result.cells){
// 				result.cells = [index];
// 			}
			
// 			result.cells.push(index);
// 		}
// 	})
// 	return result;
// }
 
