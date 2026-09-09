/* ═══════════════════════════════════════════════════
   Jasmim Flores Artesanais — v3
   ═══════════════════════════════════════════════════ */

const CONFIG = {
  whatsapp: "5519992006605",
  // IDs dos produtos mais recentes (aparecem com badge "novo")
  novos: [8, 9],
  // IDs dos produtos em destaque no carrossel
  destaques: [1, 2, 3, 4, 7, 8],
  // Intervalo do carrossel em ms
  intervalo: 3500,
};

let produtos      = [];
let filtroAtivo   = "todos";
let buscaAtiva    = "";
let produtoAtivo  = null;
let varSelecionadas = {};

// Carrossel
let carrIndex   = 0;
let carrTotal   = 0;
let carrTimer   = null;
let carrVisible = 1;

const $ = id => document.getElementById(id);
const fmt = p => p === 0 ? null : p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/* ─── CARREGAR PRODUTOS ───────────────────────────── */
async function carregarProdutos() {
  try {
    const res = await fetch("produtos.json");
    produtos = await res.json();
    iniciarCarrossel();
    renderizar();
  } catch {
    $("grade-produtos").innerHTML =
      `<p style="grid-column:1/-1;text-align:center;color:var(--texto-suave);padding:3rem">
        Não foi possível carregar os produtos.
      </p>`;
  }
}

/* ─── FILTRO + BUSCA ──────────────────────────────── */
function filtrados() {
  let lista = produtos;

  if (filtroAtivo === "rosa")          lista = lista.filter(p => p.nome.toLowerCase().startsWith("rosa"));
  else if (filtroAtivo === "lirio")    lista = lista.filter(p => /l[íi]rio/i.test(p.nome));
  else if (filtroAtivo === "gerbera")  lista = lista.filter(p => /g[eé]rbera/i.test(p.nome));
  else if (filtroAtivo === "personalizado") lista = lista.filter(p => p.personalizado);

  if (buscaAtiva.trim()) {
    const q = buscaAtiva.toLowerCase();
    lista = lista.filter(p => p.nome.toLowerCase().includes(q) || p.descricao.toLowerCase().includes(q));
  }

  return lista;
}

