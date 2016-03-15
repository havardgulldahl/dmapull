#!/bin/bash

for z in "$@";
do 
    id3v2 -C "$z"; 
    TITLE=`id3v2 -l "$z" | iconv -f latin1 | grep TIT2 | cut -c44- | sed -e 's/^[[:space:]]*//'`; echo --$TITLE--; 
    mv -iv "$z" "$TITLE-$z";
done
