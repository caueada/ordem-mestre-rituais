# Site público de Rituais — especificação de design

## Intenção

Criar um catálogo público, rápido e responsivo para jogadores consultarem os 81 rituais e as regras de conjuração existentes no projeto Ordem Mestre v2.8.6. O site será separado do app local do mestre, publicado como site estático no GitHub Pages e entregue por um único link.

## Objetivos

- Encontrar um ritual por nome, elemento ou círculo sem abrir o app local.
- Consultar em uma mesma ficha os metadados de execução, efeito, resistência, aprimoramentos, texto integral e imagens/símbolos autorizados.
- Oferecer uma aba de consulta rápida das regras de conjuração, com círculos/custos de PE, execução, componentes, concentração, alvo/área, duração, resistência, DT e aprimoramentos.
- Funcionar bem em celular e desktop, com teclado e sem dependência de backend, login ou estado privado.
- Preservar créditos, fonte, páginas e avisos do material publicado.

## Fora de escopo

- Criaturas, equipamentos, agentes, campanhas, mapas, combate e edição de dados.
- Login, sincronização com o app local, banco de dados, comentários ou painel administrativo.
- Alteração da base original, do executável ou da interface do app local.
- Sincronização automática futura; uma nova publicação será necessária quando a base mudar.

## Decisão de abordagem

Foram consideradas três opções:

1. **Site estático separado no GitHub Pages — escolhida.** Gera apenas os dados públicos necessários em uma pasta própria, mantém o app original intacto e minimiza o risco de expor dados privados. Exige uma nova geração/publicação quando o compêndio mudar.
2. **Site dentro do repositório original.** Reutiliza mais caminhos, mas mistura o produto público com o app local e aumenta o risco de publicar arquivos internos.
3. **Hospedagem externa com espelho no GitHub.** Pode oferecer outro tipo de domínio, mas adiciona serviço e configuração sem necessidade para um catálogo estático.

A opção 1 foi escolhida pelo usuário em 23/10/2026. O usuário também confirmou que possui autorização separada para redistribuir publicamente textos, imagens e símbolos integrais usados na primeira versão.

## Estrutura da experiência

### Cabeçalho e entrada

- Marca Ordem Mestre e título “Rituais”.
- Texto curto explicando que é um compêndio público para consulta durante a sessão.
- Contadores visíveis de rituais e regras.
- Busca por nome, efeito, elemento e metadados.

### Catálogo

- Aba **Rituais** como entrada principal.
- Filtros por círculo e elemento, combináveis com a busca.
- Ordenação alfabética por padrão.
- Lista compacta de fichas com nome, círculo, elementos, execução e símbolo.
- Estado vazio claro quando nenhum resultado corresponde.
- Clique ou teclado abre a ficha sem perder o contexto da busca.

### Ficha do ritual

- Nome, círculo, elementos e símbolo/imagem principal.
- Grade de metadados: execução, alcance, alvo, área, duração e resistência.
- Efeito base e aprimoramentos com custo adicional e requisitos.
- Texto integral preservado em uma seção recolhível para consulta fiel.
- Fonte, páginas, créditos e aviso de licença/autorização em uma seção acessível.
- URL identificável por ritual, permitindo compartilhar uma ficha específica.

### Regras de conjuração

- Aba **Conjuração** com os artigos existentes na categoria `rituais` do arquivo de regras.
- Cartão de referência rápida para os custos base de PE por círculo.
- Artigos em ordem de consulta, com resumo, orientação, exemplo, atenção e referência de página quando disponíveis.

## Conteúdo e dados

- Fonte dos rituais: `assets/base-completa.json`, coleção `rituais`.
- Fonte das regras: `webui/modulos/regras/dados/regras.json`, artigos com `categoria: "rituais"`.
- Serão exportados apenas campos necessários para a experiência pública; nenhum estado de campanha, agente ou preferência do mestre será copiado.
- Caminhos de imagens e símbolos serão validados durante a geração e convertidos para caminhos relativos do site.
- O texto será inserido como texto seguro no DOM; nenhum HTML recebido da base será executado.
- O gerador falhará se a contagem esperada não for 81 ou se houver ritual sem id, nome ou círculo.

## Direção visual

- Manter a identidade existente: fundo escuro, superfícies de painel, tons de papel e acentos por elemento.
- Reutilizar a ideia dos tokens de `webui/style.css`/`ordem-theme.css`, mas sem carregar o app inteiro.
- Usar contraste forte entre título, metadados e texto longo; os acentos de elemento servem para orientação, não para carregar informação sozinhos.
- Usar símbolos e imagens como apoio à identificação do ritual, sem transformar cada resultado em um card visual pesado.
- Evitar animação necessária para leitura; respeitar `prefers-reduced-motion`.

## Implementação mínima

- HTML, CSS e JavaScript sem framework e sem dependência de runtime.
- Dados compilados para JSON estático e assets copiados para uma pasta pública.
- Um script de geração reproduzível para atualizar o catálogo a partir do checkout fornecido.
- GitHub Actions simples para validar e publicar a pasta estática no GitHub Pages.
- Repositório público novo, separado do projeto local, com slug padrão `ordem-mestre-rituais` salvo se o GitHub exigir outro nome disponível.

## Verificação e entrega

- Validar geração e JSON, contagem de 81 rituais, unicidade dos ids, presença dos campos essenciais e existência dos assets referenciados.
- Verificar que nenhum caminho aponta para `%APPDATA%`, caches, dados pessoais ou arquivos fora do site.
- Abrir a publicação real e testar busca, filtros, abertura/fechamento de ficha, aba de regras e layout em viewport estreito.
- Só considerar entregue após o GitHub Pages retornar uma URL pública funcional. O resultado final ao usuário será o link, acompanhado apenas de uma nota curta sobre a publicação.

## Decisões ainda abertas para o implementador

- Usar hash/query string para preservar a ficha aberta em links compartilháveis; a escolha não altera o escopo e será feita pela solução mais curta e acessível.
- Usar o logo local já fornecido pelo usuário se ele existir em formato adequado; caso contrário, usar apenas o nome textual para não adicionar um asset novo.
