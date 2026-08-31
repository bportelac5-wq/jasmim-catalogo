/* ═══════════════════════════════════════════════════════════════
   Jasmim Flores Artesanais — Catálogo
   ─── Configuração ─────────────────────────────────────────── */

const CONFIG = {
  whatsapp: "5519992006605",
  // Placeholder quando a foto do produto não carregar
  placeholder: "✿",
};

/* ─── Estado ─────────────────────────────────────────────────── */
let produtos       = [];
let filtroAtivo    = "todos";
let produtoAtivo   = null;
let varSelecionadas = {};   // { "Cor": "Rosa", "Tamanho": "Médio" }

/* ─── Utilitários ─────────────────────────────────────────────── */
const $ = id => document.getElementById(id);
const fmt = preco =>
  preco === 0
    ? null
    : preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/* ─── Carrega JSON ───────────────────────────────────────────── */
async function carregarProdutos() {
  try {
    const res = await fetch("produtos.json");
    produtos = await res.json();
    renderizar();
  } catch (e) {
    $("grade-produtos").innerHTML =
      `<p style="text-align:center;color:var(--texto-suave);padding:3rem">
         Não foi possível carregar os produtos. Tente novamente.
       </p>`;
  }
}

/* ─── Filtrar ────────────────────────────────────────────────── */
function filtrados() {
  if (filtroAtivo === "todos")        return produtos;
  if (filtroAtivo === "destaque")     return produtos.filter(p => p.destaque);
  if (filtroAtivo === "personalizado") return produtos.filter(p => p.personalizado);
  return produtos;
}

/* ─── Renderizar grade ───────────────────────────────────────── */
function renderizar() {
  const grade = $("grade-produtos");
  const lista = filtrados();

  if (lista.length === 0) {
    grade.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--texto-suave);padding:3rem">
      nenhum produto encontrado nesta categoria.
    </p>`;
    return;
  }

  grade.innerHTML = lista.map(p => cartaoHTML(p)).join("");

  // Eventos nos cards
  grade.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => abrirModal(+card.dataset.id));
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") abrirModal(+card.dataset.id);
    });
  });
}

/* ─── HTML do card ───────────────────────────────────────────── */
function cartaoHTML(p) {
  const fotoHTML = p.foto
    ? `<img class="card-foto" src="${p.foto}" alt="${p.nome}"
            onerror="this.parentElement.innerHTML='<div class=card-foto-placeholder>${CONFIG.placeholder}</div>'" />`
    : `<div class="card-foto-placeholder">${CONFIG.placeholder}</div>`;

  const badge = p.destaque
    ? `<span class="card-badge">destaque</span>`
    : p.personalizado
      ? `<span class="card-badge" style="background:var(--vinho)">personalizado</span>`
      : "";

  const precoHTML = p.personalizado || p.preco === 0
    ? `<span class="card-preco card-preco--consulta">sob consulta</span>`
    : `<span class="card-preco">${fmt(p.preco)}</span>`;

  return `
    <article class="card" data-id="${p.id}" tabindex="0" role="button"
             aria-label="Ver detalhes de ${p.nome}">
      <div class="card-foto-wrap">
        ${fotoHTML}
        ${badge}
      </div>
      <div class="card-body">
        <h2 class="card-nome">${p.nome}</h2>
        <p class="card-desc">${p.descricao}</p>
        <div class="card-rodape">
          ${precoHTML}
          <span class="card-ver">ver mais</span>
        </div>
      </div>
    </article>`;
}

/* ─── Modal ──────────────────────────────────────────────────── */
function abrirModal(id) {
  const p = produtos.find(x => x.id === id);
  if (!p) return;

  produtoAtivo   = p;
  varSelecionadas = {};

  // Foto
  const foto = $("modal-foto");
  if (p.foto) {
    foto.src = p.foto;
    foto.alt = p.nome;
    foto.onerror = () => {
      foto.parentElement.innerHTML =
        `<div class="card-foto-placeholder" style="height:100%">${CONFIG.placeholder}</div>`;
    };
  } else {
    foto.parentElement.innerHTML =
      `<div class="card-foto-placeholder" style="height:100%">${CONFIG.placeholder}</div>`;
  }

  $("modal-nome").textContent  = p.nome;
  $("modal-desc").textContent  = p.descricao;
  $("modal-preco").textContent = p.personalizado || p.preco === 0
    ? "valor sob consulta"
    : fmt(p.preco);

  // Variações
  const container = $("modal-variacoes");
  container.innerHTML = "";

  Object.entries(p.variacoes || {}).forEach(([tipo, opcoes]) => {
    const grupo = document.createElement("div");
    grupo.className = "variacao-grupo";

    const label = document.createElement("span");
    label.className = "variacao-label";
    label.textContent = tipo;
    grupo.appendChild(label);

    const linha = document.createElement("div");
    linha.className = "variacao-opcoes";

    opcoes.forEach(op => {
      const btn = document.createElement("button");
      btn.className = "variacao-btn";
      btn.textContent = op;
      btn.addEventListener("click", () => {
        // Deseleciona outros do mesmo grupo
        linha.querySelectorAll(".variacao-btn").forEach(b => b.classList.remove("selecionado"));
        btn.classList.add("selecionado");
        varSelecionadas[tipo] = op;
        atualizarLinkWhats();
      });
      linha.appendChild(btn);
    });

    grupo.appendChild(linha);
    container.appendChild(grupo);
  });

  atualizarLinkWhats();

  const overlay = $("modal");
  overlay.classList.add("aberto");
  overlay.querySelector(".modal-fechar").focus();
  document.body.style.overflow = "hidden";
}

function fecharModal() {
  $("modal").classList.remove("aberto");
  document.body.style.overflow = "";
  produtoAtivo = null;
}

/* ─── Link WhatsApp dinâmico ─────────────────────────────────── */
function atualizarLinkWhats() {
  if (!produtoAtivo) return;
  const p = produtoAtivo;

  let msg = `Olá! Vi o catálogo da Jasmim Flores Artesanais e tenho interesse no produto:\n\n*${p.nome}*`;

  if (p.preco > 0 && !p.personalizado) {
    msg += `\nPreço: ${fmt(p.preco)}`;
  }

  const vars = Object.entries(varSelecionadas);
  if (vars.length > 0) {
    msg += "\n\nOpções escolhidas:";
    vars.forEach(([tipo, val]) => { msg += `\n• ${tipo}: ${val}`; });
  } else if (Object.keys(p.variacoes || {}).length > 0) {
    msg += "\n\n(Ainda vou escolher as opções)";
  }

  if (p.personalizado) {
    msg += "\n\nGostaria de saber mais sobre encomenda personalizada.";
  }

  msg += "\n\nPoderia me ajudar? 🌸";

  const link = $("modal-whats");
  link.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
}

/* ─── Filtros ────────────────────────────────────────────────── */
document.querySelectorAll(".filtro-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filtro-btn").forEach(b => b.classList.remove("ativo"));
    btn.classList.add("ativo");
    filtroAtivo = btn.dataset.filtro;
    renderizar();
  });
});

/* ─── Fechar modal ───────────────────────────────────────────── */
$("modal-fechar").addEventListener("click", fecharModal);
$("modal").addEventListener("click", e => { if (e.target === $("modal")) fecharModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") fecharModal(); });

/* ─── Iniciar ────────────────────────────────────────────────── */
carregarProdutos();
