# owockibot-bounty-sync

> Sincroniza automaticamente bounties abertas do [owockibot.xyz](https://owockibot.xyz/bounty) para Issues do GitHub — com etiquetas de nível de recompensa, acompanhamento de status e categorização.

---

## O que ele faz

A cada 6 horas, uma GitHub Action:

1. **Consulta** a API do quadro de bounties do owockibot para buscar bounties abertas
2. **Cria** uma Issue do GitHub para cada nova bounty (título, descrição completa, recompensa, prazo, categoria)
3. **Rotula** cada issue por nível de recompensa, categoria e status
4. **Atualiza** issues automaticamente quando uma bounty é reivindicada ou concluída
5. **Fecha** issues quando uma bounty é concluída
6. Usa **dados simulados** como fallback se a API não estiver acessível

---

## Etiquetas aplicadas automaticamente

### Níveis de recompensa
| Etiqueta | Faixa |
|---|---|
| `reward: 💎 $1000+` | $1000 e acima |
| `reward: 🥇 $500+` | $500 – $999 |
| `reward: 🥈 $200+` | $200 – $499 |
| `reward: 🥉 <$200` | Abaixo de $200 |

### Status
- `status: open` — disponível para reivindicar
- `status: claimed` — alguém está trabalhando nela
- `status: completed` — concluída, issue fechada

### Categoria
`category: Engineering` · `category: Content` · `category: Design` · `category: Research` · `category: Security` · `category: Translation`

Todas as issues sincronizadas também recebem a etiqueta `owockibot` (verde) para facilitar a filtragem.

---

## Configuração (5 minutos)

### 1. Faça fork ou clone deste repositório

Crie um novo repositório público no GitHub e faça o upload de todos estes arquivos, mantendo a estrutura de pastas:

```
.github/
  workflows/
    sync-bounties.yml
scripts/
  sync.js
  package.json
README.md
```

### 2. Certifique-se de que o GitHub Actions tenha permissão de escrita em Issues

Vá até seu repositório → **Settings → Actions → General → Workflow permissions**

Selecione **"Read and write permissions"** → Salve.

### 3. Execute a demonstração

Vá até a aba **Actions** → clique em **"Sync Owockibot Bounties"** → clique em **"Run workflow"** → defina `demo_mode` como **`true`** → clique no botão verde **"Run workflow"**.

Aguarde cerca de 30 segundos, depois verifique sua aba **Issues**. Você deve ver 6 issues de bounty criadas com etiquetas.

### 4. Vá ao vivo (opcional)

Assim que a API do owockibot estiver publicamente acessível, execute o workflow com `demo_mode` definido como `false` (o padrão). A sincronização é executada automaticamente a cada 6 horas via agendamento.

Para substituir a URL da API, adicione uma variável do repositório:
- Vá até **Settings → Secrets and variables → Actions → Variables**
- Adicione `OWOCKIBOT_API_URL` = `https://owockibot.xyz/api`

---

## Configuração

| Variável | Local | Padrão | Descrição |
|---|---|---|---|
| `OWOCKIBOT_API_URL` | Variável do repositório | `https://owockibot.xyz/api` | URL base da API de bounties |
| `GITHUB_TOKEN` | Fornecido automaticamente | — | Disponível automaticamente em todas as Actions |

Nenhum segredo precisa ser adicionado manualmente — `GITHUB_TOKEN` é fornecido automaticamente pelo GitHub Actions.

---

## Como a sincronização funciona

Cada issue armazena o ID da bounty (`owk-xxx`) em seu corpo. A cada execução, o script:

1. Busca todas as issues existentes etiquetadas com `owockibot`
2. Extrai o ID da bounty de cada issue
3. Compara com os dados mais recentes da API
4. Cria issues para bounties novas, atualiza as alteradas e ignora as inalteradas
5. Fecha issues para bounties concluídas

Isso significa que a sincronização é **idempotente** — executá-la duas vezes produz o mesmo resultado.

---

## Estrutura de arquivos

```
.github/workflows/sync-bounties.yml   Definição da GitHub Action
scripts/sync.js                        Lógica principal de sincronização (Node.js, sem dependências)
scripts/package.json                   Manifesto do pacote
README.md                              Este arquivo
```

---

## Quadro de bounties

Esta ferramenta foi criada para o [quadro de bounties do owockibot](https://owockibot.xyz/bounty) — uma plataforma para coordenação de contribuidores onchain.

Criado por [@cyrilawoyemi99-max](https://github.com/cyrilawoyemi99-max)
