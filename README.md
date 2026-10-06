# 🌸 Jasmim Flores Artesanais — Catálogo Online

Site: **https://jasmim-catalogo.vercel.app**

## Estrutura de arquivos

```
jasmim-catalogo/
├── produtos.json       ← AQUI você gerencia os produtos
├── index.html          ← página principal (não edite)
├── css/style.css       ← visual (não edite)
├── js/catalogo.js      ← lógica (não edite, só o número do WhatsApp)
├── img/
│   ├── logo.png        ← logo (também é o ícone da aba e a imagem ao compartilhar)
│   └── produtos/       ← AQUI ficam as fotos dos produtos
├── scripts/            ← conferência automática do produtos.json (não edite)
├── vercel.json         ← configuração da publicação (não edite)
└── README.md           ← este arquivo
```

---

## Como adicionar um produto novo

Abra o arquivo `produtos.json` (pode ser direto no GitHub, no lápis ✏️ de editar).

Copie este bloco e cole antes do último `]`. Coloque uma vírgula depois do `}` do produto anterior:

```json
{
  "id": 14,
  "nome": "Nome do produto",
  "descricao": "Descrição curta do produto aqui.",
  "preco": 18.0,
  "foto": "img/produtos/nome-da-foto.jpg",
  "variacoes": {
    "Cor": ["Rosa", "Branco", "Lilás"]
  },
  "destaque": true,
  "novo": true
}
```

**Campos:**
- `id` → número único. Use o próximo livre (hoje é o **14**). A ordem dos produtos no arquivo é a ordem em que aparecem no site.
- `nome` → nome do produto. **Os filtros do menu leem o nome:** começa com "Rosa" → Rosas; tem "Lírio" → Lírios; também Gérbera, Girassol e Safira.
- `descricao` → descrição curta.
- `preco` → número com ponto (ex.: `18.0`). Use `0` para "sob consulta".
- `foto` → caminho da foto (veja abaixo).
- `variacoes` → opções que a cliente escolhe (cor, tamanho...). Use `{}` se não tiver.
- `destaque` → `true` aparece no banner do topo e com o selo "destaque"; `false` não.
- `novo` → `true` mostra o selo "novo". Tire (ou mude para `false`) quando deixar de ser novidade.

`true` e `false` vão **sem aspas**. Números também.

---

## Como adicionar fotos

1. Renomeie a foto **sem espaço, sem acento e em minúsculas** (ex.: `lirio-lilas.jpg`).
2. No GitHub, entre na pasta `img/produtos` → **Add file** → **Upload files** → arraste a foto → **Commit changes**.
3. No `produtos.json`, coloque o caminho: `"foto": "img/produtos/lirio-lilas.jpg"`.

O nome no JSON precisa ser **idêntico** ao do arquivo, inclusive maiúsculas e a extensão (`.jpg` ≠ `.jpeg`). Se não bater, a conferência automática avisa com um ❌ antes de publicar.

**Dica:** fotos em pé (3:4) ou quadradas ficam melhores, e de até uns 500 KB para o site abrir rápido no celular. Se uma foto faltar, o site mostra uma florzinha ✿ no lugar e continua funcionando.

---

## Como publicar

Não precisa fazer nada além de salvar: toda alteração no `main` do GitHub vai para o site sozinha em 1 ou 2 minutos.

**Errou alguma vírgula?** Antes de publicar, o sistema confere o `produtos.json`.
- Se tiver erro, aparece um ❌ vermelho ao lado da alteração no GitHub. Clique nele para ver a mensagem, que diz qual produto e qual campo corrigir.
- Enquanto isso, o site continua no ar com a versão anterior.

---

## Como editar o número do WhatsApp

Abra `js/catalogo.js` e na linha:
```js
whatsapp: "5519992006605",
```
Troque pelo número desejado (com 55 + DDD, sem espaços ou traços). Todos os botões e o número que aparece no topo do site se atualizam sozinhos.

---

## Produto personalizado / encomenda

Para criar um produto "sob consulta" sem preço fixo:

```json
{
  "id": 15,
  "nome": "Encomenda Personalizada",
  "descricao": "Descreva o que você quer e criamos juntas.",
  "preco": 0,
  "foto": "img/produtos/personalizado.jpg",
  "variacoes": {},
  "destaque": true,
  "personalizado": true
}
```

Produtos com `"personalizado": true` aparecem no filtro "Encomenda" e não entram no banner.

---

Feito com 💕 para a Jasmim Flores Artesanais.
