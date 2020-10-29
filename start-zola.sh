#!/bin/sh

cd /Users/a1/dev/rust_reading_books/md2netlify
/usr/local/bin/node main.js
cd ..
open http://127.0.0.1:1111 
zola serve