/* ─── RENDERIZAR GRADE ────────────────────────────── */
function renderizar() {
  const grade = $("grade-produtos");
  const lista = filtrados();

  if (lista.length === 0) {
    grade.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--texto-suave);padding:3rem">
      Nenhum produto encontrado.
    </p>`;
    return;
  }

  grade.innerHTML = lista.map(p => cartaoHTML(p)).join("");
  grade.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => abrirModal(+card.dataset.id));
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") abrirModal(+card.dataset.id);
    });
  });
}

function cartaoHTML(p) {
  const fotoHTML = p.foto
    ? `<img class="card-foto" src="${p.foto}" alt="${p.nome}"
            onerror="this.parentElement.innerHTML='<div class=card-foto-placeholder>✿</div>'" />`
    : `<div class="card-foto-placeholder">✿</div>`;

  const badgeDestaque = p.personalizado
    ? `<span class="card-badge" style="background:var(--vinho)">personalizado</span>`
    : `<span class="card-badge">destaque</span>`;

  const badgeNovo = CONFIG.novos.includes(p.id)
    ? `<span class="card-badge card-badge--novo">novo</span>`
    : "";

  const precoHTML = p.personalizado || p.preco === 0
    ? `<span class="card-preco card-preco--consulta">sob consulta</span>`
    : `<span class="card-preco">${fmt(p.preco)}</span>`;

  return `
    <article class="card" data-id="${p.id}" tabindex="0" role="button" aria-label="Ver detalhes de ${p.nome}">
      <div class="card-foto-wrap">
        ${fotoHTML}
        ${badgeDestaque}
        ${badgeNovo}
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

/* ─── CARROSSEL ───────────────────────────────────── */
function iniciarCarrossel() {
  const destaques = produtos.filter(p => CONFIG.destaques.includes(p.id));
  const el = $("carrossel");
  const dots = $("carr-dots");
  if (!el || !destaques.length) return;

  el.innerHTML = destaques.map(p => {
    const foto = p.foto
      ? `<img class="carr-foto" src="${p.foto}" alt="${p.nome}"
              onerror="this.parentElement.innerHTML='<div class=carr-foto-placeholder>✿</div>'">`
      : `<div class="carr-foto-placeholder">✿</div>`;
    const preco = p.preco > 0 ? fmt(p.preco) : "sob consulta";
    return `<div class="carr-slide" data-id="${p.id}">
      ${foto}
      <div class="carr-info">
        <p class="carr-nome">${p.nome}</p>
        <p class="carr-preco">${preco}</p>
      </div>
    </div>`;
  }).join("");

  carrTotal = destaques.length;

  // Dots
  dots.innerHTML = destaques.map((_, i) =>
    `<button class="carr-dot${i === 0 ? " ativo" : ""}" data-i="${i}" aria-label="Slide ${i+1}"></button>`
  ).join("");
  dots.querySelectorAll(".carr-dot").forEach(d =>
    d.addEventListener("click", () => irParaSlide(+d.dataset.i))
  );

  // Clicks nos slides
  el.querySelectorAll(".carr-slide").forEach(s =>
    s.addEventListener("click", () => abrirModal(+s.dataset.id))
  );

  atualizarCarrosselVisivel();
  iniciarTimer();
}

function atualizarCarrosselVisivel() {
  carrVisible = window.innerWidth <= 480 ? 2 : window.innerWidth <= 768 ? 3 : 6;
}

function irParaSlide(i) {
  carrIndex = Math.max(0, Math.min(i, carrTotal - 1));
  moverCarrossel();
  reiniciarTimer();
}

function moverCarrossel() {
  const el = $("carrossel");
  if (!el || !el.children.length) return;
  const gap = 12;
  const slideW = el.children[0].offsetWidth + gap;
  const maxIndex = Math.max(0, carrTotal - carrVisible);
  carrIndex = Math.min(carrIndex, maxIndex);
  el.style.transform = `translateX(-${carrIndex * slideW}px)`;

  $("carr-dots").querySelectorAll(".carr-dot").forEach((d, i) =>
    d.classList.toggle("ativo", i === carrIndex)
  );
}

function iniciarTimer() {
  carrTimer = setInterval(() => {
    const maxIndex = Math.max(0, carrTotal - carrVisible);
    carrIndex = carrIndex >= maxIndex ? 0 : carrIndex + 1;
    moverCarrossel();
  }, CONFIG.intervalo);
}

function reiniciarTimer() {
  clearInterval(carrTimer);
  iniciarTimer();
}

$("carr-prev")?.addEventListener("click", () => {
  carrIndex = Math.max(0, carrIndex - 1);
  moverCarrossel();
  reiniciarTimer();
});
$("carr-next")?.addEventListener("click", () => {
  carrIndex = Math.min(carrTotal - carrVisible, carrIndex + 1);
  moverCarrossel();
  reiniciarTimer();
});
window.addEventListener("resize", () => {
  atualizarCarrosselVisivel();
  moverCarrossel();
});

/* ─── MODAL ───────────────────────────────────────── */
function abrirModal(id) {
  const p = produtos.find(x => x.id === id);
  if (!p) return;
  produtoAtivo = p;
  varSelecionadas = {};

  const foto = $("modal-foto");
  if (p.foto) {
    foto.src = p.foto; foto.alt = p.nome;
    foto.onerror = () => foto.parentElement.innerHTML = `<div class="card-foto-placeholder" style="height:100%">✿</div>`;
  } else {
    foto.parentElement.innerHTML = `<div class="card-foto-placeholder" style="height:100%">✿</div>`;
  }

  $("modal-nome").textContent  = p.nome;
  $("modal-desc").textContent  = p.descricao;
  $("modal-preco").textContent = p.personalizado || p.preco === 0 ? "valor sob consulta" : fmt(p.preco);

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
  $("modal").classList.add("aberto");
  $("modal-fechar").focus();
  document.body.style.overflow = "hidden";
}

function fecharModal() {
  $("modal").classList.remove("aberto");
  document.body.style.overflow = "";
  produtoAtivo = null;
}

function atualizarLinkWhats() {
  if (!produtoAtivo) return;
  const p = produtoAtivo;
  let msg = `Olá! Vi o catálogo da Jasmim Flores Artesanais e tenho interesse:\n\n*${p.nome}*`;
  if (p.preco > 0 && !p.personalizado) msg += `\nPreço: ${fmt(p.preco)}`;
  const vars = Object.entries(varSelecionadas);
  if (vars.length) { msg += "\n\nOpções:"; vars.forEach(([t, v]) => msg += `\n• ${t}: ${v}`); }
  else if (Object.keys(p.variacoes || {}).length) msg += "\n\n(Ainda vou escolher as opções)";
  if (p.personalizado) msg += "\n\nGostaria de saber mais sobre encomenda personalizada.";
  msg += "\n\nPoderia me ajudar? 🌸";
  $("modal-whats").href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
}

$("modal-fechar").addEventListener("click", fecharModal);
$("modal").addEventListener("click", e => { if (e.target === $("modal")) fecharModal(); });
document.addEventListener("keydown", e => { if (e.key === "Escape") fecharModal(); });

/* ─── FILTROS ─────────────────────────────────────── */
function setFiltro(filtro) {
  filtroAtivo = filtro;
  document.querySelectorAll(".nav-btn, .nav-btn-mobile").forEach(b => {
    b.classList.toggle("ativo", b.dataset.filtro === filtro);
  });
  renderizar();
}

document.querySelectorAll(".nav-btn, .nav-btn-mobile").forEach(btn => {
  btn.addEventListener("click", () => setFiltro(btn.dataset.filtro));
});

/* ─── BUSCA ───────────────────────────────────────── */
$("busca-toggle").addEventListener("click", () => {
  $("busca-bar").classList.toggle("aberta");
  if ($("busca-bar").classList.contains("aberta")) $("busca-input").focus();
});
$("busca-fechar").addEventListener("click", () => {
  $("busca-bar").classList.remove("aberta");
  buscaAtiva = "";
  $("busca-input").value = "";
  renderizar();
});
$("busca-input").addEventListener("input", e => {
  buscaAtiva = e.target.value;
  renderizar();
});

/* ─── MENU MOBILE ─────────────────────────────────── */
$("menu-toggle").addEventListener("click", () => {
  const nav = $("mobile-nav");
  nav.classList.toggle("aberta");
  $("menu-toggle").setAttribute("aria-expanded", nav.classList.contains("aberta"));
});

/* ─── HEADER SCROLL ───────────────────────────────── */
window.addEventListener("scroll", () => {
  $("header").classList.toggle("scrolled", window.scrollY > 10);
  $("topo-btn").classList.toggle("visivel", window.scrollY > 400);
});

/* ─── BOTÃO TOPO ──────────────────────────────────── */
$("topo-btn").addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

/* ─── INICIAR ─────────────────────────────────────── */
carregarProdutos();
