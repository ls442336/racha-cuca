var appConfig = {
	dragStart: null,
	dragging: false,
}

var barManager = {
	shuffleButton: null,
	startButtom: null,
	counterDOM: null,
	counterStatus: null,
	counter: null,
	timestamp: null,
	init: function(){
		var self = this;

		self.shuffleButton = document.getElementById("btn_shuffle");
		self.shuffleButton.addEventListener("click", function(){
			app.reset();
		}, true);

		self.startButton = document.getElementById("btn_start");
		self.startButton.addEventListener("click", function(){
			app.start();
		}, true);

		self.counterDOM = document.getElementById("counter");
	},
	resetCounter: function(){
		var self = this;

		self.counterStatus = "stop";
		self.counter = 0;
		self.updateCounter(self.counter);
		self.timestamp = null;
	},
	updateCounter: function(clock){
		var self = this;

		var s = Math.floor(clock / 1000);
		var ms = clock % 1000;
		var m = Math.floor(s / 60);
		s = s % 60;

		self.counterDOM.innerText =  m + "m " + s + "s " + ms + "ms";
	},
	start: function(){
		var self = this;

		self.counterStatus = "play";

		setTimeout(barManager.play, 1);
	},
	play: function(){
		var self = barManager;

		var now = new Date().getTime();

		if(self.timestamp == null)
			self.timestamp = now;

		var dt = now - self.timestamp;
		self.timestamp = now;

		self.counter += dt;

		self.updateCounter(self.counter);

		if(self.counterStatus == "play"){
			setTimeout(self.play, 1);
		}
	},
	stop: function(){
		var self = this;

		self.counterStatus = "stop";
	}
}

var appLogical = {
	grid: null,
	reset: function(){
		var self = this;

		self.setDefaultGrid();
	},
	setDefaultGrid: function(){
		var self = this;

		self.grid = [
			[1, 2, 3],
			[4, 5, 6],
			[7, 8, 0]
		];
	},
	getNumberGridPos: function(number){
		var self = this;

		for(var i = 0; i < 3; i++){
			for(var j = 0; j < 3; j++){
				if(self.grid[i][j] == number){
					return [i, j];
				}
			}
		}

		return false;
	},
	isValidPosition: function(a, b, c, d){
		var self = this;

		if(self.grid[c][d] == 0){
			var A = (a == c && d == b - 1);
			var B = (a == c && d == b + 1);
			var C = (a + 1 == c && d == b);
			var D = (a - 1 == c && d == b);
			if(A || B || C || D){
				return true;
			}
		}

		return false;
	},
	move: function(number, x, y){
		var self = this;

		numPos = self.getNumberGridPos(number);

		if(self.isValidPosition(numPos[0], numPos[1], x, y)){
			self.grid[x][y] = number;
			self.grid[numPos[0]][numPos[1]] = 0;

			return true;
		}

		return false;
	},
	shuffle: function(){
		var self = this;

		var k = [0, 1, 2, 3, 4, 5, 6, 7, 8];
		for(var i = 0; i < 3; i++){
			for(var j = 0; j < 3; j++){
				var index = Math.floor(Math.random() * k.length);
				self.grid[i][j] = k[index];
				k.splice(index, 1);
			}
		}
	},
	checkWin: function(){
		var self = this;

		var arr = [1, 2, 3, 4, 5, 6, 7, 8, 0];

		for(var i = 0; i < 3; i++){
			for(var j = 0; j < 3; j++){
				if(self.grid[i][j] != arr[i * 3 + j]){
					return false;
				}
			}
		}

		return true;
	}
}

