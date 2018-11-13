#How to compile
using emscripten sdk
```shell
em++ main.cpp -std=c++14 -o main.wasm -s WASM=1 -s SIDE_MODULE=1 -s ONLY_MY_CODE=1 -s "EXPORTED_FUNCTIONS=['_getMemory', '_updateStates']"
```

#Notes

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

Sources: https://caniuse.com/#feat=wasm http://gs.statcounter.com/