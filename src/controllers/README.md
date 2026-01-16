# API REST - User Story Generator Agent

## Estrutura de Camadas

A API REST foi desenvolvida seguindo a arquitetura em camadas, garantindo separação de responsabilidades e facilidade de manutenção.

### 📁 Estrutura de Arquivos

```
user-story-generator-agent/
├── api/
│   ├── generate-user-stories.js    # Endpoint para geração de user stories
│   └── user-stories.js             # Endpoint para listagem/consulta
├── src/
│   ├── agents/
│   │   └── story-generator-agent.js    # Agente de IA para geração
│   ├── controllers/
│   │   └── user-story.controller.js    # Controladores REST
│   ├── services/
│   │   ├── ai-service.js               # Serviço de IA (OpenAI, GitHub, Anthropic)
│   │   └── user-story.service.js       # Lógica de negócio
│   ├── repositories/
│   │   └── user-story.repository.js    # Acesso a dados
│   ├── prompts/
│   │   └── user-story-generation-prompt.js  # Prompts para IA
│   ├── schemas/
│   │   ├── test-scenario-schema.js     # Validação de entrada
│   │   └── user-story-schema.js        # Validação de saída
│   └── utils/
│       └── file.utils.js               # Utilitários de arquivo
└── tests/
    ├── agents/
    │   └── story-generator-agent.test.js
    ├── controllers/
    │   └── user-story.controller.test.js
    ├── repositories/
    │   └── user-story.repository.test.js
    └── services/
        └── user-story.service.test.js
```

## 🔄 Fluxo de Dados

```
Request → API Handler → Controller → Service → Agent → AI Service
                                         ↓
                                    Repository → Database
```

### 1. **API Handler** (`api/generate-user-stories.js`)

- Gerencia CORS
- Valida método HTTP
- Delega para o controller

### 2. **Controller** (`src/controllers/user-story.controller.js`)

- Extrai dados da requisição (body, headers, query)
- Chama o service apropriado
- Formata respostas HTTP

### 3. **Service** (`src/services/user-story.service.js`)

- Contém lógica de negócio
- Orquestra agent e repository
- Gerencia transações

### 4. **Agent** (`src/agents/story-generator-agent.js`)

- Valida entrada com Zod schemas
- Gera prompts para IA
- Processa e valida resposta da IA

### 5. **Repository** (`src/repositories/user-story.repository.js`)

- Acesso ao banco de dados (JSON)
- CRUD operations
- Gestão de arquivo

## 🚀 Endpoints

### POST `/api/generate-user-stories`

Gera user stories a partir de um cenário de teste.

**Headers:**

- `x-ai-provider`: `openai` | `github` | `anthropic` (opcional, default: `openai`)

**Body:**

```json
{
  "title": "User Login Authentication",
  "description": "Verify that users can login with valid credentials",
  "type": "functional",
  "priority": "high",
  "steps": [
    {
      "action": "Navigate to login page",
      "expectedResult": "Login page is displayed"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "US-001",
      "title": "User Authentication",
      "story": "As a user, I want to login, so that I can access my account",
      "priority": "high",
      "estimatedPoints": "3",
      "team": "Backend",
      "acceptanceCriteria": [...]
    }
  ],
  "metadata": {
    "agent": "User Story Generator Agent",
    "version": "1.0.0",
    "generatedAt": "2026-01-16T00:00:00.000Z"
  },
  "id": "entry-uuid"
}
```

### GET `/api/user-stories`

Lista todas as user stories geradas.

**Query Params:**

- `id`: UUID da entrada (opcional)

**Response (Lista):**

```json
{
  "success": true,
  "total": 5,
  "data": [
    {
      "id": "entry-uuid",
      "createdAt": "2026-01-16T00:00:00.000Z",
      "testScenario": {...},
      "userStories": [...],
      "provider": "openai"
    }
  ]
}
```

**Response (Por ID):**

```json
{
  "success": true,
  "data": {
    "id": "entry-uuid",
    "createdAt": "2026-01-16T00:00:00.000Z",
    "testScenario": {...},
    "userStories": [...],
    "provider": "openai"
  }
}
```

## 🧪 Testes

Todos os componentes possuem testes unitários:

```bash
npm test                    # Executar todos os testes
npm run test:coverage       # Cobertura de testes
npm run test:watch          # Modo watch
```

### Cobertura de Testes:

- ✅ Controller
- ✅ Service
- ✅ Repository
- ✅ Agent
- ✅ Schemas

## 🔧 Configuração

### Variáveis de Ambiente

```env
# OpenAI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4-turbo-preview

# GitHub Models
GITHUB_TOKEN=ghp_...
GITHUB_MODEL=gpt-4o

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

# Environment
NODE_ENV=development
```

## 📝 Exemplos de Uso

### Usando diferentes providers:

```javascript
// OpenAI (default)
fetch('/api/generate-user-stories', {
  method: 'POST',
  body: JSON.stringify(testScenario),
});

// GitHub Models
fetch('/api/generate-user-stories', {
  method: 'POST',
  headers: { 'x-ai-provider': 'github' },
  body: JSON.stringify(testScenario),
});

// Anthropic Claude
fetch('/api/generate-user-stories', {
  method: 'POST',
  headers: { 'x-ai-provider': 'anthropic' },
  body: JSON.stringify(testScenario),
});
```

## 🛡️ Tratamento de Erros

A API retorna erros estruturados:

```json
{
  "success": false,
  "error": "Mensagem de erro",
  "stack": "Stack trace (apenas em dev)"
}
```

**Códigos HTTP:**

- `200`: Sucesso
- `400`: Erro de validação
- `404`: Recurso não encontrado
- `405`: Método não permitido
- `500`: Erro interno do servidor

## 📊 Schemas de Validação

A API utiliza [Zod](https://zod.dev/) para validação:

- **Entrada**: `testScenarioSchema` - Valida cenários de teste
- **Saída**: `userStorySchema` - Valida user stories geradas

## 🔐 Segurança

- CORS habilitado para todos os origins
- Validação de entrada com Zod
- Sanitização de dados
- Error stack apenas em desenvolvimento

## 📦 Dependências Principais

- `openai`: Cliente OpenAI
- `@anthropic-ai/sdk`: Cliente Anthropic
- `zod`: Validação de schemas
- `jest`: Framework de testes

## 🤝 Integração com Test Scenario Generator

Este agent trabalha em conjunto com o `test-scenario-generator-agent`:

1. Test Scenario Generator cria cenários de teste
2. User Story Generator converte cenários em user stories
3. Ambos seguem a mesma arquitetura e padrões
