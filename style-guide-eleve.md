# Style Guide — Colégio Eleve
> Referência de design para uso com IA (Claude) e desenvolvimento em React/Next.js com Tailwind CSS.
> Versão 2.0 — paleta oficial confirmada.

---

## 1. Como usar este guia com IA

Cole o conteúdo deste arquivo (ou seções relevantes) no início do prompt ao pedir páginas/componentes.

**Instrução padrão para o Claude:**
```
Use o style guide do Colégio Eleve abaixo. Siga estritamente as cores, tipografia e tokens definidos.
Gere componentes React com Tailwind CSS usando as classes customizadas do tailwind.config.js fornecido.
NÃO use gradientes em botões. NÃO use purple como cor de fundo ou botão.
Botões sempre no estilo pill (rounded-full) com hover:scale-105.
[cole o style guide aqui]
```

---

## 2. Paleta de Cores

### Hierarquia oficial

| Papel         | Nome              | Hex       | Uso                                           |
|---------------|-------------------|-----------|-----------------------------------------------|
| **Primary**   | `eleve-orange`    | `#FF6F3D` | CTAs principais, botões primários, destaques  |
| **Secondary** | `eleve-teal`      | `#1AC2C2` | Botões secundários, links, ícones, badges     |
| **Accent**    | `eleve-purple`    | `#8A2BE2` | Gradientes de texto e ícones decorativos ONLY |
| **Text**      | `eleve-gray`      | `#848484` | Textos corridos, subtítulos, labels           |
| **Dark**      | `eleve-dark`      | `#2D2D2D` | Títulos, textos fortes, fundos escuros        |
| **Light**     | `eleve-light`     | `#F8F9FA` | Backgrounds de seção alternada                |

### Escalas de apoio

```
eleve-orange-light: #FFB09A   (hover states suaves, backgrounds de badge)
eleve-orange-dark:  #D94E1F   (hover de botão primário)

eleve-teal-light:   #7DE8E8   (backgrounds suaves, badges)
eleve-teal-dark:    #0F9494   (hover de botão secundário)

eleve-purple-light: #B57BE8   (gradientes de texto mais suaves)

eleve-gray-light:   #F0F0F0   (borders, dividers)
eleve-gray-dark:    #4A4A4A   (texto mais escuro quando necessário)
```

### Uso semântico

```
Texto principal:     eleve-gray       (#848484)
Títulos/Heading:     eleve-dark       (#2D2D2D)
Background padrão:   #FFFFFF
Background seção:    eleve-light      (#F8F9FA)
Background escuro:   eleve-dark       (#2D2D2D)
CTA primário:        eleve-orange     (#FF6F3D)
CTA secundário:      eleve-teal       (#1AC2C2)
Accent/efeito:       eleve-purple     (#8A2BE2) — NUNCA em botões ou fundos
Bordas/divisores:    eleve-gray-light (#F0F0F0)
```

### Gradientes (somente texto e ícones decorativos)

