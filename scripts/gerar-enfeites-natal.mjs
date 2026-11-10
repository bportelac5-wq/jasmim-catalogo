// Gera os SVGs de img/natal/. A página só usa os arquivos prontos; rode isto apenas para mudar um enfeite:
//   node scripts/gerar-enfeites-natal.mjs
import { writeFileSync, mkdirSync } from "node:fs";

const SAIDA = new URL("../img/natal/", import.meta.url);
mkdirSync(SAIDA, { recursive: true });

// cores: tokens do style.css + as duas do tema
const VERDE   = { escuro: "#123A26", base: "#17472F", medio: "#1F5C3F", claro: "#3A8A63" };
const OURO    = { escuro: "#8A6A30", base: "#A68040", medio: "#BC9248", claro: "#D9B874" };
const VINHO   = { escuro: "#4A1830", base: "#5E1F3B", medio: "#7B2D4E", claro: "#B0577E" };
const FIO = "#C29A55";

let semente = 20261225;
const rand = () => { semente |= 0; semente = semente + 0x6D2B79F5 | 0; let t = Math.imul(semente ^ semente >>> 15, 1 | semente); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const f = n => { const s = n.toFixed(1); return s.endsWith(".0") ? s.slice(0, -2) : s; };
const rad = g => g * Math.PI / 180;

const catmull = (p, seg = 14, fechado = false) => {
  const r = [], n = p.length, g = i => fechado ? p[(i + n) % n] : p[Math.max(0, Math.min(n - 1, i))];
  for (let i = 0; i < (fechado ? n : n - 1); i++) {
    const [a, b, c, d] = [g(i - 1), g(i), g(i + 1), g(i + 2)];
    for (let k = 0; k < seg; k++) {
      const t = k / seg, t2 = t * t, t3 = t2 * t;
      const q = j => .5 * (2 * b[j] + (c[j] - a[j]) * t + (2 * a[j] - 5 * b[j] + 4 * c[j] - d[j]) * t2 + (3 * b[j] - a[j] - 3 * c[j] + d[j]) * t3);
      r.push([q(0), q(1)]);
    }
  }
  r.push(fechado ? r[0] : p[n - 1]);
  return r;
};
const reamostrar = (p, passo) => {
  const r = [p[0]]; let resto = 0;
  for (let i = 1; i < p.length; i++) {
    let [ax, ay] = p[i - 1]; const [bx, by] = p[i];
    let d = Math.hypot(bx - ax, by - ay);
    while (resto + d >= passo) {
      const t = (passo - resto) / d;
      ax += (bx - ax) * t; ay += (by - ay) * t;
      r.push([ax, ay]); d = Math.hypot(bx - ax, by - ay); resto = 0;
    }
    resto += d;
  }
  return r;
};

// Haste de chenille: um miolo liso + pelinhos curtos saindo dos dois lados
function chenille(pts, { raio, cor, passo = .75, incl = .35, grossura = .7 }) {
  const m = reamostrar(pts, passo);
  const baldes = [[], [], []];
  for (let i = 1; i < m.length - 1; i++) {
    const tx0 = m[i + 1][0] - m[i - 1][0], ty0 = m[i + 1][1] - m[i - 1][1], l = Math.hypot(tx0, ty0) || 1;
    const tx = tx0 / l, ty = ty0 / l, nx = -ty, ny = tx;
    for (const lado of [1, -1]) {
      const inc = incl + (rand() - .5) * .9;
      const dx = nx * lado + tx * inc, dy = ny * lado + ty * inc, dl = Math.hypot(dx, dy);
      const c = raio * (.72 + rand() * .55);
      const sx = m[i][0] + nx * lado * raio * .12, sy = m[i][1] + ny * lado * raio * .12;
      baldes[Math.floor(rand() * 3)].push(`M${f(sx)} ${f(sy)}l${f(dx / dl * c)} ${f(dy / dl * c)}`);
    }
  }
  const miolo = "M" + reamostrar(pts, 3).map(p => `${f(p[0])} ${f(p[1])}`).join("L");
  return `<path d="${miolo}" fill="none" stroke="${cor.base}" stroke-width="${f(raio * 1.45)}" stroke-linecap="round" stroke-linejoin="round"/>` +
    [cor.escuro, cor.medio, cor.claro].map((c, i) => `<path d="${baldes[i].join("")}" stroke="${c}" stroke-width="${grossura}" stroke-linecap="round"/>`).join("");
}

// Brilho da frutinha, da bola dourada, da folha e do cetim
const GRADIENTES = `<defs>
<radialGradient id="baga" cx=".36" cy=".3" r=".75"><stop offset="0" stop-color="#F49AA0"/><stop offset=".32" stop-color="#CC2F44"/><stop offset="1" stop-color="#761126"/></radialGradient>
<radialGradient id="ouro" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#FDF3D2"/><stop offset=".45" stop-color="#D6B067"/><stop offset="1" stop-color="#7F5E28"/></radialGradient>
<linearGradient id="folha" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#318F63"/><stop offset="1" stop-color="#124630"/></linearGradient>
<linearGradient id="cetim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FDF6E8"/><stop offset=".55" stop-color="#ECD9B4"/><stop offset="1" stop-color="#D0B17B"/></linearGradient>
<linearGradient id="cetim2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ECD9B4"/><stop offset="1" stop-color="#BB9960"/></linearGradient>
</defs>`;

const baga = (x, y, r) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="url(#baga)"/>`;
const dourada = (x, y, r) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="url(#ouro)"/>`;

// Agulhas separadas por tom, do mais escuro ao mais claro: dá profundidade e cabe em poucos <path>
const TONS = ["#0F3B26", "#17553A", "#23704C", "#429A6D"];
const novoPinheiro = () => TONS.map(() => []);
const tracar = camadas => camadas.map((c, i) => c.length ? `<path d="${c.join("")}" stroke="${TONS[i]}" stroke-width="1.15" stroke-linecap="round"/>` : "").join("");

// Galho de pinheiro: as agulhas afinam até a ponta
function galho(camadas, x, y, ang, comp, { tom = 1, curva = 0, agulha = 9, passo = 2.4 } = {}) {
  for (let s = 0; s < comp; s += passo) {
    const t = s / comp, a = ang + curva * t;
    const px = x + Math.cos(ang + curva * t * .5) * s, py = y + Math.sin(ang + curva * t * .5) * s;
    const tam = agulha * (1 - .62 * t ** 1.5);
    for (const lado of [-1, 1]) {
      const b = a + lado * rad(32 + rand() * 22), c = tam * (.8 + rand() * .35);
      const t2 = rand() < .32 ? Math.min(3, Math.max(0, tom + (rand() < .45 ? -1 : 1))) : tom;
      camadas[t2].push(`M${f(px)} ${f(py)}l${f(Math.cos(b) * c)} ${f(Math.sin(b) * c)}`);
    }
  }
}

// Vários galhos seguindo o arco, do ponto de partida até a ponta, que afina
function ramoArco(camadas, C, R, gIni, gFim) {
  const sentido = Math.sign(gFim - gIni), total = Math.abs(gFim - gIni);
  for (const [passoG, comp, tom, agulha] of [[8.5, 46, 0, 11], [7.5, 36, 1, 10], [11, 28, 2, 8.5]]) {
    for (let d = 0; d < total - 4; d += passoG) {
      const fim = Math.min(1, (1 - d / total) * 2.4);
      const g = gIni + sentido * (d + rand() * 2.5), r = R + (rand() - .5) * 7;
      const desvio = rad((rand() < .5 ? -1 : 1) * (8 + rand() * 18));
      galho(camadas, C[0] + r * Math.cos(rad(g)), C[1] + r * Math.sin(rad(g)), rad(g + sentido * 90) + desvio,
        comp * (.6 + .4 * fim) * (.85 + rand() * .3), { tom, agulha: agulha * (.7 + .3 * fim), curva: sentido * rad(15) });
    }
  }
}

const azevinho = (x, y, giro, esc = 1) => `<g transform="translate(${f(x)} ${f(y)}) rotate(${f(giro)}) scale(${esc})"><path d="M0 0Q4-5 3-9 9-6 12-10 14-6 20-9 20-5 26-6 25-2 32 0 25 2 26 6 20 5 20 9 14 6 12 10 9 6 3 9 4 5 0 0Z" fill="url(#folha)" stroke="#0E3A25" stroke-width=".6" stroke-linejoin="round"/><path d="M2 0H28" stroke="#A3DABB" stroke-width=".8" stroke-opacity=".7" stroke-linecap="round"/></g>`;

// Cacho: folhas de azevinho abertas e três frutinhas por cima
const cacho = (x, y, giro, esc = 1) =>
  azevinho(x, y, giro + 150, esc * .85) + azevinho(x, y, giro - 40, esc) + azevinho(x, y, giro + 36, esc * .95) +
  baga(x - 4 * esc, y - 3 * esc, 5.4 * esc) + baga(x + 5 * esc, y - 1 * esc, 4.8 * esc) + baga(x, y + 5 * esc, 5 * esc);

// Laço de cetim, igual ao que vai preso no cartão
const laco = (x, y, giro, esc = 1) => {
  const borda = `stroke="#A98A52" stroke-width=".7" stroke-linejoin="round"`;
  return `<g transform="translate(${f(x)} ${f(y)}) rotate(${giro}) scale(${esc})">
<path d="M-4 2C-10 15-19 31-31 47L-21 46-17 57C-8 39-1 21 2 4Z" fill="url(#cetim2)" ${borda}/>
<path d="M4 2C12 13 23 27 37 39L27 42 26 52C15 37 5 21-2 4Z" fill="url(#cetim)" ${borda}/>
<path d="M-3-2C-14-21-45-29-52-12-55 1-28 11-3 3Z" fill="url(#cetim)" ${borda}/>
<path d="M3-2C14-21 45-29 52-12 55 1 28 11 3 3Z" fill="url(#cetim)" ${borda}/>
<path d="M-4 0C-16-5-34-9-46-11-36-2-19 3-4 2ZM4 0C16-5 34-9 46-11 36-2 19 3 4 2Z" fill="#BB9960" fill-opacity=".5"/>
<path d="M-9-14C-20-21-35-23-45-17M9-14C20-21 35-23 45-17" fill="none" stroke="#FFFBF0" stroke-width="1.7" stroke-opacity=".85" stroke-linecap="round"/>
<rect x="-7" y="-7.5" width="14" height="13.5" rx="4.5" fill="url(#cetim2)" ${borda}/>
<path d="M-3-5C-2-2-2 1-3 4M3-5C2-2 2 1 3 4" fill="none" stroke="#A98A52" stroke-opacity=".6" stroke-linecap="round"/>
</g>`;
};

const svg = (nome, l, a, corpo, extra = "") => {
  const s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${l} ${a}" width="${l}" height="${a}">${extra}${corpo}</svg>\n`;
  writeFileSync(new URL(nome, SAIDA), s);
  console.log(nome.padEnd(20), (s.length / 1024).toFixed(1) + " KB");
};

// balanço único ao carregar, como enfeite recém-pendurado
const balanco = (cx, atraso) => `<style>.b{transform-origin:${cx}px 0;animation:b 3.2s ease-out ${atraso}s 1 both}@keyframes b{0%{transform:rotate(2.6deg)}24%{transform:rotate(-1.8deg)}48%{transform:rotate(1.1deg)}72%{transform:rotate(-.5deg)}100%{transform:none}}@media (prefers-reduced-motion:reduce){.b{animation:none}}</style>`;
const fio = (cx, y) => `<path d="M${cx} 0V${y}" stroke="${FIO}" stroke-width="1"/>`;

/* ─── GUIRLANDAS ─── o arco da foto é r=170 centrado em (200,215) num quadro 400×300 */
{
  const C = [200, 215], R = 171;
  const polar = (g, d = 0) => [C[0] + (R + d) * Math.cos(rad(g)), C[1] + (R + d) * Math.sin(rad(g))];
  const miolo = (gIni, gFim) => {
    const [ax, ay] = polar(gIni), [bx, by] = polar(gFim);
    return `<path d="M${f(ax)} ${f(ay)}A${R} ${R} 0 0 1 ${f(bx)} ${f(by)}" fill="none" stroke="#123F2A" stroke-width="7" stroke-linecap="round"/>`;
  };
  const enfeites = (cachos, bolas) =>
    bolas.map(([g, d, r]) => dourada(...polar(g, d), r)).join("") + cachos.map(([g, d, giro, e]) => cacho(...polar(g, d), giro, e)).join("");

  // Laço no alto do arco, com um ramo descendo para cada lado
  const topo = novoPinheiro();
  ramoArco(topo, C, R, 270, 194);
  ramoArco(topo, C, R, 270, 346);
  svg("guirlanda-topo.svg", 400, 300, GRADIENTES + miolo(200, 340) + tracar(topo) +
    enfeites([[226, 2, 135, .92], [314, 2, 45, .92]], [[250, 7, 5], [290, 7, 5], [206, 6, 4.4], [334, 6, 4.4]]) + laco(200, 42, 0, .95));

  // Laço no ombro do arco, com um ramo curto para baixo e um longo por cima
  const lado = novoPinheiro();
  ramoArco(lado, C, R, 208, 166);
  ramoArco(lado, C, R, 208, 326);
  svg("guirlanda-lado.svg", 400, 300, GRADIENTES + miolo(172, 318) + tracar(lado) +
    enfeites([[262, 2, 90, .88]], [[236, 7, 4.8], [288, 7, 5], [308, 6, 4.2]]) + laco(...polar(208, -9), -28, .72));
}

/* ─── ESTRELA ─── arame dourado dobrado */
{
  const cx = 36, cy = 182, E = 25, I = 11.5, p = [];
  for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? I : E; p.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
  svg("estrela.svg", 72, 212, `<g class="b">${fio(cx, cy - E + 1)}${chenille(p, { raio: 3.3, cor: OURO, incl: .1 })}</g>`, balanco(cx, 0));
}

/* ─── BOLA ─── chenille enrolada em espiral, como o miolo da gérbera */
{
  const cx = 34, cy = 92, p = [];
  for (let t = 0; t <= 3 * 2 * Math.PI; t += .12) { const r = 1.5 + t * .98; p.push([cx + r * Math.cos(t + 1), cy + r * Math.sin(t + 1)]); }
  const tampa = `<rect x="${cx - 4.5}" y="${cy - 27.5}" width="9" height="6.5" rx="1.6" fill="${OURO.medio}" stroke="${OURO.escuro}" stroke-width=".6"/>`;
  svg("bola.svg", 68, 124, `<g class="b">${fio(cx, cy - 26)}${chenille(p, { raio: 3.2, cor: VINHO, incl: .2 })}${tampa}</g>`, balanco(cx, .25));
}

/* ─── ÁRVORE ─── um arame verde em zigue-zague */
{
  const cx = 34;
  const p = [[cx, 92], [cx - 7, 102], [cx + 8, 104], [cx - 13, 115], [cx + 14, 117], [cx - 19, 129], [cx + 20, 131], [cx - 24, 143], [cx + 24, 146], [cx + 1, 147], [cx + 1, 158]];
  const topo = `<circle cx="${cx}" cy="90" r="3.4" fill="${OURO.medio}" stroke="${OURO.escuro}" stroke-width=".6"/>`;
  svg("arvore.svg", 68, 164, `<g class="b">${fio(cx, 87)}${chenille(catmull(p, 12), { raio: 3.1, cor: VERDE, incl: .15 })}${topo}</g>`, balanco(cx, .12));
}

/* ─── RAMINHO ─── para o título Catálogo */
{
  const v = novoPinheiro();
  for (const [ang, comp, tom] of [[-14, 62, 0], [-4, 52, 1], [-24, 46, 2], [10, 38, 1]]) galho(v, 24, 32, rad(ang), comp, { tom, agulha: 8, passo: 1.9, curva: rad(-8) });
  svg("raminho.svg", 104, 56, GRADIENTES + tracar(v) + cacho(24, 32, 180, .78));
}

/* ─── FUNDO ─── estampa bem clara de papel de presente; o quadro se repete sem emenda */
{
  const ROSA = "#EEDFE7", DOURADO = "#EBDEC2", S = 380;
  const linha = `fill="none" stroke="${ROSA}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"`;
  const em = (x, y, giro, d) => `<g transform="translate(${x} ${y}) rotate(${giro})">${d}</g>`;
  const floco = (x, y, r, giro = 0) => {
    const b = r * .3, m = r * .62;
    const braco = `M0 0V${-r}M0 ${f(-m)}L${f(b)} ${f(-m - b)}M0 ${f(-m)}L${f(-b)} ${f(-m - b)}`;
    return em(x, y, giro, [0, 60, 120, 180, 240, 300].map(a => `<path transform="rotate(${a})" d="${braco}" ${linha}/>`).join(""));
  };
  const brilho = (x, y, r) => `<path transform="translate(${x} ${y})" d="M0 ${-r}Q${f(r * .16)} ${f(-r * .16)} ${r} 0 ${f(r * .16)} ${f(r * .16)} 0 ${r} ${f(-r * .16)} ${f(r * .16)} ${-r} 0 ${f(-r * .16)} ${f(-r * .16)} 0 ${-r}Z" fill="${DOURADO}"/>`;
  const flor = (x, y, r, giro = 0) => {
    const petala = `M0 0C${f(r * .55)} ${f(-r * .32)} ${f(r * .5)} ${f(-r * .95)} 0 ${f(-r * 1.1)}C${f(-r * .5)} ${f(-r * .95)} ${f(-r * .55)} ${f(-r * .32)} 0 0Z`;
    return em(x, y, giro, [0, 72, 144, 216, 288].map(a => `<path transform="rotate(${a})" d="${petala}" ${linha}/>`).join("") + `<circle r="1.8" fill="${DOURADO}"/>`);
  };
  const ramo = (x, y, giro) => {
    let d = "M-24 0H24";
    for (let i = -18; i <= 18; i += 9) d += `M${i} 0l6-7M${i} 0l6 7`;
    return em(x, y, giro, `<path d="${d}" ${linha}/>`);
  };
  const pontos = [[20, 150], [232, 150], [352, 40], [40, 268], [250, 330], [182, 348], [334, 258], [126, 108], [222, 205], [30, 352]];
  svg("fundo.svg", S, S,
    floco(64, 66, 21) + brilho(168, 40, 9) + flor(262, 78, 16, 18) + brilho(342, 150, 7) + ramo(150, 152, -32) +
    floco(284, 214, 16, 15) + flor(84, 208, 14, -14) + brilho(196, 262, 9) + ramo(312, 322, 26) + floco(110, 322, 22, 10) +
    pontos.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2" fill="${ROSA}"/>`).join(""));
}

/* ─── GUIRLANDA DO BOTÃO ─── em volta do botão Especiais de Natal, com pisca-pisca. Fica no fim: não muda o sorteio dos de cima.
   Medidas do botão com fonte de 15px (162,7×40,4) mais a folga de .6em do ::before; o CSS estica o SVG na mesma proporção */
{
  const F = 9, BW = 162.7, BH = 40.4, W = BW + 2 * F, H = BH + 2 * F;
  // A guirlanda corre um pouco por fora da borda, para as agulhas não encostarem no texto
  const r = BH / 2 + 3, x0 = F + BH / 2, x1 = F + BW - BH / 2, yc = F + BH / 2;
  const reto = x1 - x0, L = 2 * reto + 2 * Math.PI * r;
  // Ponto (afastado d do traçado) e direção, em sentido horário, a s do começo do reto de cima
  const ponto = (s, d = 0) => {
    s = ((s % L) + L) % L;
    const R = r + d;
    if (s < reto) return [x0 + s, yc - R, 0];
    s -= reto;
    if (s < Math.PI * r) { const a = -Math.PI / 2 + s / r; return [x1 + R * Math.cos(a), yc + R * Math.sin(a), a + Math.PI / 2]; }
    s -= Math.PI * r;
    if (s < reto) return [x1 - s, yc + R, Math.PI];
    s -= reto;
    const a = Math.PI / 2 + s / r;
    return [x0 + R * Math.cos(a), yc + R * Math.sin(a), a + Math.PI / 2];
  };

  const pts = [];
  for (let s = 0; s < L; s += 2) pts.push(ponto(s));
  const miolo = `<path d="M${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join("L")}Z" fill="none" stroke="#123F2A" stroke-width="2.4"/>`;

  // Galhos curtos que abrem mais para fora (ângulo menor = lado de fora no sentido horário)
  const v = novoPinheiro();
  for (const [passo, comp, tom, agulha] of [[5, 9.5, 0, 4.4], [6, 8, 1, 4], [8, 6.5, 2, 3.5]]) {
    for (let s = 0; s < L; s += passo) {
      const [x, y, ang] = ponto(s + rand() * 2, rand() * 2 - .6);
      galho(v, x, y, ang - rad(rand() < .75 ? 3 + rand() * 12 : -(2 + rand() * 6)), comp * (.85 + rand() * .3), { tom, agulha, passo: 2.3, curva: rad(-8) });
    }
  }

  // Laço de cetim no ombro esquerdo, no espaço antes do texto; as luzes não passam por baixo dele
  const sLaco = 2 * reto + Math.PI * r + rad(135) * r;
  const [lx, ly] = ponto(sLaco);

  // Pisca-pisca: três cores, cada lâmpada num dos três tempos, apagando devagar
  const CORES = [["#FFCF70", "#FFF0C8"], ["#E5485C", "#FFB3BC"], ["#FFF3D6", "#FFFFFF"]];
  const n = Math.round(L / 17);
  let luzes = "";
  for (let i = 0; i < n; i++) {
    const s = i * L / n + 6;
    if (Math.abs(((s - sLaco + L / 2) % L + L) % L - L / 2) < 15) continue;
    const [x, y] = ponto(s, i % 2 ? 1.8 : -.6);
    const c = i % 3, t = Math.floor(rand() * 3);
    luzes += `<g class="p p${t}"><circle cx="${f(x)}" cy="${f(y)}" r="5.2" fill="url(#luz${c})"/><circle cx="${f(x)}" cy="${f(y)}" r="2.1" fill="${CORES[c][0]}"/><circle cx="${f(x - .6)}" cy="${f(y - .65)}" r=".75" fill="${CORES[c][1]}"/></g>`;
  }
  const brilho = `<defs>${CORES.map(([c], i) => `<radialGradient id="luz${i}"><stop offset="0" stop-color="${c}" stop-opacity=".95"/><stop offset=".4" stop-color="${c}" stop-opacity=".45"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`).join("")}</defs>`;
  const pisca = `<style>.p{animation:p 2.6s ease-in-out infinite}.p1{animation-delay:-.87s}.p2{animation-delay:-1.73s}@keyframes p{0%,100%{opacity:1}50%{opacity:.22}}@media (prefers-reduced-motion:reduce){.p{animation:none}}</style>`;

  // Dois arquivos: a animação faz o navegador redesenhar a imagem inteira a cada quadro, então só as luzes piscam
  svg("guirlanda-botao.svg", f(W), f(H), GRADIENTES + miolo + tracar(v) + laco(lx, ly, -20, .24));
  svg("guirlanda-botao-luzes.svg", f(W), f(H), brilho + luzes, pisca);
}
