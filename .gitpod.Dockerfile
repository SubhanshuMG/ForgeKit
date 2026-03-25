FROM gitpod/workspace-full

# Install Node.js 18+
RUN bash -c 'source $HOME/.nvm/nvm.sh && nvm install 18 && nvm alias default 18'

# Install Python 3.11
RUN pyenv install 3.11 && pyenv global 3.11

# Install Go 1.22
RUN bash -c '. /home/gitpod/.sdkman/bin/sdkman-init.sh && sdk install go 1.22.0 || true'