```css
/* Gradiente principal — títulos de destaque */
.text-gradient-main {
  background: linear-gradient(90deg, #FF6F3D, #8A2BE2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Gradiente suave — destaques secundários */
.text-gradient-soft {
  background: linear-gradient(90deg, #1AC2C2, #8A2BE2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Gradiente teal-orange */
.text-gradient-warm {
  background: linear-gradient(90deg, #FF6F3D, #1AC2C2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

> ⚠️ **Regra rígida:** Gradientes NUNCA em botões, cards ou backgrounds. Apenas em texto e ícones isolados.

---

## 3. Tipografia

### Fonte principal

**Neue Montreal** — fonte institucional do Colégio Eleve.
Fallback recomendado: **DM Sans** (Google Fonts, gratuita).
Fallback temporário em uso: **Inter** (aceitável até substituição).

```css
@font-face {
  font-family: 'Neue Montreal';
  src: url('/fonts/NeueMontreal-Regular.woff2') format('woff2');
  font-weight: 400;
}
@font-face {
  font-family: 'Neue Montreal';
  src: url('/fonts/NeueMontreal-Medium.woff2') format('woff2');
  font-weight: 500;
}
@font-face {
  font-family: 'Neue Montreal';
  src: url('/fonts/NeueMontreal-Bold.woff2') format('woff2');
  font-weight: 700;
}
```

```js
// next/font com DM Sans (fallback recomendado)
import { DM_Sans } from 'next/font/google'
export const dmSans = DM_Sans({ subsets: ['latin'], weight: ['400','500','600','700'] })
```

### Escala tipográfica

| Token          | Tamanho | Peso | Line-height | Uso                       |
|----------------|---------|------|-------------|---------------------------|
| `text-display` | 56px    | 800  | 1.05        | Hero, landing principal   |
| `text-h1`      | 40px    | 700  | 1.1         | Títulos de página         |
| `text-h2`      | 32px    | 700  | 1.2         | Títulos de seção          |
| `text-h3`      | 24px    | 600  | 1.3         | Subtítulos, card titles   |
| `text-h4`      | 18px    | 600  | 1.4         | Labels de seção           |
| `text-body`    | 16px    | 400  | 1.6         | Corpo de texto padrão     |
| `text-small`   | 14px    | 400  | 1.5         | Legendas, metadados       |
| `text-xs`      | 12px    | 500  | 1.4         | Badges, tags, notas       |

### Regras de cor em texto

```
Títulos (h1–h2):    eleve-dark  (#2D2D2D) + font-bold
Subtítulos (h3–h4): eleve-dark  (#2D2D2D) + font-semibold
Corpo:              eleve-gray  (#848484) + font-normal
Destaque inline:    eleve-orange ou gradiente de texto
Label/UI:           eleve-gray  + tracking-wide
```

---

## 4. tailwind.config.js

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'eleve-orange':        '#FF6F3D',
        'eleve-orange-light':  '#FFB09A',
        'eleve-orange-dark':   '#D94E1F',
        'eleve-teal':          '#1AC2C2',
        'eleve-teal-light':    '#7DE8E8',
        'eleve-teal-dark':     '#0F9494',
        'eleve-purple':        '#8A2BE2',
        'eleve-purple-light':  '#B57BE8',
        'eleve-gray':          '#848484',
        'eleve-gray-light':    '#F0F0F0',
        'eleve-gray-dark':     '#4A4A4A',
        'eleve-dark':          '#2D2D2D',
        'eleve-light':         '#F8F9FA',
      },
      fontFamily: {
        sans:    ['Neue Montreal', 'DM Sans', 'Inter', 'sans-serif'],
        display: ['Neue Montreal', 'DM Sans', 'Inter', 'sans-serif'],
      },
      fontSize: {
        'display': ['3.5rem', { lineHeight: '1.05', letterSpacing: '-0.03em', fontWeight: '800' }],
        'h1':      ['2.5rem', { lineHeight: '1.1',  letterSpacing: '-0.02em', fontWeight: '700' }],
        'h2':      ['2rem',   { lineHeight: '1.2',  letterSpacing: '-0.01em', fontWeight: '700' }],
        'h3':      ['1.5rem', { lineHeight: '1.3',  fontWeight: '600' }],
        'h4':      ['1.125rem',{ lineHeight: '1.4', fontWeight: '600' }],
      },
      borderRadius: {
        'eleve':    '12px',
        'eleve-sm': '8px',
        'eleve-lg': '20px',
      },
      boxShadow: {
        'eleve':      '0 4px 24px rgba(255, 111, 61, 0.15)',
        'eleve-teal': '0 4px 24px rgba(26, 194, 194, 0.15)',
        'card':       '0 2px 16px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 32px rgba(0, 0, 0, 0.14)',
        'btn':        '0 4px 14px rgba(255, 111, 61, 0.35)',
        'btn-teal':   '0 4px 14px rgba(26, 194, 194, 0.35)',
      },
    },
  },
  plugins: [],
}
```

---

## 5. Botões

> **Estilo base:** pill (`rounded-full`) + `hover:scale-105` + `transition-all duration-300`
> **Regra:** cor sólida sempre, SEM gradiente, texto branco ou da cor principal.

### Primário — Laranja (fundo escuro ou claro)
```jsx
<button className="bg-eleve-orange text-white font-semibold py-3 px-8 rounded-full 
  shadow-btn hover:bg-eleve-orange-dark hover:scale-105 transition-all duration-300">
  Agende uma visita
</button>
```

### Secundário — Teal outline
```jsx
<button className="border-2 border-eleve-teal text-eleve-teal font-semibold py-3 px-8 
  rounded-full hover:bg-eleve-teal hover:text-white 
  hover:scale-105 transition-all duration-300">
  Saiba mais
</button>
```

### Secundário — Teal sólido
```jsx
<button className="bg-eleve-teal text-white font-semibold py-3 px-8 rounded-full 
  shadow-btn-teal hover:bg-eleve-teal-dark hover:scale-105 transition-all duration-300">
  Descubra mais
</button>
```

### Ghost — sobre hero com imagem/fundo escuro
```jsx
<button className="bg-white/10 backdrop-blur-sm border border-white/30 text-white 
  font-semibold py-3 px-8 rounded-full 
  hover:bg-white/20 hover:scale-105 transition-all duration-300 flex items-center gap-2">
  Descubra mais <MoveRight className="w-5 h-5" />
</button>
```

### Tamanhos

| Variante | Classes                         |
|----------|---------------------------------|
| sm       | `py-2 px-5 text-sm`             |
| md       | `py-3 px-8 text-base` ← padrão |
| lg       | `py-4 px-10 text-lg`            |

---

## 6. Cards

### Card de programa/curso
```jsx
<div className="group bg-white rounded-2xl shadow-card hover:shadow-card-hover 
  hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col">
  <div className="overflow-hidden">
    <img className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" 
      src={image} alt={alt} />
  </div>
  <div className="p-8 flex flex-col flex-grow">
    <h3 className="text-h3 text-eleve-dark mb-2">Título</h3>
    <p className="font-semibold text-eleve-orange mb-4">Subtítulo</p>
    <p className="text-eleve-gray">Descrição...</p>
  </div>
</div>
```

### Card blur (sobre imagem de fundo)
```jsx
<div className="bg-white/20 backdrop-blur-md rounded-2xl p-10 shadow-2xl border border-white/10">
  {/* conteúdo */}
</div>
```

### Card de pilar (ícone centralizado)
```jsx
<div className="text-center">
  <div className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center 
    bg-eleve-orange text-white shadow-btn">
    <Icon className="h-8 w-8" />
  </div>
  <h3 className="text-h4 text-eleve-dark mb-2">Título</h3>
  <p className="text-eleve-gray text-sm">Descrição</p>
</div>
```

---

## 7. Badges e Tags

```jsx
// Orange
<span className="bg-eleve-orange/10 text-eleve-orange text-xs font-semibold px-3 py-1 rounded-full">
  Destaque
</span>

// Teal
<span className="bg-eleve-teal/10 text-eleve-teal-dark text-xs font-semibold px-3 py-1 rounded-full">
  Novidade
</span>

// Purple (accent — uso restrito)
<span className="bg-eleve-purple/10 text-eleve-purple text-xs font-semibold px-3 py-1 rounded-full">
  Especial
</span>
```

---

## 8. Padrões de Seção

```jsx
// Clara (padrão)
<section className="py-24 bg-white">

// Alternada
<section className="py-24 bg-eleve-light">

// Escura — Manifesto, CTA final
<section className="py-24 bg-eleve-dark text-white">
```

### Título de seção padrão
```jsx
// Destaque em laranja
<h2 className="text-h2 text-eleve-dark mb-4 tracking-tight">
  Por que <span className="text-eleve-orange">existimos</span>
</h2>

// Destaque com gradiente de texto
<h2 className="text-h2 text-eleve-dark mb-4">
  Uma educação <span className="text-gradient-main">além do comum</span>
</h2>
```

---

## 9. Identidade e Tom (contexto para IA)

- **Missão:** Transformar o mundo através do impacto em cada criança
- **Pilares:** Propósito · Integridade · Respeito · Mordomia
- **Tom:** Acolhedor, inspirador, base cristã — nunca corporativo frio
- **Público:** Famílias cristãs, pais engajados, educadores
- **Segmentos:** Educação Infantil, Fundamental I e II, Ensino Médio
- **Unidades:** Ribeirão Preto (SP) e Brasília (DF)

---

## 10. Checklist para o Claude ao gerar páginas

- [ ] Fonte: `font-sans` (Neue Montreal → DM Sans → Inter)
- [ ] Cores: apenas tokens `eleve-*` da paleta
- [ ] Botões: `rounded-full` + `hover:scale-105` + cor sólida — **SEM gradiente**
- [ ] Purple: **SOMENTE** em gradientes de texto e ícones decorativos
- [ ] Títulos: `text-eleve-dark` (#2D2D2D) — corpo: `text-eleve-gray` (#848484)
- [ ] CTA principal: `bg-eleve-orange` — CTA secundário: `eleve-teal`
- [ ] Cards: `rounded-2xl` + `shadow-card` + `hover:-translate-y-2`
- [ ] Gradientes: **NUNCA** em botões ou fundos — só em texto com `bg-clip-text`
- [ ] Seções: alternar `bg-white` e `bg-eleve-light` — escuro só para Manifesto/CTA final
- [ ] Animações: `framer-motion` com `whileInView` para entrada de elementos
- [ ] Tom: acolhedor, cristão, inspirador — nunca genérico ou corporativo
