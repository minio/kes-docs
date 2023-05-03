#!/bin/bash

set -ex

export NVM_DIR="${HOME}/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm
nvm use stable

export PATH=${PATH}:${HOME}/.local/bin

git submodule update --init --recursive
git submodule update --recursive --remote

hugo

sudo rm -rf /var/www/docs/kes/
sudo mkdir -p /var/www/docs/kes/
sudo cp -vr public/* /var/www/docs/kes/
