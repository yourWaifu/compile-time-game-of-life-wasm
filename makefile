all: em++ game-of-life-wasm/main.cpp -std=c++14 -o main.wasm -s WASM=1 -s SIDE_MODULE=1 -s ONLY_MY_CODE=1 -s "EXPORTED_FUNCTIONS=['_getMemory', '_updateStates']"