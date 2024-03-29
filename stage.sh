#!/bin/bash

set -e

source staging.env
BRANCH=$(git rev-parse --symbolic-full-name --abbrev-ref HEAD)

function main() {

   echo "Staging to $STAGEHOST:"

   rsync --mkpath -rv --delete -e "ssh -i $SSHKEY -p $SSHPORT" public/* $STAGEUSER@$STAGEHOST:/var/www/html/$STAGEPROJECT/$BRANCH
   echo "Staging complete"
   echo "Staged to http://$STAGEHOST:$STAGEPORT/$STAGEPROJECT/$BRANCH/index.html"

}
 
 main "$@"