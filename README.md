# 🌸 Jasmim Flores Artesanais — Catálogo Online

## Estrutura de arquivos

```
jasmim-catalogo/
├── index.html          ← página principal (não edite)
├── produtos.json       ← AQUI você gerencia os produtos
├── README.md           ← este arquivo
├── css/
│   └── style.css       ← visual (não edite)
├── js/
│   └── catalogo.js     ← lógica (não edite)
└── img/
    └── produtos/       ← AQUI você coloca as fotos
```

---

## Como adicionar um produto novo

Abra o arquivo `produtos.json` em qualquer editor de texto (Bloco de Notas funciona).

Copie este bloco e cole antes do último `]`, separado por vírgula:

```json
{
  "id": 7,
  "nome": "Nome do produto",
  "descricao": "Descrição curta do produto aqui.",
  "preco": 99.90,
  "foto": "img/produtos/nome-da-foto.jpg",
  "variacoes": {
    "Cor": ["Rosa", "Branco", "Lilás"],
    "Tamanho": ["Pequeno", "Grande"]
  },
  "destaque": false
}
```

**Campos obrigatórios:**
- `id` → número único, sempre maior que o anterior
- `nome` → nome do produto
- `descricao` → descrição curta
- `preco` → número com ponto decimal (ex: `89.90`). Use `0` para "sob consulta"
- `foto` → caminho da foto (veja abaixo)
- `variacoes` → pode ser vazio `{}` se não tiver variações
- `destaque` → `true` aparece no filtro "Destaques", `false` não

---

## Como adicionar fotos

1. Coloque a foto dentro da pasta `img/produtos/`
2. Use nomes sem espaço e sem acento (ex: `buque-grande.jpg`)
3. No JSON, coloque o caminho: `"foto": "img/produtos/buque-grande.jpg"`

**Dica:** Fotos quadradas ou 4:3 ficam melhores no catálogo.

---

## Como publicar no GitHub Pages (gratuito)

1. Crie uma conta em [github.com](https://github.com)
2. Crie um repositório novo (ex: `jasmim-catalogo`)
3. Suba todos os arquivos desta pasta
4. Vá em **Settings → Pages → Branch: main → Save**
5. Seu link será: `https://seuusuario.github.io/jasmim-catalogo`

Cole esse link na bio do Instagram. Pronto. ✅

---

## Como editar o número do WhatsApp

Abra `js/catalogo.js` e na linha:
```js
whatsapp: "5519992006605",
```
Troque pelo número desejado (com código do país, sem espaços ou traços).

---

## Produto personalizado / encomenda

Para criar um produto "sob consulta" sem preço fixo:

```json
{
  "id": 10,
  "nome": "Encomenda Personalizada",
  "descricao": "Descreva o que você quer e criamos juntas.",
  "preco": 0,
  "foto": "img/produtos/personalizado.jpg",
  "variacoes": {},
  "destaque": true,
  "personalizado": true
}
```

---

Feito com 💕 para a Jasmim Flores Artesanais.
