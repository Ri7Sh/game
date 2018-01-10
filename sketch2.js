
function make2DArray(cols, rows) {
  var arr = new Array(cols);
  for (var i = 0; i < arr.length; i++) {
    arr[i] = new Array(rows);
  }
  return arr;
}

var grid;
var cols;
var rows;
var w = 20;

function setup() {
  createCanvas(201, 201);
  cols = floor(width / w);
  rows = floor(height / w);
  grid = make2DArray(cols, rows);
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      grid[i][j] = new Cell(i, j, w);
    }
  }
}
 

function draw() {
  background(255);
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      grid[i][j].show();
    }
  }
}

function mousePressed() {
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      if (grid[i][j].contains(mouseX, mouseY)) {
        var arr = [ i , j ];
        var myJSON = JSON.stringify(arr);

        // xy index send to rigvita
        //obtain output sting in var str
        var str='0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789';
        var p,q,res='';
        for(p=0;p<rows;p++)
        for(q=0;q<cols;q++){
        grid[q][p].number= str.substr(p*rows+q, 1);

        }
      }
    }
  }
}