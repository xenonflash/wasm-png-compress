#!/usr/bin/env bash
# cmake . &&
# cmake --build . &&
# ls -lh docs/dist | grep image_compressor | awk '{ print $5 "\t" $9 }'

cmake -DCMAKE_TOOLCHAIN_FILE=/Users/yankechao/emsdk/upstream/emscripten/cmake/Modules/Platform/Emscripten.cmake -G "Unix Makefiles" ..
      #  (Linux and OSX)
      # -DCMAKE_BUILD_TYPE=<Debug|RelWithDebInfo|Release|MinSizeRel>
      # -G "MinGW Makefiles" (Windows)
      #  <path/to/CMakeLists.txt> # Note, pass in here ONLY the path to the file, not the filename 'CMakeLists.txt' itself
