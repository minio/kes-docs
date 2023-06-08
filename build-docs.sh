#!/bin/bash

set -ex

export NVM_DIR="${HOME}/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" # This loads nvm
nvm use stable

export PATH=${PATH}:${HOME}/.local/bin

# Update theme and rebuild theme assets
git submodule update --init --recursive
git submodule update --recursive --remote
cd themes/kes-docs-theme
npm install && npm run build
cd ../../

# Build the doc site
hugo

# Remove old site and copy new site contents over to path
sudo rm -rf /var/www/docs/kes/
sudo mkdir -p /var/www/docs/kes/
sudo cp -vr public/* /var/www/docs/kes/
