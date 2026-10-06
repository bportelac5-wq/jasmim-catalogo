# CLAUDE.md

Catálogo online da **Jasmim Flores Artesanais** (flores de chenille feitas à mão). Página única e estática: o visitante vê os produtos, filtra por categoria ou busca, abre um produto, escolhe as variações e é levado ao WhatsApp com uma mensagem de pedido já escrita. Não tem carrinho, pagamento, backend nem login. O link vai na bio do Instagram.

## Stack

- HTML + CSS + JavaScript puro (ES2020+, sem framework, sem bundler, sem `package.json`).
- Dados em `produtos.json`, carregado com `fetch` quando a página abre.
- Fotos, logo, favicon e imagem de OG hospedados no **Imgur** (não há pasta `img/` no repo).
- Fontes do Google Fonts (Cormorant Garamond para títulos, Jost para o texto).
- Hospedagem estática: Vercel (URL canônica) e GitHub Pages.
- Node só para o script de validação (`scripts/validar-produtos.mjs`). A página não usa Node.

## Estrutura

```
index.html                        Marcação da página toda: header, banner, hero, diferenciais, grade, modal, rodapé
produtos.json                     Lista de produtos (é a "base de dados")
js/catalogo.js                    Toda a lógica: carregar, filtrar, buscar, renderizar, modal, banner, WhatsApp
css/style.css                     Todo o visual; tokens de cor e fonte em :root
scripts/validar-produtos.mjs      Valida o produtos.json (sintaxe, campos, ids únicos, tipos)
vercel.json                       Build da Vercel = rodar o validador; serve a raiz
.github/workflows/validar-produtos.yml   Mesmo validador em todo push/PR
README.md                         Guia para a dona da loja (não é dev). Mantenha a linguagem simples
```

`CLAUDE.local.md` e `jasmim-catalogo.code-workspace` ficam fora do Git via `.git/info/exclude`.

## Rodar local

`fetch("produtos.json")` não funciona abrindo o `index.html` direto (`file://`). Precisa de servidor:

```bash
python -m http.server 8000           # abra http://localhost:8000
node scripts/validar-produtos.mjs    # valida o JSON; rode sempre que mexer nele
```

O `<meta name="referrer" content="no-referrer">` no `index.html` é necessário: o Imgur responde 403 para requisições com referer `localhost`/`127.0.0.1`. Sem essa meta, nenhuma foto carrega em teste local. Não remova.

Não há testes automatizados de UI. Para testar sem a extensão do Chrome, dá para usar o Edge headless com `--remote-debugging-port` e um script Node falando CDP via `WebSocket` (Node 22+ já tem). Não precisa instalar nada.

## Deploy

