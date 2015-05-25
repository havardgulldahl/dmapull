#!/bin/bash

for z in $*;
do 
    id3v2 -C $z; 
    TITLE=`id3v2 -l $i | iconv -f latin1 | grep TIT2 | cut -c44- | sed -e 's/^[[:space:]]*//'`; echo --$TITLE-$i--; 
    mv -iv $i "$TITLE";
done
