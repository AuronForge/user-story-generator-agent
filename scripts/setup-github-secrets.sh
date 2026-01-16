#!/bin/bash

# Script para ajudar na configuração dos secrets do GitHub Actions
# Uso: bash scripts/setup-github-secrets.sh

echo "🔐 GitHub Actions - Setup de Secrets"
echo "===================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar se um comando existe
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Verificar se Vercel CLI está instalado
if ! command_exists vercel; then
  echo -e "${YELLOW}⚠️  Vercel CLI não encontrado${NC}"
  echo "Instalando Vercel CLI globalmente..."
  npm install -g vercel
fi

echo "1️⃣  Verificando projeto Vercel..."
echo ""

# Verificar se já está linkado
if [ -f ".vercel/project.json" ]; then
  echo -e "${GREEN}✅ Projeto já está linkado ao Vercel${NC}"
  echo ""

  # Ler os valores do arquivo
  ORG_ID=$(cat .vercel/project.json | grep -o '"orgId": "[^"]*' | cut -d'"' -f4)
  PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId": "[^"]*' | cut -d'"' -f4)

  echo "📋 Secrets do Vercel:"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo -e "${GREEN}VERCEL_ORG_ID:${NC}     $ORG_ID"
  echo -e "${GREEN}VERCEL_PROJECT_ID:${NC} $PROJECT_ID"
  echo ""
else
  echo -e "${YELLOW}⚠️  Projeto não está linkado ao Vercel${NC}"
  echo "Execute: npx vercel link"
  echo ""
  echo "Deseja linkar agora? (y/n)"
  read -r response

  if [ "$response" = "y" ] || [ "$response" = "Y" ]; then
    npx vercel link

    if [ -f ".vercel/project.json" ]; then
      ORG_ID=$(cat .vercel/project.json | grep -o '"orgId": "[^"]*' | cut -d'"' -f4)
      PROJECT_ID=$(cat .vercel/project.json | grep -o '"projectId": "[^"]*' | cut -d'"' -f4)

      echo ""
      echo "📋 Secrets do Vercel:"
      echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      echo -e "${GREEN}VERCEL_ORG_ID:${NC}     $ORG_ID"
      echo -e "${GREEN}VERCEL_PROJECT_ID:${NC} $PROJECT_ID"
      echo ""
    fi
  fi
fi

echo "2️⃣  Instruções para o VERCEL_TOKEN:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Acesse: https://vercel.com/account/tokens"
echo "2. Clique em 'Create Token'"
echo "3. Dê um nome (ex: GitHub Actions)"
echo "4. Copie o token gerado"
echo ""

echo "3️⃣  Instruções para o CODECOV_TOKEN (opcional):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Acesse: https://codecov.io/"
echo "2. Conecte seu repositório GitHub"
echo "3. Copie o token fornecido"
echo ""

echo "4️⃣  Configurando os Secrets no GitHub:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Acesse: https://github.com/SEU_USER/SEU_REPO/settings/secrets/actions"
echo "2. Clique em 'New repository secret'"
echo "3. Adicione cada secret:"
echo ""
echo "   Nome: VERCEL_TOKEN"
echo "   Valor: [seu token do passo 2]"
echo ""
echo "   Nome: VERCEL_ORG_ID"
if [ -n "$ORG_ID" ]; then
  echo -e "   Valor: ${GREEN}$ORG_ID${NC}"
else
  echo "   Valor: [obtenha executando 'npx vercel link']"
fi
echo ""
echo "   Nome: VERCEL_PROJECT_ID"
if [ -n "$PROJECT_ID" ]; then
  echo -e "   Valor: ${GREEN}$PROJECT_ID${NC}"
else
  echo "   Valor: [obtenha executando 'npx vercel link']"
fi
echo ""
echo "   Nome: CODECOV_TOKEN (opcional)"
echo "   Valor: [seu token do codecov]"
echo ""

echo "5️⃣  Testando a cobertura localmente:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Execute: npm run test:coverage"
echo ""
echo "A média deve ser >= 95% para o deploy passar"
echo ""

echo -e "${GREEN}✅ Setup completo!${NC}"
echo ""
echo "📚 Para mais informações, consulte: .github/DEPLOY.md"