var appDomManager = {
	referenceGrid: null,
	tiles: null,
	rtiles: null,
	setReferenceTiles: function(){
		var self = this;

		self.rtiles = document.getElementsByClassName("rtile");
	},
	setReferenceTilesEvent: function(){
		var self = this;

		var arr = self.rtiles;
		var len = arr.length;

		for(var i = 0; i < len; i++){
			arr[i].addEventListener("mouseup", function(){
				self.referenceTilesEvent(this);
			}, true);
		}
	},
	extractPos: function(e){
		var posClassName = e.className.split(" ")[1];
		posClassName = posClassName.split("-");
		var x = parseInt(posClassName[1]);
		var y = parseInt(posClassName[2]);

		return [x, y];
	},
	referenceTilesEvent: function(e){
		var self = this;

		if(appConfig.dragging){
			var toTilePos = self.extractPos(e);
			var fromNumber = parseInt(appConfig.dragStart.innerText);
			app.moveEvent(fromNumber, toTilePos[0], toTilePos[1]);
		}
	},
	reset: function(){
		var self = this;

		self.tiles = [];
		self.clearTiles();
	},
	clearTiles: function(){
		var self = this;

		var x = null;

		while((x = self.getTiles()).length > 0){
			self.referenceGrid.removeChild(x[0]);
		}
	},
	getTiles: function(){
		var self = this;

		return document.getElementsByClassName("tile");
	},
	getElem: function(number){
		var self = this;

		var l = self.tiles.length;
		for(var i = 0; i < l; i++){
			if(self.tiles[i].index == number){
				return self.tiles[i];
			}
		}

		return false;
	},
	moveTo: function(number, x, y){
		var self = this;

		var e = self.getElem(number);

		e.x = x;
		e.y = y;

		var eLastClassName = e.dom.className;
		eLastClassName = eLastClassName.split(" ");

		var posClass = "tile-" + x + "-" + y;

		if(eLastClassName.length > 1){
			e.dom.classList.remove(eLastClassName[1]);
		}

		e.dom.classList.add(posClass);

		return true;
	},
	tileEvent: function(e){
		var self = this;

		appConfig.dragStart = e;
		appConfig.dragging = true;
	},
	addTile: function(number, x, y){
		var self = this;

		e = document.createElement("div");
		e.className = "tile";
		e.innerText = number;
		e.addEventListener("mousedown", function(){
			self.tileEvent(this);
		}, true);

		self.referenceGrid.appendChild(e);

		self.tiles.push({
			index: number,
			dom: e,
			x: x,
			y: y
		});

		self.moveTo(number, x, y);
	},
	init: function(){
		var self = this;

		self.referenceGrid = document.getElementsByClassName("reference-grid")[0];
		self.setReferenceTiles();
		self.setReferenceTilesEvent();
	}
}

window.onmouseup = function(){
	appConfig.dragging = false;
}

var app = {
	status: null,
	init: function(){
		var self = this;

		appDomManager.init();
		barManager.init();

		self.reset();
	},
	resetLogicalToDom: function(){
		var arr = appLogical.grid;

		for(var i = 0; i < 3; i++){
			for(var j = 0; j < 3; j++){
				var e = arr[i][j];
				if(e != 0)
					appDomManager.addTile(e, i + 1, j + 1);
			}
		}
	},
	reset: function(){
		var self = this;

		self.status = "waiting";
		appDomManager.reset();
		appLogical.reset();
		appLogical.shuffle();
		self.resetLogicalToDom();
		barManager.resetCounter();
	},
	start: function(){
		var self = this;

		if(self.status != "waiting")
			return false;

		self.status = "playing";
		barManager.start();
	},
	moveEvent: function(fromNumber, toX, toY){
		var self = this;

		if(self.status != "playing")
			return false;

		var aux = appLogical.move(fromNumber, toX - 1, toY - 1);

		if(aux){
			appDomManager.moveTo(fromNumber, toX, toY);

			if(appLogical.checkWin()){
				self.status = "won";
				self.gameOver();
			}
		}
	},
	gameOver: function(){
		barManager.stop();
		alert("Você venceu!!!");
	}
}

window.onmouseup = function(){
	appConfig.dragging = false;
}
window.onload = function(){
	app.init();
}