#!/bin/zsh

sudo apt-get update && sudo apt-get install -y xdg-utils tippecanoe gdal-bin

git clone https://github.com/zsh-users/zsh-autosuggestions ${ZSH_CUSTOM:-${ZSH:-~/.oh-my-zsh}/custom}/plugins/zsh-autosuggestions
git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${ZSH_CUSTOM:-${ZSH:-~/.oh-my-zsh}/custom}/plugins/zsh-syntax-highlighting

zsh_source_pattern='source $ZSH\/oh-my-zsh.sh'
zsh_prepend=$(cat <<'EOF' | sed -z 's/\n/\\n/g'
plugins+=zsh-autosuggestions
plugins+=zsh-syntax-highlighting
EOF
)

sed -i "/$zsh_source_pattern/i$zsh_prepend" ~/.zshrc

zsh <(curl -fsSL https://moonrepo.dev/install/proto.sh) --yes

proto install
pnpm install

source ~/.zshrc
