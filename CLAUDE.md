# CLAUDE.md

Catálogo online da **Jasmim Flores Artesanais** (flores de chenille feitas à mão). Página única e estática: o visitante vê os produtos, filtra por categoria ou busca, abre um produto, escolhe as variações e é levado ao WhatsApp com uma mensagem de pedido já escrita. Não tem carrinho, pagamento, backend nem login. O link vai na bio do Instagram.

## Stack

- HTML + CSS + JavaScript puro (ES2020+, sem framework, sem build, sem `package.json`).
- Dados em `produtos.json`, carregado com `fetch` quando a página abre.
- Fotos, logo, favicon e imagem de OG hospedados no **Imgur** (não há pasta `img/` no repo).
- Fontes do Google Fonts (Cormorant Garamond para títulos, Jost para o texto).
- Hospedagem estática: Vercel (URL canônica) e GitHub Pages.

## Estrutura

```
index.html        Marcação da página toda: header, banner, hero, diferenciais, grade, modal, rodapé
produtos.json     Lista de produtos (é a "base de dados")
js/catalogo.js    Toda a lógica: carregar, filtrar, buscar, renderizar, modal, banner, link do WhatsApp
css/style.css     Todo o visual; tokens de cor e fonte em :root
README.md         Guia para a dona da loja (não é dev): como adicionar produto e publicar
```

`CLAUDE.local.md` e `jasmim-catalogo.code-workspace` ficam fora do Git via `.git/info/exclude`.

## Rodar local

`fetch("produtos.json")` não funciona abrindo o `index.html` direto (`file://`). Precisa de servidor:

```bash
python -m http.server 8000      # depois abra http://localhost:8000
```

Não há testes automatizados nem lint. Para validar o JSON antes de commitar:

```bash
node -e "JSON.parse(require('fs').readFileSync('produtos.json','utf8')); console.log('ok')"
```

## Deploy

- Push no `main` = produção. Em 2026-10-06 tanto https://jasmim-catalogo.vercel.app quanto https://bportelac5-wq.github.io/jasmim-catalogo serviam exatamente o conteúdo do `main`, então os dois publicam a partir dele. A configuração da Vercel fica no painel (não tem `vercel.json` no repo).
- O `og:url` aponta para a Vercel; trate essa como a URL oficial. O README ainda só fala do GitHub Pages.
- Quase todo o histórico foi editado direto na interface web do GitHub. **Rode `git pull` antes de mexer** para não divergir.
- Não faça push sem o Bruno pedir.

## Modelo de dados (`produtos.json`)

```jsonc
{
  "id": 14,                       // único; hoje o maior é 13. A ordem no array é a ordem de exibição
  "nome": "Lírio Azul",           // os filtros de categoria dependem do nome (ver abaixo)
  "descricao": "...",
  "preco": 18.0,                  // 0 = "sob consulta"
  "foto": "https://i.imgur.com/xxxx.jpeg",
  "variacoes": { "Cor": ["Vermelha", "Branca"] },   // {} se não tiver
  "destaque": true,               // ATENÇÃO: o código não lê esse campo
  "personalizado": true           // opcional: badge "personalizado", preço sob consulta, texto de encomenda no WhatsApp
}
```

## Como o código funciona

- Estado global no topo de `catalogo.js`: `produtos`, `filtroAtivo`, `buscaAtiva`, `produtoAtivo`, `varSelecionadas`. O helper `$` é `document.getElementById`.
- `filtrados()` aplica o filtro de categoria e depois a busca. `renderizar()` refaz a grade inteira com `innerHTML` e religa os listeners.
- **Os filtros de categoria são casamentos de texto no `nome`** (`startsWith("rosa")`, `/l[íi]rio/i`, `/g[eé]rbera/i`, `/girassol/i`, `/safira/i`) ou `p.personalizado`. Não existe campo de categoria.
- Para criar uma categoria nova é preciso mexer em três lugares: botão em `.header-nav` e em `.header-mobile-nav` no `index.html`, e um novo `else if` em `filtrados()`.
- Banner: mostra todo produto com foto que não seja `personalizado`, troca a cada 4000 ms.
- Modal: monta os botões de variação; `atualizarLinkWhats()` gera `https://wa.me/<CONFIG.whatsapp>?text=...` com nome, preço e opções.

## Padrões de código

