console.log("test");
//global variables
const broadHeight = 50;
const broadWidth = 50;
const broadSize = broadHeight * broadWidth;
let squareSize = 20;
var eventLoopTimer = null;
let prevFrameTimestamp = performance.now();

//WASM imports
const memory = new WebAssembly.Memory({initial: 256, maximum: 256});
var importObject = {
	env: {
		memory: memory,
		table: 0
	}
};
importObject.env.memory = memory;
importObject.env.memoryBase = 1024;
importObject.env.table = new WebAssembly.Table({initial: 0, maximum: 0, element: 'anyfunc'});
importObject.env.tableBase = 0;
importObject.env.STACKTOP = 0;
importObject.env.STACK_MAX = memory.buffer.byteLength;
importObject.env.__linear_memory = new WebAssembly.Memory({ initial: broadSize });
importObject.env.__indirect_function_table = new WebAssembly.Table({ initial: 2, element: "anyfunc" });
importObject.env.__stack_pointer = new WebAssembly.Global({ value: 'i32', mutable: true }, 0);
importObject.env.memset = function (pointer, value, number) {
	let mem = new Uint8Array(memory.buffer, pointer, number);
	for (let i = 0; i < number; i++) {
		mem[i] = value;
	}
};
importObject.env.memcpy = function (destination, source, number) {
	let destMem = new Uint8Array(memory.buffer, destination, number);
	let sourceMem = new Uint8Array(memory.buffer, source, number);
	for (let i = 0; i < number; i++) {
		destMem[i] = sourceMem[i];
	}
};
importObject.env.abortStackOverflow = function (size) { throw new Error('overflow'); }
importObject.env.nullFunc_X = function () { };
importObject.env._emscripten_set_main_loop = function (func, fps, useInfiniteLoopSim) {
	//we don't even use this function
};
importObject.env._memset = importObject.env.memset;
importObject.env._memcpy = importObject.env.memcpy;
importObject.env._printf = function (pointer) {
	//we also don't use this
};
importObject.env.__memory_base = 0;
importObject.env.__table_base = 0;

//Define WASM exports
let oldMemory;
var _memory;
var _memory_pointer;
var instance;
var _updateStates = null;

function setWASMExports(result) {
	if (_updateStates !== null) return;

	console.log(result);
	console.log(result.instance.exports);
	console.log(result.instance.exports._memory);
	instance = result.instance; //not sure if this is a reference but I hope it is
	_memory_pointer = instance.exports._getMemory();
	oldMemory = Object.assign({}, Uint8Array);
	_memory = new Uint8Array(importObject.env.memory.buffer, _memory_pointer, broadSize);
	_updateStates = result.instance.exports._updateStates;

	console.log("WASM boilerplate code execution finished");

	draw();

	console.log("Ready");
}

//Load Webassembly
WebAssembly.instantiateStreaming(fetch('main.wasm'), importObject)
	.catch(error => {
		fetch('main.wasm').then(response =>
			response.arrayBuffer()
		).then(bytes =>
			WebAssembly.instantiate(bytes, importObject)
		).then(results => setWASMExports(results));
	}).then(result => setWASMExports(result));

function draw() {
	let startTimestamp = performance.now();

	let useLines = document.getElementById("useLines").checked;

	//draw
	document.getElementById("output").hidden = true;
	let outputElement = document.getElementById("canvasOutput");
	let output = outputElement.getContext("2d");
	output.fillStyle = "black";

	let outputWidth = broadWidth * squareSize;
	let outputHeight = broadHeight * squareSize;
	let i = 0;
	for (let y = 0; i < broadSize; y += squareSize) {
		for (let x = 0; x < outputWidth; x += squareSize) {
			if (oldMemory[i] !== _memory[i]) {
				if (_memory[i] === 1) {
					output.fillRect(x, y, squareSize, squareSize);
				} else {
					output.clearRect(x, y, squareSize, squareSize);
					if (useLines) {
						output.strokeRect(x, y, squareSize, squareSize);
					}
				}
			}
			++i;
		}
	}
	outputElement.hidden = false;

	//display Potential Frametime
	let frameTimeCounter = document.getElementById("drawtimeCounter");
	let currentFrameTimestamp = performance.now();
	frameTimeCounter.innerHTML = currentFrameTimestamp - startTimestamp;
}

function update() {
	let startUpdateTimestamp = performance.now();
	oldMemory = Object.assign({}, _memory);
	_updateStates();
	let endUpdateTimestamp = performance.now();
	draw();

	//display frametime
	let frameTimeCounter = document.getElementById("frametimeCounter");
	let currentFrameTimestamp = performance.now();
	let frametime = currentFrameTimestamp - prevFrameTimestamp;
	frameTimeCounter.innerHTML = frametime;
	prevFrameTimestamp = currentFrameTimestamp;

	let updateTimeCounter = document.getElementById("updatetimeCounter");
	updateTimeCounter.innerHTML = endUpdateTimestamp - startUpdateTimestamp;

	let framerateCounter = document.getElementById("framerateCounter");
	framerateCounter.innerHTML = 1000 / frametime;
}

function playOrPause() {
	let PlayButton = document.getElementById("playButton");
	let StepButton = document.getElementById("stepButton");
	let framerate = document.getElementById("targetFramerate");
	if (eventLoopTimer !== null) {
		clearTimeout(eventLoopTimer);
		PlayButton.textContent = "Play";
		StepButton.disabled = false;
		framerate.disabled = false;
		eventLoopTimer = null;
		draw();
	} else {
		eventLoopTimer = setInterval(() => {
			update();
		}, 1000 / framerate.value);
		PlayButton.textContent = "Pause";
		StepButton.disabled = true;
		framerate.disabled = true;
	}
}

function onCanvasClick(event) {
	//get mouse on canvas
	let canvas = document.getElementById("canvasOutput");
	let rect = canvas.getBoundingClientRect();
	
	let x = event.clientX - rect.left;
	let y = event.clientY - rect.top;

	let index = Math.floor((x * 2)/ squareSize) + ((Math.floor((y * 2)/ squareSize) * broadWidth));

	oldMemory = Object.assign({}, _memory);
	_memory[index] = _memory[index] === 1 ? 0 : 1;
	draw();
}

function clearMem() {
	oldMemory = Object.assign({}, _memory);
	for (let i = 0; i < broadSize; i++) {
		_memory[i] = 0;
	}
	draw();
}