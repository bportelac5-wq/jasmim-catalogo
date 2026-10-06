/* ═══════════════════════════════════════════════════
   Jasmim Flores Artesanais — v3
   ═══════════════════════════════════════════════════ */

const CONFIG = {
  // Único lugar do número: links e texto do header/rodapé são preenchidos a partir daqui
  whatsapp: "5519992006605",
  // Intervalo do banner em ms
  intervalo: 4000,
};

let produtos      = [];
let filtroAtivo   = "todos";
let buscaAtiva    = "";
let produtoAtivo  = null;
let varSelecionadas = {};
let focoAntesModal  = null;


const $ = id => document.getElementById(id);
const fmt = p => p === 0 ? null : p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
// Escapa texto antes de entrar em innerHTML
const esc = s => String(s ?? "").replace(/[&<>"']/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
// Minúsculas e sem acento: "Lírio" e "lirio" casam
const norm = s => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

const PLACEHOLDER = `<div class="card-foto-placeholder">✿</div>`;
// Troca só a <img> que falhou pelo placeholder, sem apagar o resto do bloco
const onerrorFoto = `onerror="this.outerHTML='${PLACEHOLDER.replace(/"/g, "&quot;")}'"`;

/* ─── WHATSAPP ────────────────────────────────────── */
function aplicarWhatsApp() {
  const n = CONFIG.whatsapp.replace(/^55/, "");
  const legivel = `(${n.slice(0, 2)}) ${n.slice(2, -4)}-${n.slice(-4)}`;
  document.querySelectorAll("[data-whats]").forEach(a => a.href = `https://wa.me/${CONFIG.whatsapp}`);
  document.querySelectorAll("[data-whats-texto]").forEach(el => el.textContent = legivel);
}

/* ─── CARREGAR PRODUTOS ───────────────────────────── */
async function carregarProdutos() {
  try {
    const res = await fetch("produtos.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(res.status);
    produtos = await res.json();
    iniciarBanner();
    renderizar();
  } catch {
    $("banner").hidden = true;
    mensagemGrade(`Não foi possível carregar os produtos agora.<br>
      <a href="https://wa.me/${CONFIG.whatsapp}" target="_blank" rel="noopener">Fale com a gente pelo WhatsApp</a> 🌸`);
  }
}

function mensagemGrade(html) {
  $("grade-produtos").innerHTML = `<p class="grade-msg">${html}</p>`;
}

/* ─── FILTRO + BUSCA ──────────────────────────────── */
// Categoria = trecho do nome. Para criar uma nova: botão nas duas navs do index.html + uma linha aqui
const FILTROS = {
  rosa:          p => norm(p.nome).startsWith("rosa"),
  lirio:         p => norm(p.nome).includes("lirio"),
  gerbera:       p => norm(p.nome).includes("gerbera"),
  girassol:      p => norm(p.nome).includes("girassol"),
  safira:        p => norm(p.nome).includes("safira"),
  personalizado: p => p.personalizado,
};

function filtrados() {
  let lista = produtos;

  if (FILTROS[filtroAtivo]) lista = lista.filter(FILTROS[filtroAtivo]);

  const q = norm(buscaAtiva.trim());
  if (q) lista = lista.filter(p => norm(p.nome).includes(q) || norm(p.descricao).includes(q));

  return lista;
}

/* ─── RENDERIZAR GRADE ────────────────────────────── */
function renderizar() {
  const grade = $("grade-produtos");
  const lista = filtrados();

  if (lista.length === 0) {
    mensagemGrade("Nenhum produto encontrado.");
    return;
  }

  grade.innerHTML = lista.map(p => cartaoHTML(p)).join("");
  grade.querySelectorAll(".card").forEach(card => {
    card.addEventListener("click", () => abrirModal(+card.dataset.id));
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrirModal(+card.dataset.id); }
    });
  });
}

function cartaoHTML(p) {
  const fotoHTML = p.foto
    ? `<img class="card-foto" src="${esc(p.foto)}" alt="${esc(p.nome)}" loading="lazy" ${onerrorFoto} />`
    : PLACEHOLDER;

  const badgeDestaque = p.personalizado
    ? `<span class="card-badge" style="background:var(--vinho)">personalizado</span>`
    : p.destaque ? `<span class="card-badge">destaque</span>` : "";

  const badgeNovo = p.novo
    ? `<span class="card-badge card-badge--novo">novo</span>`
    : "";

  const precoHTML = p.personalizado || p.preco === 0
    ? `<span class="card-preco card-preco--consulta">sob consulta</span>`
    : `<span class="card-preco">${fmt(p.preco)}</span>`;

  return `
    <article class="card" data-id="${esc(p.id)}" tabindex="0" role="button" aria-label="Ver detalhes de ${esc(p.nome)}">
      <div class="card-foto-wrap">
        ${fotoHTML}
        ${badgeDestaque}
        ${badgeNovo}
      </div>
      <div class="card-body">
        <h2 class="card-nome">${esc(p.nome)}</h2>
        <p class="card-desc">${esc(p.descricao)}</p>
        <div class="card-rodape">
          ${precoHTML}
          <span class="card-ver">ver mais</span>
        </div>
      </div>
    </article>`;
}

