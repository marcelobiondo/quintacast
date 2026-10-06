# Pipeline de chapters a partir da mix final

Este documento registra o fluxo validado no episódio 3 do QuintaCast para transformar a **mix final publicada** em uma transcrição com timestamps e, a partir dela, produzir chapters de alto nível para a descrição do episódio.

## Princípio principal

Os timestamps devem nascer da **mix final**, depois de todos os cortes que alteram duração. Se o áudio for recortado depois da transcrição, os chapters deixam de apontar para os momentos corretos.

## Fluxo validado

1. finalizar a edição e exportar a mix final;
2. copiar a mix para o servidor Ubuntu;
3. executar WhisperX dentro de `tmux`, permitindo fechar o terminal sem interromper o processamento;
4. usar o ambiente existente `~/whisper/whisperx-env`;
5. transcrever a mix final em português, CPU-only, priorizando precisão;
6. gerar JSON com timestamps estruturados;
7. analisar a transcrição cronologicamente para identificar **mudanças reais de macroassunto**;
8. revisar os chapters com memória editorial de quem participou do episódio;
9. colocar os timestamps e títulos na descrição publicada.

Exemplo do comando usado no EP3:

```bash
mkdir -p ~/whisper/output/ep3-final

whisperx \
  ~/whisper/'Ep3 - mix - final.mp3' \
  --model large-v3 \
  --language pt \
  --device cpu \
  --compute_type int8 \
  --batch_size 4 \
  --output_dir ~/whisper/output/ep3-final \
  --output_format all
```

## Critério editorial para chapters

Chapter não é índice de palavras-chave.

Evitar criar um capítulo para cada menção a turbina, bomba, dinamômetro, suspensão etc. O objetivo é representar os **atos/blocos do episódio**. Um novo chapter só deve começar quando a conversa realmente muda de macroassunto.

A memória editorial dos participantes é útil como hipótese de estrutura, mas o timestamp final deve ser confirmado na transcrição. Também é importante distinguir uma simples menção antecipada de um assunto do momento em que o bloco realmente começa.

Os títulos devem ser curtos, compreensíveis fora de contexto e, quando possível, gerar curiosidade sem virar clickbait.

## Validação no EP3

O EP3 mostrou que o JSON final do WhisperX é pequeno o suficiente para análise e contém timestamps por segmento/palavra. A estrutura lembrada pelos participantes foi usada para orientar a busca, e a transcrição confirmou pontos fortes de transição, incluindo:

- anúncio do encontro de 11 de outubro;
- pergunta central sobre existir ou não "receita de bolo" em preparação;
- saga mecânica do turbo do Guido;
- início explícito da "epopeia da suspensão" do Marcelo;
- experiência do Edu com Stage 3 e mapa flex;
- conversa mais solta antes do encerramento;
- fechamento do episódio.

## Próxima evolução

Esse fluxo pode virar uma ferramenta do toolkit:

`mix final → WhisperX → JSON → sugestão automática de macrochapters → revisão humana → descrição/publicação`

A geração automática deve continuar assistida: semântica e timestamps podem ser automatizados, mas a decisão de granularidade e o nome final dos chapters são editoriais.
