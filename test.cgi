#!/bin/bash -ex

echo "running $(date)" > /tmp/test.cgi.out

echo "Content-type: application/javascript"
echo ""

echo 'console.log("'"$( env | grep ^HTTP_ | sort | sed 's/"/\\"/g' | sed 's/$/\\n/g' | tr -d \\n )"'");'