- Tudo em português: nomes de variáveis, funções, classes CSS, ids e comentários (`renderizar`, `abrirModal`, `.card-preco`, `ativo`, `aberta`).
- Classes de estado: `.ativo`, `.aberta`, `.aberto`, `.selecionado`, `.visivel`, `.scrolled`.
- CSS com nomes no estilo BEM (`.card-badge--novo`, `.banner-btn--prev`), cores sempre por variável (`var(--vinho)`, `var(--rosa-petala)` etc.), seções separadas por comentários `/* ─── NOME ─── */`.
- JS: `const`/`let`, arrow functions, template literals para HTML, seções com o mesmo estilo de comentário.
- Sem dependências. Não adicione framework, bundler nem npm sem o Bruno pedir.
- Valores visíveis para o cliente (preço, textos) em pt-BR; moeda com `toLocaleString("pt-BR", { style: "currency", currency: "BRL" })`.

## Bugs e riscos conhecidos

Verificados em 2026-10-06 (o 1 e o 3 foram testados num navegador headless).

1. **Foto quebrada trava o modal.** Em `abrirModal()`, se a foto falha (ou o produto não tem foto), `foto.parentElement.innerHTML = ...` apaga o `<img id="modal-foto">`. No próximo produto clicado, `$("modal-foto")` volta `null` e dá `TypeError: Cannot set properties of null (setting 'src')`: o modal não abre mais até recarregar a página. Como todas as fotos estão no Imgur, basta uma falhar. O mesmo padrão no `onerror` do card apaga os badges junto.
2. **Tudo depende do Imgur.** Fotos, logo, favicon e imagem de compartilhamento. Se o Imgur apagar uma imagem, bloquear hotlink ou ficar fora do ar, o catálogo fica sem imagem (e cai no bug 1). O Imgur já é bloqueado em alguns países (ex.: Reino Unido).
3. **Busca sensível a acento.** "lirio" volta 0 resultados; só "lírio" funciona. Clientes no celular costumam digitar sem acento.
4. **Um erro no JSON derruba o catálogo inteiro.** Uma vírgula a mais e a página mostra "Não foi possível carregar os produtos". O JSON é editado à mão, muitas vezes pelo GitHub web, e não há validação nenhuma antes do deploy.
5. **Número do WhatsApp em 4 lugares.** `CONFIG.whatsapp` no JS mais três no `index.html` (link do header, texto "(19) 99200-6605", link do rodapé). O README manda trocar só no JS.
6. **Campos e configs sem efeito:**
   - `CONFIG.destaques` não é usado (o banner mostra todos os produtos com foto).
   - `CONFIG.intervalo` (3500) não é usado (o timer usa 4000 fixo em `iniciarTimerBanner`).
   - O campo `destaque` do JSON não é lido. O badge "destaque" aparece em todo produto que não é personalizado. O filtro "Destaques" que o README promete não existe.
   - `CONFIG.novos: [8, 9]` marca Gérbera e Lírio Rosa Claro como "novo", mas os mais novos são os ids 11–13. Provavelmente está desatualizado.
7. **README desatualizado:** cita a pasta `img/produtos/` (as fotos estão no Imgur), os exemplos usam `id` 7 e 10, que já existem, e o deploy descrito é só o do GitHub Pages.
8. **XSS teórico:** nome, descrição e foto entram via `innerHTML` sem escape. Hoje o risco é baixo porque só a dona edita o JSON, mas um `"` no nome já quebra o `alt`/`aria-label`.
9. **Código morto:** `.carr-slide` no CSS (carrossel antigo) e a seção vazia `/* CARROSSEL */` no JS.
10. **Detalhes de UX e acessibilidade:**
    - O menu mobile não fecha depois de escolher um filtro.
    - Espaço num card rola a página (falta `preventDefault`).
    - O modal não prende o foco nem devolve o foco ao fechar.
    - O logo leva a `#topo`, que é o hero, abaixo do banner, e não o topo da página.
    - Se não houver produto com foto, os botões do banner calculam `NaN`.

## Ao mexer aqui

- Mudança de produto/preço é só em `produtos.json`; valide o JSON depois.
- Teste em servidor local, no celular (≤480px) e no desktop. Teste os filtros, a busca, o modal e o link do WhatsApp gerado.
- Mudou o número de WhatsApp? Troque nos 4 lugares.
