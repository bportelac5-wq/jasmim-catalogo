# 🌸 Jasmim Flores Artesanais — Catálogo Online

Site: **https://jasmim-catalogo.vercel.app**

## Estrutura de arquivos

```
jasmim-catalogo/
├── produtos.json       ← AQUI você gerencia os produtos
├── index.html          ← página principal (não edite)
├── css/style.css       ← visual (não edite)
├── js/catalogo.js      ← lógica (não edite, só o número do WhatsApp)
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
  "foto": "https://i.imgur.com/XXXXXXX.jpeg",
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
- `foto` → link da foto (veja abaixo).
- `variacoes` → opções que a cliente escolhe (cor, tamanho...). Use `{}` se não tiver.
- `destaque` → `true` aparece no banner do topo e com o selo "destaque"; `false` não.
- `novo` → `true` mostra o selo "novo". Tire (ou mude para `false`) quando deixar de ser novidade.

`true` e `false` vão **sem aspas**. Números também.

---

## Como adicionar fotos

1. Entre em [imgur.com](https://imgur.com) e envie a foto.
2. Clique com o botão direito na foto → **Copiar endereço da imagem**.
3. O link precisa começar com `https://i.imgur.com/` e terminar em `.jpeg`, `.jpg` ou `.png`.
4. Cole no campo `"foto"`.

**Dica:** fotos quadradas ou 4:3 ficam melhores. Se uma foto sair do ar, o site mostra uma florzinha ✿ no lugar e continua funcionando.

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
  "foto": "https://i.imgur.com/XXXXXXX.jpeg",
  "variacoes": {},
  "destaque": true,
  "personalizado": true
}
```

Produtos com `"personalizado": true` aparecem no filtro "Encomenda" e não entram no banner.

---

Feito com 💕 para a Jasmim Flores Artesanais.
