#!/bin/bash

echo "Installing NVM and Node.js v18..."

# Ensure the script is run with a login shell context
export NVM_DIR="/tmp/.nvm"

# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Load NVM into current shell
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"

# Install and use Node.js v18
nvm install 18
nvm alias default 18
nvm use default

# Symlink node and npm to system path so Elastic Beanstalk uses them
ln -sf "$NVM_DIR/versions/node/v18.*/bin/node" /usr/bin/node
ln -sf "$NVM_DIR/versions/node/v18.*/bin/npm" /usr/bin/npm

echo "Node.js version:"
node -v
