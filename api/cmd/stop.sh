#!/bin/bash

for pid in $(pgrep -f 'node index.js');do
    kill $pid
done
