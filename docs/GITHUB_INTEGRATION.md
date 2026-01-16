# Integração GitHub Copilot (GitHub Models)

## 🤖 Visão Geral

O **user-story-generator-agent** está totalmente integrado com o GitHub Models (parte do GitHub Copilot), permitindo gerar user stories usando modelos avançados de IA hospedados no Azure.

## 🔧 Configuração

### 1. Obter Token do GitHub

Você precisa de um **GitHub Personal Access Token** com permissões adequadas:

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token (classic)"**
3. Selecione as permissões necessárias
4. Copie o token gerado

### 2. Configurar Variáveis de Ambiente

Crie ou edite o arquivo `.env` na raiz do projeto:

```env
# GitHub Models Configuration
GITHUB_TOKEN=ghp_seu_token_aqui
GITHUB_MODEL=gpt-4o

# Opcional: Outros providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Environment
NODE_ENV=development
```

### 3. Modelos Disponíveis

Os seguintes modelos estão disponíveis no GitHub Models:

- `gpt-4o` - Recomendado (padrão)
- `gpt-4o-mini` - Versão leve e rápida
- `gpt-4-turbo` - Alta performance
- `o1-preview` - Raciocínio avançado
- `o1-mini` - Raciocínio leve

## 🚀 Uso

### Via API REST

```bash
# Usar GitHub Models
curl -X POST https://your-domain.com/api/generate-user-stories \
  -H "Content-Type: application/json" \
  -H "x-ai-provider: github" \
  -d '{
    "title": "User Login Authentication",
    "description": "Verify that users can login with valid credentials",
    "type": "functional",
    "steps": [
      {
        "action": "Navigate to login page",
        "expectedResult": "Login page is displayed"
      }
    ]
  }'
```

### Via JavaScript/TypeScript

```javascript
const response = await fetch('/api/generate-user-stories', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-ai-provider': 'github', // Use GitHub Models
  },
  body: JSON.stringify({
    title: 'User Login Authentication',
    description: 'Verify that users can login with valid credentials',
    type: 'functional',
    steps: [
      {
        action: 'Navigate to login page',
        expectedResult: 'Login page is displayed',
      },
      {
        action: 'Enter valid credentials',
        expectedResult: 'User is authenticated',
      },
    ],
  }),
});

const result = await response.json();
console.log(result);
```

### Programaticamente

```javascript
import { AIService } from './src/services/ai-service.js';
import { StoryGeneratorAgent } from './src/agents/story-generator-agent.js';

// Usando AI Service diretamente
const aiService = new AIService('github');
const response = await aiService.generateCompletion(prompt);

// Usando o Agent completo
const agent = new StoryGeneratorAgent('github');
const result = await agent.generateUserStories(testScenario);
```

## 📊 Comparação de Providers

| Provider      | Modelo Padrão     | Vantagens                                | Casos de Uso              |
| ------------- | ----------------- | ---------------------------------------- | ------------------------- |
| **GitHub**    | gpt-4o            | Integrado ao GitHub, sem custo adicional | Desenvolvimento integrado |
| **OpenAI**    | gpt-4-turbo       | Mais opções de modelos, alta qualidade   | Produção, alta precisão   |
| **Anthropic** | claude-3-5-sonnet | Respostas detalhadas, raciocínio forte   | Análises complexas        |

## 🎯 Exemplos Práticos

### Exemplo 1: Geração Básica

```javascript
import * as userStoryService from './src/services/user-story.service.js';

const testScenario = {
  title: 'Shopping Cart Checkout',
  description: 'Test the complete checkout process',
  type: 'e2e',
  priority: 'high',
  steps: [
    {
      action: 'Add items to cart',
      expectedResult: 'Items appear in cart',
    },
    {
      action: 'Proceed to checkout',
      expectedResult: 'Checkout page loads',
    },
    {
      action: 'Complete payment',
      expectedResult: 'Order confirmed',
    },
  ],
};

// Usar GitHub Models
const result = await userStoryService.generateUserStories(testScenario, 'github');

if (result.success) {
  console.log(`✅ Generated ${result.data.length} user stories`);
  console.log(`📝 Entry ID: ${result.id}`);

  result.data.forEach(story => {
    console.log(`\n${story.id}: ${story.title}`);
    console.log(`Priority: ${story.priority} | Points: ${story.estimatedPoints}`);
    console.log(story.story);
  });
}
```

### Exemplo 2: Batch Processing

```javascript
const testScenarios = [
  { title: 'Login', description: 'Test login flow', type: 'functional' },
  { title: 'Signup', description: 'Test signup flow', type: 'functional' },
  { title: 'Password Reset', description: 'Test password reset', type: 'functional' },
];

const results = await Promise.all(
  testScenarios.map(scenario => userStoryService.generateUserStories(scenario, 'github'))
);

console.log(`✅ Generated stories for ${results.length} scenarios`);
```

