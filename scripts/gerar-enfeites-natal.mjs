// Gera os SVGs de img/natal/. A página só usa os arquivos prontos; rode isto apenas para mudar um enfeite:
//   node scripts/gerar-enfeites-natal.mjs
import { writeFileSync, mkdirSync } from "node:fs";

const SAIDA = new URL("../img/natal/", import.meta.url);
mkdirSync(SAIDA, { recursive: true });

// cores: tokens do style.css + as duas do tema
const VERDE   = { escuro: "#123A26", base: "#17472F", medio: "#1F5C3F", claro: "#3A8A63" };
const OURO    = { escuro: "#8A6A30", base: "#A68040", medio: "#BC9248", claro: "#D9B874" };
const VINHO   = { escuro: "#4A1830", base: "#5E1F3B", medio: "#7B2D4E", claro: "#B0577E" };
const BAGA = "#A8213A", BAGA_LUZ = "#D9576B", FIO = "#C29A55";
const CETIM = "#E3CFA8", CETIM_OMBRA = "#C9AE7C", CETIM_LINHA = "#A98A52";

let semente = 20261225;
const rand = () => { semente |= 0; semente = semente + 0x6D2B79F5 | 0; let t = Math.imul(semente ^ semente >>> 15, 1 | semente); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const f = n => { const s = n.toFixed(1); return s.endsWith(".0") ? s.slice(0, -2) : s; };

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
function chenille(pts, { raio, cor, passo = .75, incl = .35, grossura = .7, afinar = 0 }) {
  const m = reamostrar(pts, passo);
  const baldes = [[], [], []];
  for (let i = 1; i < m.length - 1; i++) {
    const tx0 = m[i + 1][0] - m[i - 1][0], ty0 = m[i + 1][1] - m[i - 1][1], l = Math.hypot(tx0, ty0) || 1;
    const tx = tx0 / l, ty = ty0 / l, nx = -ty, ny = tx;
    for (const lado of [1, -1]) {
      const inc = incl + (rand() - .5) * .9;
      const dx = nx * lado + tx * inc, dy = ny * lado + ty * inc, dl = Math.hypot(dx, dy);
      const ponta = afinar ? Math.min(1, .35 + .65 * (m.length - 1 - i) * passo / afinar) : 1;
      const c = raio * (.72 + rand() * .55) * ponta;
      const sx = m[i][0] + nx * lado * raio * .12, sy = m[i][1] + ny * lado * raio * .12;
      baldes[Math.floor(rand() * 3)].push(`M${f(sx)} ${f(sy)}l${f(dx / dl * c)} ${f(dy / dl * c)}`);
    }
  }
  const cortados = afinar ? Math.ceil(afinar * .45 / 3) : 0;
  const lisos = reamostrar(pts, 3);
  const miolo = "M" + lisos.slice(0, lisos.length - cortados).map(p => `${f(p[0])} ${f(p[1])}`).join("L");
  return `<path d="${miolo}" fill="none" stroke="${cor.base}" stroke-width="${f(raio * 1.45)}" stroke-linecap="round" stroke-linejoin="round"/>` +
    [cor.escuro, cor.medio, cor.claro].map((c, i) => `<path d="${baldes[i].join("")}" stroke="${c}" stroke-width="${grossura}" stroke-linecap="round"/>`).join("");
}

const baga = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${BAGA}"/><circle cx="${f(x - r * .3)}" cy="${f(y - r * .32)}" r="${f(r * .26)}" fill="${BAGA_LUZ}"/>`;

// Laço de cetim, igual ao que vai preso no cartão
const laco = (x, y, giro) => `<g transform="translate(${x} ${y}) rotate(${giro})">
<path d="M-3 2C-9 15-12 29-22 44L-13 41-9 49C-2 33 1 17 2 3Z" fill="${CETIM_OMBRA}" stroke="${CETIM_LINHA}" stroke-width=".7" stroke-linejoin="round"/>
<path d="M2 2C9 13 15 25 27 36L17 36 15 45C7 31 0 17-2 3Z" fill="${CETIM}" stroke="${CETIM_LINHA}" stroke-width=".7" stroke-linejoin="round"/>
<path d="M-2-1C-10-15-31-20-34-8-36 3-13 6-2 2Z" fill="${CETIM}" stroke="${CETIM_LINHA}" stroke-width=".7"/>
<path d="M2-1C10-15 31-20 34-8 36 3 13 6 2 2Z" fill="${CETIM}" stroke="${CETIM_LINHA}" stroke-width=".7"/>
<path d="M-5-1C-12-8-22-11-29-8M5-1C12-8 22-11 29-8" fill="none" stroke="${CETIM_OMBRA}" stroke-width="1.6" stroke-linecap="round"/>
<rect x="-5" y="-5" width="10" height="9.5" rx="3" fill="${CETIM_OMBRA}" stroke="${CETIM_LINHA}" stroke-width=".7"/>
</g>`;

const svg = (nome, l, a, corpo, extra = "") => {
  const s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${l} ${a}" width="${l}" height="${a}">${extra}${corpo}</svg>\n`;
  writeFileSync(new URL(nome, SAIDA), s);
  console.log(nome.padEnd(16), (s.length / 1024).toFixed(1) + " KB");
};

// balanço único ao carregar, como enfeite recém-pendurado
const balanco = (cx, atraso) => `<style>.b{transform-origin:${cx}px 0;animation:b 3.2s ease-out ${atraso}s 1 both}@keyframes b{0%{transform:rotate(2.6deg)}24%{transform:rotate(-1.8deg)}48%{transform:rotate(1.1deg)}72%{transform:rotate(-.5deg)}100%{transform:none}}@media (prefers-reduced-motion:reduce){.b{animation:none}}</style>`;
const fio = (cx, y) => `<path d="M${cx} 0V${y}" stroke="${FIO}" stroke-width="1"/>`;

/* ─── GUIRLANDA ─── o arco do banner é r=170 centrado em (200,200) */
{
  const C = 200, R = 171, grau = Math.PI / 180;
  const pt = (g, r = R) => [C + r * Math.cos(g * grau), C + r * Math.sin(g * grau)];
  const onda = g => R + Math.sin(g * grau * 7) * 1.6;
  const ramo = []; for (let g = 170; g <= 312; g += 5) ramo.push(pt(g, onda(g)));
  const volta = []; for (let g = 170; g >= 150; g -= 5) volta.push(pt(g, R + (170 - g) * .1));
  let corpo = chenille(catmull(volta), { raio: 5.6, cor: VERDE, incl: -.4, passo: .6, afinar: 16 });
  corpo += chenille(catmull(ramo), { raio: 6.2, cor: VERDE, incl: .55, passo: .6, afinar: 34 });
  const bagas = [[222, 4, 4.4], [226, 7, 3.6], [259, 5, 4.6], [263, 9, 3.8], [266, 3, 3.6], [294, 5, 4], [298, 8, 3.4]].map(([g, d, r]) => [...pt(g, onda(g) + d).map(n => +f(n)), r]);
  corpo += bagas.map(b => baga(...b)).join("");
  corpo += laco(40, 202, -14);
  svg("guirlanda.svg", 400, 290, corpo);
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
  const p = [[4, 25], [18, 21], [32, 19], [46, 14], [60, 12]];
  const q = [[26, 20], [34, 26], [44, 28]];
  let corpo = chenille(catmull(q), { raio: 3.2, cor: VERDE, incl: .5 }) + chenille(catmull(p), { raio: 3.4, cor: VERDE, incl: .5 });
  corpo += baga(19, 12, 3.6) + baga(27, 9, 3.1) + baga(52, 25, 3.2);
  svg("raminho.svg", 66, 34, corpo);
}
