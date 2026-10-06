# Runbook — Publicação editorial de episódio

Este runbook operacionaliza a skill em `skills/episode-publishing/SKILL.md`.

## Estrutura de entrada sugerida

```text
episodio-XX/
├── audio/
│   ├── EpX-marcelo.wav
│   ├── EpX-guido.wav
│   ├── EpX-edu.wav
│   └── EpX.mp3
└── output/
    ├── marcelo/EpX-marcelo.json
    ├── guido/EpX-guido.json
    ├── edu/EpX-edu.json
    └── geral/EpX.json
```

## Pipeline

```text
gravações
  ↓
WhisperX: geral + faixas individuais
  ↓
consolidação editorial
  ↓
raio-X do episódio
  ↓
revisão de recados/eventos/referências
  ↓
descrição + conceito de capa + capa
  ↓
edição do episódio
  ↓
master final
  ↓
WhisperX no master
  ↓
transcrição oficial
```

A transcrição geral fornece a ordem temporal; as individuais ajudam a atribuir falas e recuperar conteúdo. Pauta e links podem ser usados para confirmar detalhes que a transcrição não sustenta com segurança.

## Regra de publicação
Não confundir a transcrição de trabalho com a transcrição oficial. A oficial deve refletir o master que efetivamente foi publicado.
