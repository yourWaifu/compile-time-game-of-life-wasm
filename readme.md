# Conway's Game of Life

[Play now](https://yourwaifu.dev/compile-time-game-of-life-wasm/)

Conway's Game of Life has a few simple rules. Count the number of living squares around a square to determine if it continues to live, dies, stays die or becomes alive. if it's alive and has 2 or 3 living squares around it, it continues to lives overwise die. If it's dead and has 3 living squares around it, it becomes alive overwise it stays dead.

# How to use

Click on a square to make a square dead or alive.
Click Play to advance time Target Framerate times a second.
Click step to advance time once.
Click clear to clear the screen.

You may also display graph lines by clicking on the checkbox

You can slow down or speed up time by changing the Target Framerate.

# Technical details

This version of Conway's Game of Life was made in C++ with the Interface being made in JavaScript. This was done because the programmers hate towards JavaScript. Saddly, JavaScript is still unavoidable for web apps.

The game logic is made inside the LifeGame template structure. This was a template because there were plans for a hex version. This was cut back because of time constraints. The game defines it's rules in an array of booleans. To get the next value the index value is calculated using this formula, (maxNumOfNeighbours*cellValue)+sumOfNeighbours, this way the next value of a square can be determined by looking up one value and an add operation.

To update all squares to new states, the game takes in the current state and creates a new state. This new state is then copied to where the current state is stored. To create a new state, the game loops through all squares and in each iteration of the loop, the sum of the squares around each square is calculated and the new value is determined by the array of rules described in the last paragraph.

To run the c++ code, it needs to be compiled to wasm. To do this, emscripten is used as a compiler, this outputs a wasm file. To load and run wasm code, the WASM JavaScript API is used. First a instantiate Streaming is used. However, this doesn't always work so any errors needs to be catched and when catched the WASM will loaded via fetch and put into ``WebAssembly.instantiate``. Once the WASM code is done loading, the memory from WASM will be imported and shared with the JavaScript code so that it can be edited a veiwed by JavaScript later. After that, the frist frame is rendered into the web page.

To draw all the squares, a HTML canvas is used. To speed up rendering of the squares, a squares are drawn over the old frame and only drawn when different then old frame. To know when a square is different, the old buffer of squares is copied and compared to during render time.

Editing the square is really simple. When the HTML canvas is clicked on, the x y position of the mouse cursor is divided by the size of the squares. This gives the x y position of the square to change. If that square if alive, it's dead overwise it becomes alive.

To play and pause, setInterval is used and the interval is 1000 / target framerate. This allows the game to play at full speed or slowed down at any speed the user wants. While playing, step and changing the target framerate doesn't work so they are disable while playing.

# How it's tested

Logic of the Conway's game is tested during compile time using a blinker. A blinker can be in two states and 1 state changes to the other. By comparing the results from creating a new state at compile time, a compile error is used when results don't lead to known values or states of a blinker.

# How to compile
using emscripten sdk
```shell
em++ game-of-life-wasm/main.cpp -std=c++14 -o main.wasm -s WASM=1 -s SIDE_MODULE=1 -s ONLY_MY_CODE=1 -s "EXPORTED_FUNCTIONS=['_getMemory', '_updateStates']"
```

# Notes

## WebAssembly support web browsers and versions

User | %
---- | -
All users | 80.2%
Desktops | 86.52%
Moblie | 80.93%

Web Browser | First supported version | % of all users that are using a supported version of this broswer | % of all users using this broswer |
----------- | ----------------------- | ----------------------------------------------------------------- | --------------------------------- |
Internet Explorer | None | 0% | 2.88%
Edge | 16 | 1.83% | 2.08%
Firefox | 52 | 4.01% | 5.02%
Chrome | 57 | 29.31% | 31.69%
Safari | 11 | 2.17% | 9.43%
IOS Safari | 11 | 9.4% | 11.93%
Chrome for Android | 69 | 31.99% | 27.9%??

Sources: https://caniuse.com/#feat=wasm https://web.archive.org/web/20190907034434/https://gs.statcounter.com/
