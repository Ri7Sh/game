function Cell(i, j, w) {
  this.i = i;
  this.j = j;
  this.x = i * w;
  this.y = j * w;
  this.w = w;
  this.revealed = true;
  this.bee=false;
  this.number=null;
}



Cell.prototype.show = function() {
  stroke(0);
  noFill();
  rect(this.x, this.y, this.w, this.w);
  if (this.number) {
      fill(200);
      rect(this.x, this.y, this.w, this.w);
      textAlign(CENTER);
      fill(0);
      text(this.number, this.x + this.w * 0.5, this.y + this.w - 6);
  }
    

  
 
}

Cell.prototype.contains = function(x, y) {
  return  (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.w);
}