/* ─── MODAL ───────────────────────────────────────── */
function abrirModal(id) {
  const p = produtos.find(x => x.id === id);
  if (!p) return;
  produtoAtivo = p;
  varSelecionadas = {};
  if (!$("modal").classList.contains("aberto")) focoAntesModal = document.activeElement;

  // A <img> nunca é removida do DOM: só alterna com o placeholder
  const foto = $("modal-foto");
  const semFoto = $("modal-foto-placeholder");
  const mostrarPlaceholder = sim => { foto.hidden = sim; semFoto.hidden = !sim; };
  foto.onerror = () => mostrarPlaceholder(true);
  foto.removeAttribute("src");
  if (p.foto) {
    mostrarPlaceholder(false);
    foto.alt = p.nome;
    foto.src = p.foto;
  } else {
    foto.alt = "";
    mostrarPlaceholder(true);
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
  if (!$("modal").classList.contains("aberto")) return;
  $("modal").classList.remove("aberto");
  document.body.style.overflow = "";
  produtoAtivo = null;
  focoAntesModal?.focus?.();
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
// Mantém o Tab dentro do modal enquanto ele está aberto
$("modal").addEventListener("keydown", e => {
  if (e.key !== "Tab") return;
  const focaveis = [...$("modal").querySelectorAll("button, a[href]")];
  const primeiro = focaveis[0], ultimo = focaveis[focaveis.length - 1];
  if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
  else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
});


/* ─── BANNER ──────────────────────────────────────────────────────────── */
let bannerIndex = 0;
let bannerTimer = null;
let bannerProdutos = [];

function iniciarBanner() {
  bannerProdutos = produtos.filter(p => p.foto && p.destaque && !p.personalizado);
  if (!bannerProdutos.length) { $("banner").hidden = true; return; }

  const slides = $("banner-slides");
  const dots   = $("banner-dots");

  slides.innerHTML = bannerProdutos.map(p => `
    <div class="banner-slide" data-id="${esc(p.id)}">
      <img src="${esc(p.foto)}" alt="${esc(p.nome)}" loading="lazy" ${onerrorFoto} />
      <div class="banner-slide-info">
        <span class="banner-slide-nome">${esc(p.nome)}</span>
        <span class="banner-slide-preco">${p.preco > 0 ? fmt(p.preco) : "sob consulta"}</span>
      </div>
    </div>`).join("");

  dots.innerHTML = bannerProdutos.map((_, i) =>
    `<button class="banner-dot${i === 0 ? " ativo" : ""}" data-i="${i}" aria-label="Slide ${i+1}"></button>`
  ).join("");

  slides.querySelectorAll(".banner-slide").forEach(s =>
    s.addEventListener("click", () => abrirModal(+s.dataset.id))
  );
  dots.querySelectorAll(".banner-dot").forEach(d =>
    d.addEventListener("click", () => { irBanner(+d.dataset.i); iniciarTimerBanner(); })
  );

  iniciarTimerBanner();
}

function irBanner(i) {
  if (!bannerProdutos.length) return;
  bannerIndex = ((i % bannerProdutos.length) + bannerProdutos.length) % bannerProdutos.length;
  $("banner-slides").style.transform = `translateX(-${bannerIndex * 100}%)`;
  $("banner-dots").querySelectorAll(".banner-dot").forEach((d, j) =>
    d.classList.toggle("ativo", j === bannerIndex)
  );
}

function iniciarTimerBanner() {
  clearInterval(bannerTimer);
  bannerTimer = setInterval(() => irBanner(bannerIndex + 1), CONFIG.intervalo);
}

$("banner-prev")?.addEventListener("click", () => { irBanner(bannerIndex - 1); iniciarTimerBanner(); });
$("banner-next")?.addEventListener("click", () => { irBanner(bannerIndex + 1); iniciarTimerBanner(); });

/* ─── FILTROS ─────────────────────────────────────── */
function setFiltro(filtro) {
  filtroAtivo = filtro;
  document.querySelectorAll(".nav-btn, .nav-btn-mobile").forEach(b => {
    b.classList.toggle("ativo", b.dataset.filtro === filtro);
  });
  // Fecha o menu mobile depois de escolher
  $("mobile-nav").classList.remove("aberta");
  $("menu-toggle").setAttribute("aria-expanded", "false");
  renderizar();
  // Rola até o catálogo
  document.getElementById("catalogo").scrollIntoView({ behavior: "smooth", block: "start" });
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
aplicarWhatsApp();
carregarProdutos();
