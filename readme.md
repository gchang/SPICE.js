# SPICE.js
### A Javascript version of the NASA/JPL SPICE Toolkit ported with Emscripten.

For a friendly introduction on what the toolkit does, please read the  [SPICE Concept page](https://naif.jpl.nasa.gov/naif/spiceconcept.html) at JPL. 

## Usage

This package contains precompiled and linkable bytecode for the SPICE libraries. The intention is to use these libraries to create the Javascript files that contain only the necessary function. For the most basic compilation which includes the functions to load and unload SPICE kernels, you would compile it as such:

```bash
emcc -O3 -o spice.js -s TOTAL_MEMORY=134217728 -s EXPORTED_FUNCTIONS="['_furnsh_c', '_unload_c']" --memory-init-file 0 cspice.bc csupport.bc
```


## Roll Your Own

The C API, despite being ported from the Fortran version, is very well written. It doesn't use dynamic memory anywhere in the library and is very straightforward to compile.

First, check out this project and in this project's top directory, download and uncompress the C library:
```
curl http://naif.jpl.nasa.gov/pub/naif/toolkit/C/MacIntel_OSX_AppleC_64bit/packages/cspice.tar.Z | tar xz
```

Next, go into the two source directories and compile them:

```bash
cd cspice/src/cspice
emcc -O3 -o ../../../cspice.bc *.c
cd ../csupport
emcc -O3 -o ../../../csupport.bc *.c
cd ../../../
```

That's really it! The resulting files are the bytecode libraries.

#### Command Line Utilities

SPICE comes with a set of command line utilities that help with inspecting, converting, and manipulating SPICE kernel files. The [native](https://naif.jpl.nasa.gov/naif/utilities.html) tools work perfectly well, but if want to compile them into Javascript, that's also possible. Note however that not all the tools work. Non-interactive tools, such as `brief`, seem to work just fine. However, there are interactive tools like `spkmerge` which require user input. Those don't seem to work at this time.

This following bash script follows closely to the C makefiles. It includes a `pre.js` file which enables `NODEFS`, namely native file access when running under node.

```bash
mkdir -p bin
for tool in brief chrnos ckbref commnt cook frmdif inspkt mkspk msopck spacit spkdif spkmrg tobin toxfr versn; do
    cd cspice/src/${tool}_c
    for pgm in *.pgm; do
        echo ${pgm%.pgm}
        cp -fp ${pgm} ${pgm%.pgm}_main.c
        if [ -e main.x ]; then
            cp -fp main.x ${pgm%.pgm}.c
        fi
        emcc -Wno-logical-op-parentheses -Wno-implicit-int -Wno-shift-op-parentheses -O3 -s TOTAL_MEMORY=268435456 --memory-init-file 0 -o ../../../bin/${pgm%.pgm}.js --pre-js ../../../pre.js *.c ../../../cspice.bc ../../../csupport.bc
        rm -f ${pgm%.pgm}_main.c ${pgm%.pgm}.c
    done
    cd ../../../
done
```