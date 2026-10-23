# Ordem Mestre · Rituais

Catálogo público e somente leitura dos rituais e das regras de conjuração do Ordem Mestre v2.8.6.

## Desenvolvimento local

O app original é somente fonte de dados para a geração. O site não lê `%APPDATA%` nem copia estado editável do mestre.

```powershell
$env:ORDEM_MESTRE_SOURCE = 'C:\Ordem-Mestre-v2.8.6-Windows'
node scripts/build-site.mjs --source $env:ORDEM_MESTRE_SOURCE --out dist
node --test tests/*.test.mjs
```

Sirva `dist/` por HTTP para testar `fetch()` e os links por hash. Não abra o HTML diretamente pelo sistema de arquivos.

Quando a base mudar, gere novamente o `dist/`, rode os testes e faça commit apenas da nova saída pública. O workflow do GitHub Pages publica o `dist/` versionado; ele não tem acesso ao checkout local original.

## Conteúdo

O catálogo contém 81 rituais, 11 artigos de conjuração, símbolos, imagens, fonte, páginas e créditos. A publicação integral foi autorizada pelo responsável pelo projeto para esta versão pública.

## Publicação

O workflow em `.github/workflows/pages.yml` usa o GitHub Pages e não instala dependências de runtime. O repositório público deve conter somente o site separado e seus arquivos públicos gerados.