### Exemplo 3: Comparação de Providers

```javascript
const testScenario = {
  title: 'User Authentication',
  description: 'Test complete authentication flow',
  type: 'functional',
};

const providers = ['github', 'openai', 'anthropic'];

const comparisons = await Promise.all(
  providers.map(async provider => {
    const startTime = Date.now();
    const result = await userStoryService.generateUserStories(testScenario, provider);
    const duration = Date.now() - startTime;

    return {
      provider,
      success: result.success,
      storiesCount: result.data?.length || 0,
      duration: `${duration}ms`,
    };
  })
);

console.table(comparisons);
```

## 🔍 Debugging e Logs

### Habilitar Logs Detalhados

```javascript
// No início do seu script
process.env.DEBUG = 'ai-service:*';

const result = await userStoryService.generateUserStories(testScenario, 'github');
```

### Tratamento de Erros

```javascript
try {
  const result = await userStoryService.generateUserStories(testScenario, 'github');

  if (!result.success) {
    console.error('❌ Generation failed:', result.error);

    // Fallback para outro provider
    console.log('🔄 Trying OpenAI as fallback...');
    const fallbackResult = await userStoryService.generateUserStories(testScenario, 'openai');

    if (fallbackResult.success) {
      console.log('✅ Fallback successful');
    }
  }
} catch (error) {
  console.error('💥 Fatal error:', error.message);
}
```

## 🧪 Testes

### Testar Integração

```bash
# Executar testes
npm test

# Testes específicos do AI Service
npm test -- ai-service

# Com cobertura
npm run test:coverage
```

### Teste Manual

```bash
# Testar geração com GitHub Models
curl -X POST http://localhost:3000/api/generate-user-stories \
  -H "Content-Type: application/json" \
  -H "x-ai-provider: github" \
  -d @test-scenario.json
```

## 📈 Monitoramento

### Logs de Sucesso

```json
{
  "success": true,
  "data": [...],
  "metadata": {
    "agent": "User Story Generator Agent",
    "version": "1.0.0",
    "generatedAt": "2026-01-16T10:30:00.000Z"
  },
  "id": "uuid-here"
}
```

### Logs de Erro

```json
{
  "success": false,
  "error": "AI Service Error: Rate limit exceeded",
  "metadata": {
    "agent": "User Story Generator Agent",
    "version": "1.0.0"
  }
}
```

## ⚙️ Configurações Avançadas

### Customizar Temperatura

```javascript
import { AIService } from './src/services/ai-service.js';

const aiService = new AIService('github');

const response = await aiService.generateCompletion(prompt, {
  temperature: 0.9, // Mais criativo
  // temperature: 0.3, // Mais determinístico
});
```

### Escolher Modelo Específico

```env
# No .env
GITHUB_MODEL=gpt-4o-mini
```

Ou programaticamente:

```javascript
process.env.GITHUB_MODEL = 'gpt-4o-mini';
const aiService = new AIService('github');
```

## 🔒 Segurança

### Boas Práticas

1. **Nunca commite** o arquivo `.env`
2. Use **secrets** no CI/CD (GitHub Actions, Vercel, etc.)
3. **Rotacione tokens** periodicamente
4. Use **variáveis de ambiente** em produção

### GitHub Actions Example

```yaml
name: Test User Story Generation

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
      - name: Install dependencies
        run: npm install
      - name: Run tests
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITHUB_MODEL: gpt-4o
        run: npm test
```

## 🆘 Troubleshooting

### Erro: "Invalid authentication token"

```bash
# Verificar se o token está configurado
echo $GITHUB_TOKEN

# Regenerar token no GitHub
# https://github.com/settings/tokens
```

### Erro: "Rate limit exceeded"

```javascript
// Implementar retry com backoff
async function generateWithRetry(testScenario, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await userStoryService.generateUserStories(testScenario, 'github');
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = Math.pow(2, i) * 1000;
      console.log(`Retry in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

### Erro: "Model not found"

```bash
# Verificar modelos disponíveis
curl https://models.inference.ai.azure.com/models \
  -H "Authorization: Bearer $GITHUB_TOKEN"
```

## 📚 Recursos

- [GitHub Models Documentation](https://docs.github.com/en/copilot/github-copilot-chat)
- [Azure OpenAI Service](https://azure.microsoft.com/en-us/products/ai-services/openai-service)
- [API Reference](../controllers/README.md)

## 🤝 Contribuindo

Encontrou um problema ou tem uma sugestão? Abra uma issue no GitHub!