- Push no `main` = produção, tanto na Vercel (https://jasmim-catalogo.vercel.app, URL oficial, é o `og:url`) quanto no GitHub Pages (https://bportelac5-wq.github.io/jasmim-catalogo).
- Na Vercel, o build roda `node scripts/validar-produtos.mjs`. Se o JSON estiver inválido, o deploy falha e a versão anterior continua no ar. O GitHub Pages não tem esse bloqueio; lá o Action só marca ❌ no commit.
- Quase todo o histórico foi editado direto na interface web do GitHub. **Rode `git pull` antes de mexer** para não divergir.
- Não faça push sem o Bruno pedir.

## Modelo de dados (`produtos.json`)

```jsonc
{
  "id": 14,                       // inteiro único; o validador mostra o próximo livre. A ordem no array é a ordem de exibição
  "nome": "Lírio Azul",           // os filtros de categoria dependem do nome (ver abaixo)
  "descricao": "...",
  "preco": 18.0,                  // 0 = "sob consulta"
  "foto": "https://i.imgur.com/xxxx.jpeg",
  "variacoes": { "Cor": ["Vermelha", "Branca"] },   // {} se não tiver
  "destaque": true,               // selo "destaque" + entra no banner
  "novo": true,                   // opcional: selo "novo"
  "personalizado": true           // opcional: selo "personalizado", preço sob consulta, fora do banner, texto de encomenda no WhatsApp
}
```

Ao editar o JSON à mão, insira campos por texto, sem reserializar o arquivo inteiro: `JSON.stringify` trocaria `18.0` por `18` e geraria diff no arquivo todo.

## Como o código funciona

- `CONFIG` no topo de `catalogo.js`:
  - `whatsapp` é a **única** fonte do número. `aplicarWhatsApp()` preenche todo `[data-whats]` (href) e `[data-whats-texto]` (número formatado) do HTML. Os valores escritos no HTML são só fallback.
  - `intervalo` é o tempo do banner, em ms.
- Estado global: `produtos`, `filtroAtivo`, `buscaAtiva`, `produtoAtivo`, `varSelecionadas`, `focoAntesModal`. Helpers:
  - `$` = `getElementById`
  - `esc()` escapa texto que vai para `innerHTML`
  - `norm()` deixa minúsculo e sem acento
  - `fmt()` formata em BRL
- Filtros: o objeto `FILTROS` mapeia categoria → predicado sobre `norm(p.nome)`. Não existe campo de categoria. Categoria nova = botão em `.header-nav` **e** em `.header-mobile-nav` no `index.html` + uma entrada em `FILTROS`.
- A busca procura em nome e descrição, sem diferenciar acento nem maiúscula.
- `renderizar()` refaz a grade com `innerHTML` e religa os listeners. **Todo dado do JSON interpolado em HTML passa por `esc()`.**
- Fotos quebradas:
  - Nos cards e no banner, o `onerror` troca só a `<img>` pelo placeholder ✿ (via `outerHTML`); os selos ficam.
  - No modal, a `<img id="modal-foto">` **nunca sai do DOM**: ela alterna com `#modal-foto-placeholder` usando o atributo `hidden`. A regra `[hidden] { display: none !important }` no CSS é necessária, porque `img { display: block }` e `.card-foto-placeholder { display: flex }` venceriam o `hidden`.
- Modal:
  - Fechado, fica `visibility: hidden` (não recebe Tab). Ao abrir, a visibilidade muda sem transição, para o `.focus()` no botão de fechar funcionar. Ao fechar, ela espera o fade.
  - O Tab fica preso dentro do modal, e ao fechar o foco volta para quem o abriu.
- Se o `produtos.json` falhar, a grade mostra uma mensagem com link do WhatsApp e o banner some.

## Padrões de código

- Tudo em português: nomes de variáveis, funções, classes CSS, ids e comentários (`renderizar`, `abrirModal`, `.card-preco`, `ativo`, `aberta`).
- Classes de estado: `.ativo`, `.aberta`, `.aberto`, `.selecionado`, `.visivel`, `.scrolled`. Para mostrar/esconder elementos fixos, use o atributo `hidden`.
- CSS com nomes no estilo BEM (`.card-badge--novo`, `.banner-btn--prev`), cores sempre por variável (`var(--vinho)`, `var(--rosa-petala)` etc.), seções separadas por comentários `/* ─── NOME ─── */`.
- JS: `const`/`let`, arrow functions, template literals para HTML (sempre com `esc()`), seções com o mesmo estilo de comentário.
- Sem dependências. Não adicione framework, bundler nem npm sem o Bruno pedir.
- Valores visíveis para o cliente em pt-BR; moeda com `toLocaleString("pt-BR", { style: "currency", currency: "BRL" })`.
- O README fala com a dona da loja, não com dev. Mudou algo que ela usa (campos do JSON, número do WhatsApp, publicação)? Atualize o README na mesma linguagem.

## Pontos de atenção

- **Imgur é ponto único de falha** para todas as imagens. O site degrada bem (placeholder ✿), mas fica sem fotos se o Imgur cair ou apagar algo. Hospedar as fotos no próprio repo (`img/`) eliminaria isso.
- O selo `novo` é manual no JSON; alguém precisa tirar quando deixar de ser novidade.

## Ao mexer aqui

- Mudou produto ou preço? Mexa só em `produtos.json` e rode o validador.
- Teste em servidor local, no celular (≤480px) e no desktop. Confira os filtros, a busca (com e sem acento), o modal (inclusive com foto quebrada) e o link do WhatsApp gerado.
