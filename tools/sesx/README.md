# QuintaCast SESX Tools

Ferramentas de pós-produção do QuintaCast para Adobe Audition. O primeiro módulo automatiza a **compactação temporal** do episódio usando uma faixa-guia já processada com **Diagnóstico → Excluir silêncio → Dividir silêncio**.

## Problema que resolve

Fazer manualmente `Seleção de tempo (T) → Exclusão de ondulação em todas as faixas` para centenas de pausas funciona, mas é repetitivo. Pior: se as faixas individuais já tiverem sido divididas em centenas de clipes, um ripple no começo da sessão pode ficar muito lento porque o Audition precisa reposicionar todos os fragmentos posteriores.

A ordem padronizada passa a ser:

1. importar e alinhar Geral + microfones individuais;
2. criar/preparar a faixa-guia;
3. aplicar **Excluir silêncio / Dividir silêncio somente na guia** e revisar os cortes;
4. rodar o compactador SESX;
5. abrir o novo SESX e validar começo/meio/fim;
6. só depois fazer a limpeza individual dos microfones e a edição criativa.

## Compactador

`sesx_compact.py` lê os **gaps internos** da faixa-guia e aplica essas remoções temporalmente a todas as faixas. O arquivo de entrada nunca é sobrescrito.

### Margem de segurança

Default: **100 ms em cada lado do gap**.

Exemplo: um gap de 1.000 ms não remove 1.000 ms. Com margem de 100 ms/lado, remove os 800 ms centrais e preserva 100 ms antes e depois. Isso protege ataques/finais de palavras e deixa a edição natural.

Se o gap for menor ou igual a `2 × margem`, ele é preservado.

O protótipo foi validado no EP3 com **150 ms/lado** e ficou natural. O default de 100 ms foi escolhido como próximo ponto de trabalho, mantendo `--margin-ms 150` disponível.

### Uso

```bash
python3 tools/sesx/sesx_compact.py "EP4.sesx"
```

Saída padrão:

```text
EP4 - compactado-auto-100ms.sesx
```

Override da margem:

```bash
python3 tools/sesx/sesx_compact.py "EP4.sesx" --margin-ms 150
```

Se a guia não for a primeira faixa:

```bash
python3 tools/sesx/sesx_compact.py "EP4.sesx" --guide-track 2
```

## Regras de segurança

- nunca sobrescrever o SESX original;
- usar somente gaps **internos** entre clipes da guia;
- preservar silêncio anterior ao primeiro clipe e posterior ao último;
- preservar gaps curtos demais para comportar as margens;
- manter referências aos áudios originais: a edição é não destrutiva;
- validar no Audition começo, meio e final antes de seguir para a edição fina;
- não aplicar `Excluir silêncio` nas individuais antes da compactação global.

## Validação do EP3

Durante o protótipo, a versão sem margem cortava alguns milissegundos de fala nas individuais. A V2 adicionou 150 ms de proteção em cada extremidade e resolveu o problema de forma perceptualmente satisfatória.

Na sessão de teste:
- 1.617 gaps internos foram identificados;
- com 150 ms/lado, 1.571 foram compactados;
- 46 gaps curtos foram preservados;
- ~12,05 minutos foram removidos automaticamente.

Esses números são do caso de teste e **não são parâmetros fixos**.

## Escopo futuro

Este diretório pode evoluir para um toolkit de pós-produção (validação de sessão, capítulos/markers, relatórios e outras automações). Tratamento de voz/EQ/compressão **não faz parte desta primeira versão**: primeiro consolidamos e testamos a automação de cortes.
