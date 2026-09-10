# Iconografia

O QuintaCast usa [Lucide](https://lucide.dev/) como biblioteca padrão de ícones da interface.

A biblioteca é instalada como dependência do projeto via npm e os ícones utilizados são importados explicitamente. Não usamos CDN, emojis ou SVGs duplicados para representar ações que já fazem parte da iconografia do projeto.

## Arquitetura

A configuração e o acesso aos ícones ficam centralizados em:

`src/icons.js`

Os componentes da interface não devem importar ícones diretamente do Lucide. Em vez disso, devem utilizar o helper central:

```js
createIcon("nome-do-icone")
```

Exemplo:

```js
${createIcon("clock")}
```

Essa abordagem mantém tamanho, peso, acessibilidade e comportamento visual consistentes em toda a interface.

## Ícones disponíveis

Atualmente o projeto possui:

| Nome | Lucide | Uso |
| --- | --- | --- |
| `calendar` | `Calendar` | Data de publicação do episódio |
| `clock` | `Clock` | Duração do episódio |
| `mic` | `Mic` | Apresentadores / participantes |
| `play` | `Play` | Ação "Ouvir agora" |

Novos ícones devem ser adicionados ao registro central em `src/icons.js` antes de serem utilizados na interface.

## Onde são utilizados

A iconografia atualmente aparece nos cards de episódio da Home e nos cards de episódio das páginas de participantes.

A linguagem visual adotada é:

- `Calendar` antes da data de publicação;
- `Clock` antes da duração;
- `Mic` antes da informação de apresentação/participantes;
- `Play` antes da ação "Ouvir agora".

A intenção é que usos semanticamente equivalentes reutilizem sempre o mesmo ícone.

## Configuração visual

O helper `createIcon()` define os valores padrão compartilhados pela família de ícones, incluindo:

- tamanho;
- `strokeWidth`;
- classe CSS opcional;
- atributos de acessibilidade.

Por padrão, alterações visuais que devem afetar toda a família de ícones devem ser feitas no helper central.

Por exemplo, se for decidido que os ícones precisam ter mais peso visual, o valor padrão de:

```js
strokeWidth = 2
```

em `src/icons.js` deve ser alterado.

Isso permite aumentar ou diminuir o peso de `Calendar`, `Clock`, `Mic`, `Play` e futuros ícones de maneira uniforme.

Evite alterar individualmente o `strokeWidth` de um ícone sem uma necessidade específica.

## Ajustes ópticos

Centralizar matematicamente um SVG nem sempre significa que ele estará visualmente alinhado.

Ajustes ópticos específicos podem existir no CSS quando a geometria de determinado ícone exigir uma pequena compensação.

Exemplo atual:

```css
.listen-button svg {
  transform: translateY(-1px);
}
```

Esse ajuste existe porque o desenho triangular do ícone `Play`, apesar de matematicamente centralizado com o texto através de `align-items: center`, aparentava estar ligeiramente desalinhado.

O ajuste de `-1px` corrige apenas essa percepção visual.

Esse tipo de correção deve permanecer específico ao componente ou ícone que precisa dela, sem alterar o comportamento global da família.

## Como adicionar um novo ícone

Antes de adicionar qualquer nova solução de iconografia, verifique primeiro se o Lucide já possui um ícone adequado.

Caso exista:

1. Importe o novo ícone em `src/icons.js`.
2. Registre-o no objeto central de ícones.
3. Utilize-o através de `createIcon()`.
4. Adicione o novo uso à tabela deste documento.
5. Valide o resultado em light e dark mode e nos breakpoints relevantes.

Exemplo:

```js
import {
  Calendar,
  Clock,
  Mic,
  Play,
  ExternalLink
} from "lucide";

const icons = {
  calendar: Calendar,
  clock: Clock,
  mic: Mic,
  play: Play,
  externalLink: ExternalLink
};
```

Depois disso, o ícone pode ser consumido na interface através de:

```js
${createIcon("externalLink")}
```

## Dependência

Lucide é uma dependência interna do projeto instalada via npm.

A dependência deve estar declarada em:

```text
package.json
```

e sua versão resolvida é registrada em:

```text
package-lock.json
```

O código da biblioteca instalado localmente em `node_modules` não deve ser versionado no Git.

Ao clonar o projeto, as dependências são reconstruídas através de:

```bash
npm install
```

Não é necessário adicionar Lucide através de CDN ou copiar os arquivos da biblioteca para o projeto.

## Por que Lucide

Lucide foi escolhido por oferecer:

- ícones vetoriais consistentes;
- linguagem visual simples;
- possibilidade de controlar tamanho e peso;
- uso em projetos JavaScript sem necessidade de framework;
- importação apenas dos ícones necessários;
- biblioteca open source;
- facilidade para expandir a iconografia sem criar SVGs manualmente.

O objetivo não é criar um design system completo neste momento.

A biblioteca funciona como uma infraestrutura pequena e previsível para manter a iconografia consistente enquanto o QuintaCast evolui.

## Acessibilidade

Os ícones utilizados atualmente são decorativos e acompanham informações que também existem em texto.

Exemplos:

```text
[Calendar] 27 de agosto de 2026
[Clock] 01:39:08
[Mic] Apresentação: Marcelo · Guido · Edu
[Play] Ouvir agora
```

O significado da informação não depende exclusivamente do ícone.

Por isso, o helper gera os SVGs com:

```html
aria-hidden="true"
focusable="false"
```

Isso evita que tecnologias assistivas anunciem conteúdo redundante.

Ícones não devem substituir labels importantes de ações sem que exista uma alternativa acessível.

## Diretriz para humanos e agentes de IA

Antes de criar, desenhar, copiar ou instalar qualquer nova solução de iconografia no QuintaCast:

1. Consulte este documento.
2. Consulte `src/icons.js`.
3. Verifique se o ícone necessário já está registrado.
4. Reutilize os ícones existentes sempre que possível.
5. Caso seja necessário um novo ícone, procure primeiro no Lucide.
6. Adicione novos ícones através da infraestrutura existente.
7. Atualize esta documentação quando a biblioteca disponível for expandida.

Não introduza uma segunda biblioteca de ícones sem uma decisão explícita de arquitetura.

Não adicione SVGs individuais manualmente quando o Lucide já oferecer uma solução adequada.

Não utilize emojis como substitutos de ícones funcionais da interface quando houver um ícone correspondente na biblioteca.

Não importe Lucide diretamente em diferentes componentes sem necessidade. O ponto preferencial de acesso é `src/icons.js`.

## Princípio

A iconografia do QuintaCast deve ter:

**uma biblioteca, um ponto de entrada e uma linguagem visual consistente.**

A solução deve continuar pequena o suficiente para o estágio atual do produto, mas estruturada o suficiente para crescer sem acumular diferentes padrões de ícones pela interface.