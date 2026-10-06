// Valida produtos.json. Roda no build da Vercel e no GitHub Actions:
// se falhar, o deploy não acontece e o site continua com a versão anterior.
// Uso: node scripts/validar-produtos.mjs
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const arquivo = new URL("../produtos.json", import.meta.url);
const raiz = fileURLToPath(new URL("..", import.meta.url));
const erros = [];

// Confere pasta por pasta com o nome exato: a Vercel diferencia maiúsculas, o Windows não
function existeExato(caminho) {
  let pasta = raiz;
  for (const parte of caminho.split("/")) {
    let itens;
    try { itens = readdirSync(pasta); } catch { return false; }
    if (!itens.includes(parte)) return false;
    pasta = join(pasta, parte);
  }
  return true;
}

let produtos;
try {
  produtos = JSON.parse(readFileSync(arquivo, "utf8"));
} catch (e) {
  console.error(`✗ produtos.json não é um JSON válido: ${e.message}`);
  console.error("  Confira vírgulas (sem vírgula depois do último item), aspas e colchetes.");
  process.exit(1);
}

if (!Array.isArray(produtos)) {
  console.error("✗ produtos.json precisa ser uma lista: [ {...}, {...} ]");
  process.exit(1);
}

const texto = v => typeof v === "string" && v.trim() !== "";
const ids = new Set();

produtos.forEach((p, i) => {
  const quem = `produto #${i + 1}${texto(p?.nome) ? ` ("${p.nome}")` : ""}`;
  const erro = msg => erros.push(`${quem}: ${msg}`);

  if (typeof p !== "object" || p === null || Array.isArray(p)) return erro("não é um objeto { ... }");

  if (!Number.isInteger(p.id)) erro(`"id" precisa ser número inteiro (veio ${JSON.stringify(p.id)})`);
  else if (ids.has(p.id)) erro(`"id" ${p.id} repetido`);
  else ids.add(p.id);

  if (!texto(p.nome)) erro(`"nome" vazio ou ausente`);
  if (!texto(p.descricao)) erro(`"descricao" vazia ou ausente`);
  if (typeof p.preco !== "number" || !(p.preco >= 0)) erro(`"preco" precisa ser número, ex.: 18.0 (veio ${JSON.stringify(p.preco)})`);
  if (p.foto !== undefined) {
    if (!texto(p.foto)) erro(`"foto" precisa ser um caminho de imagem, ex.: "img/produtos/rosa.jpg"`);
    else if (!/^https?:\/\//.test(p.foto) && !existeExato(p.foto.replace(/^\.?\//, ""))) {
      erro(`foto "${p.foto}" não encontrada. Confira o nome exato do arquivo (maiúsculas, acentos, .jpg/.jpeg)`);
    }
  }

  if (p.variacoes !== undefined) {
    if (typeof p.variacoes !== "object" || p.variacoes === null || Array.isArray(p.variacoes)) {
      erro(`"variacoes" precisa ser { "Cor": ["Rosa", "Branca"] } ou {}`);
    } else {
      for (const [tipo, opcoes] of Object.entries(p.variacoes)) {
        if (!Array.isArray(opcoes) || !opcoes.length || !opcoes.every(texto)) {
          erro(`variação "${tipo}" precisa ser uma lista de textos, ex.: ["Rosa", "Branca"]`);
        }
      }
    }
  }

  for (const campo of ["destaque", "novo", "personalizado"]) {
    if (p[campo] !== undefined && typeof p[campo] !== "boolean") erro(`"${campo}" precisa ser true ou false, sem aspas`);
  }
});

if (erros.length) {
  console.error(`✗ ${erros.length} problema(s) em produtos.json:`);
  erros.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
}

console.log(`✓ produtos.json ok (${produtos.length} produtos, próximo id livre: ${Math.max(0, ...ids) + 1})`);
