# Web Demos

Vitrine pública de dashboards front-end para cenários de gestão e operação.

## Demos

- `dashboard/index.html` - galeria principal
- `dashboard/dashboard.html` - dashboard executivo
- `dashboard/dashboard-operacional.html` - dashboard operacional

## Estrutura

```text
dashboard/
  css/
    dashboard.css
    index.css
    operational.css
  data/
    executive-data.json
    operational-data.json
  js/
    executive.js
    operational.js
    shared.js
  index.html
  dashboard.html
  dashboard-operacional.html
```

## Recursos implementados

- dados dinâmicos via JSON
- filtros por período (`7d`, `30d`, `90d`)
- tema claro/escuro com persistência (`localStorage`)
- estados de UI: loading, vazio e erro
- navegação entre demos com botão de retorno
- semântica e rótulos para acessibilidade básica

## Como executar

Pode abrir os arquivos HTML direto no navegador, ou usar um servidor local simples:

```bash
python -m http.server 8010
```

Depois acesse: `http://127.0.0.1:8010/dashboard/`

## Deploy no GitHub Pages

1. No repositório `web`, abra **Settings > Pages**
2. Em **Source**, selecione `Deploy from a branch`
3. Branch: `main` / pasta: `/ (root)`
4. Salve e aguarde publicação

URL final esperada:

`https://leonardofelps.github.io/web/dashboard/`

## Próximas melhorias sugeridas

- exportação CSV dos dados da tabela
- mini painel de filtros avançados por canal/status
- simulação de endpoint para troca de ambiente (`mock`/`prod`)
