#!/bin/bash

for i in {3000..3004}; do
    node index.js $i &
done
