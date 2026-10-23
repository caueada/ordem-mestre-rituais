# Checklist de smoke no navegador

Rodar contra o `dist/` servido por HTTP e repetir após a publicação:

- A página inicial abre sem erro e mostra 81 rituais e 11 regras.
- A busca por `Alterar Destino` deixa um resultado; limpar restaura a lista.
- O filtro de círculo e o filtro de elemento funcionam juntos.
- Uma busca sem correspondência mostra estado vazio explícito.
- Abrir um ritual mostra símbolo, metadados, efeito, aprimoramentos, texto integral e créditos.
- Recarregar uma URL com `#ritual=rit-alterar-destino` abre a ficha correta.
- A aba `Conjuração` mostra custos de PE e os artigos de regras; voltar para `Rituais` restaura o catálogo.
- Tab alcança busca, filtros, resultados, abas e botão de fechar; `Escape` fecha uma ficha aberta.
- Em viewport estreito, filtros refluem, a ficha ocupa a tela sem cortar texto e o botão de fechar permanece acessível.
- A aba de rede não deve precisar de nenhum domínio externo para carregar os dados, CSS, JavaScript e imagens locais.
