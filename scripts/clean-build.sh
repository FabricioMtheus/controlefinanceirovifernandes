#!/bin/bash

echo "🧹 Limpando cache e builds antigos..."

# Remove cache do Next.js
rm -rf .next

# Remove cache do node_modules
rm -rf node_modules/.cache

# Remove arquivos de build
rm -rf out
rm -rf build

# Remove logs
rm -f *.log
rm -f npm-debug.log*
rm -f yarn-debug.log*
rm -f yarn-error.log*

echo "✅ Limpeza concluída!"
echo "📦 Execute: npm install"
echo "🚀 Execute: npm run build"
