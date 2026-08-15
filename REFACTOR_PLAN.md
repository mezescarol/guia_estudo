# Plano de Refatoração - cavaquinho.html

## Visão Geral
O código atual tem ~1900 linhas de JavaScript num único arquivo. Há oportunidades significativas para melhorar a manutenibilidade, reutilização de código e clareza.

---

## 1. PROBLEMA: Duplicação de Constantes

**Linhas afetadas:** 998-999, 1019-1020, 1191-1192

```javascript
// Atual: NOTES/FREQS/SHARP repetidas em 3 lugares diferentes
var NOTES = ['Dó','Dó#','Ré',...];
var FREQS = [130.81, 138.59, 146.83,...];
var SHARP = [false,true,false,...];

// E depois:
var MONTAR_LABELS = ['Dó','Dó#','Ré',...];  // Duplicado!
var MONTAR_IS_BLACK = [false,true,false,...]; // Duplicado!

var STRIP_NOTES = ['Dó','Dó#','Ré',...];  // Duplicado novamente!
var STRIP_FREQS = [130.81, 138.59,...];   // Duplicado!
var STRIP_SHARP = [false,true,...];       // Duplicado!
```

**Solução proposta:**
```javascript
// Criar uma estrutura única
var NOTE_DATA = [
  { name: 'Dó',   freq: 130.81, isSharp: false },
  { name: 'Dó#',  freq: 138.59, isSharp: true },
  { name: 'Ré',   freq: 146.83, isSharp: false },
  // ... resto
];

// Depois derivar as antigas (para compatibilidade)
var NOTES = NOTE_DATA.map(function(n) { return n.name; });
var FREQS = NOTE_DATA.map(function(n) { return n.freq; });
var SHARP = NOTE_DATA.map(function(n) { return n.isSharp; });
```

**Benefício:** Única fonte de verdade, menos chance de inconsistências.

---

## 2. PROBLEMA: 4 Funções de SVG com Lógica Semelhante

**Linhas afetadas:**
- `buildSvg()` (linha 1539)
- `buildMontarPianoSvg()` (linha 1107)
- `buildChordHighlightPianoSvg()` (linha 1361)
- `buildShapeSvg()` (linha 1685) - IIFE interna

Todas fazem o mesmo:
1. Calcular whiteKeys/blackKeys
2. Renderizar SVG com rects
3. Posicionar labels

**Solução proposta:**
```javascript
var SvgBuilder = {
  // Construir piano genérico
  buildPiano: function(config) {
    // config = { maxIndex, keyWidth, keyHeight, highlighted, labels, type }
    // Retorna SVG string
  },
  
  // Construir diagrama de fret
  buildFretDiagram: function(config) {
    // config = { dots, barreGroups, fretMax, openStrings }
    // Retorna SVG string
  },
  
  // Construir diagrama de forma (simplificado)
  buildShapeOnly: function(config) {
    // config = { dots, barreGroups, lineCount }
    // Retorna SVG string
  }
};
```

**Benefício:** Código DRY, mais fácil de manter, alterações num só lugar.

---

## 3. PROBLEMA: Criação Repetitiva de Botões

**Linhas afetadas:** 1026-1035, 1050-1080, 1306-1309

Padrão repetido:
```javascript
// Versão 1
MONTAR_LABELS.forEach(function(n, i){
  var b = document.createElement('button');
  b.className = 'root-btn';
  b.textContent = n;
  b.addEventListener('click', function(){ montarRoot = i; /* ... */ });
  montarRootGrid.appendChild(b);
});

// Versão 2
STRIP_NOTES.forEach(function(n, i){
  var b = document.createElement('button');
  b.className = 'note-btn' + (STRIP_SHARP[i] ? ' sharp' : '');
  b.textContent = n;
  b.dataset.i = i;
  b.addEventListener('click', function(){ setCurrent(i); });
  strip.appendChild(b);
});
```

**Solução proposta:**
```javascript
function createButtonGrid(container, items, options) {
  options = options || {};
  var baseClass = options.baseClass || 'btn';
  var getExtra = options.getExtra || function() { return ''; };
  var onClick = options.onClick;
  
  items.forEach(function(item, i) {
    var btn = document.createElement('button');
    btn.className = baseClass + getExtra(i);
    btn.textContent = item;
    if (onClick) btn.addEventListener('click', function() { onClick(i, item); });
    container.appendChild(btn);
  });
}

// Uso:
createButtonGrid(montarRootGrid, MONTAR_LABELS, {
  baseClass: 'root-btn',
  onClick: function(i) { montarRoot = i; /* ... */ }
});
```

**Benefício:** Reduz duplicação, mais fácil manutenção, padrão consistente.

---

## 4. PROBLEMA: Funções Muito Grandes

**Exemplo: `renderFret()` (linhas 1483-1537)** - 54 linhas, faz múltiplas coisas:
1. Calcula posições de dedos
2. Constrói strings de instrução
3. Renderiza SVG
4. Toca áudio

**Solução proposta:**
```javascript
// Dividir em:
function calculateChordFingering(root, quality, forma) {
  // Retorna { dots, barreGroups, info }
  // Apenas lógica de cálculo
}

function generateFingertingCaption(forma, frets, notes) {
  // Retorna { svg, caption, instruction }
  // Apenas geração de UI
}

function renderFret(root, quality, third, fifth) {
  // Orquestra os passos acima
  var fingering = calculateChordFingering(root, quality, forma);
  var ui = generateFingertingCaption(forma, fingering.dots, fingering.notes);
  
  fretWrap.innerHTML = ui.svg;
  fretCaption.innerHTML = ui.caption;
  playChordDots(fingering.dots);
}
```

**Benefício:** Cada função tem uma responsabilidade, mais testável, mais legível.

---

## 5. PROBLEMA: Muitas Variáveis Globais (dentro da IIFE)

**Linhas afetadas:** ~998-1009, 1019-1022, 1191-1201, 1300-1310

```javascript
var acordeQuality = 'major';
var montarRoot = null;
var montarQuality = null;
var current = null;
var resultIndex = null;
var stepDirection = null;
var stepMagnitude = null;
var stepCount = 0;
var root = null;
var quality = null;
var forma = null;
// ... muitas mais
```

**Solução proposta:**
```javascript
var AppState = {
  // Acordes theory
  acorde: { quality: 'major' },
  
  // Montador
  montar: { root: null, quality: null },
  
  // Strip cromático
  strip: {
    current: null,
    resultIndex: null,
    direction: null,
    magnitude: null,
    count: 0
  },
  
  // Construtor
  builder: { root: null, quality: null, forma: null },
  
  // Métodos de update
  setAcordeQuality: function(q) {
    this.acorde.quality = q;
    updateAcordeCard();
  },
  
  setMontarRoot: function(r) {
    this.montar.root = r;
    renderMontarPiano();
    playMontarChordIfReady();
  }
  // ... etc
};
```

**Benefício:** Estrutura centralizada, mais fácil rastrear estado, evita conflitos de nomes.

---

## 6. PROBLEMA: Listeners Repetidas

**Linhas afetadas:** 960-966, 1025-1038, 1041-1082, 1306-1312

```javascript
// Padrão 1: Piano keys simples
document.querySelectorAll('.piano-key').forEach(function(key){
  key.addEventListener('click', function(){
    playStrumNoteAt(parseFloat(key.dataset.freq), getAudioCtx().currentTime);
  });
});

// Padrão 2: String keys (mesmo)
document.querySelectorAll('.string-key').forEach(function(key){
  key.addEventListener('click', function(){
    playStrumNoteAt(parseFloat(key.dataset.freq), getAudioCtx().currentTime);
  });
});

// Padrão 3: Monte piano wrap (mesmo, basicamente)
montarPianoWrap.addEventListener('click', function(e){
  var freq = e.target && e.target.dataset ? e.target.dataset.freq : null;
  if (freq) { playStrumNoteAt(parseFloat(freq), getAudioCtx().currentTime); }
});
```

**Solução proposta:**
```javascript
function attachAudioPlaylisteners(selector) {
  document.addEventListener('click', function(e) {
    var key = e.target.closest(selector);
    if (key && key.dataset.freq) {
      playStrumNoteAt(parseFloat(key.dataset.freq), getAudioCtx().currentTime);
    }
  });
}

// Uso:
attachAudioPlaylisteners('.piano-key');
attachAudioPlaylisteners('.string-key');
// montarPianoWrap já funciona automaticamente
```

**Benefício:** Delegation pattern, menos listeners, código mais limpo.

---

## 7. PROBLEMA: Lógica de Tooltip Repetida

**Linhas afetadas:** 1751-1805

Os tooltips têm lógica de posicionamento e estado muito complexa. Poderia ser encapsulada.

**Solução proposta:**
```javascript
var TooltipManager = {
  init: function() {
    this.setupEventListeners();
  },
  
  setupEventListeners: function() {
    // Toda a lógica de tooltip aqui
  },
  
  positionTooltip: function(trigger) {
    // Cálculos de posição
  },
  
  toggle: function(trigger) {
    // Abrir/fechar
  }
};
```

**Benefício:** Separação de concerns, mais fácil testar/debugar.

---

## 8. PROBLEMA: Duplicação de Lógica de Mod12

```javascript
var mod12 = function(n){ return ((n % 12) + 12) % 12; };  // Linha 1002
// E depois:
function m(n){ return ((n % 12) + 12) % 12; }  // Linha 1717 - DUPLICADO!
```

**Solução:** Usar apenas `mod12()` em todo o lado.

---

## 9. PROBLEMA: Magic Numbers

Valores espalhados pelo código:
- `146.83` (frequência Ré)
- `12` (notas na oitava)
- `0.14` (timing strum)
- `3` (duração som)
- `0.015` (ramp time)

**Solução proposta:**
```javascript
var CONSTANTS = {
  NOTES_PER_OCTAVE: 12,
  FRET_MAX: 12,
  STRUM_TIMING: 0.14,
  SOUND_DURATION: 3.05,
  SOUND_ATTACK: 0.015,
  SOUND_DECAY_VOLUME: 0.0001
};
```

**Benefício:** Fácil ajustar valores, documentação clara.

---

## 10. PROBLEMA: Audio Context Management

**Linhas afetadas:** 907-954

Múltiplas funções lidam com audio context:
- `getAudioCtx()` - resume se needed
- `unlockAudio()` - priming
- `playStrumNoteAt()` - criação de oscillators
- `playStrumSequence()` - sequencing

**Solução proposta:**
```javascript
var AudioEngine = {
  ctx: null,
  
  init: function() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.setupUnlock();
  },
  
  getContext: function() {
    if (this.ctx.state === 'suspended') { this.ctx.resume(); }
    return this.ctx;
  },
  
  playNote: function(freq, startTime, duration) {
    var ctx = this.getContext();
    // Toda a lógica aqui
  },
  
  playChord: function(freqs) {
    // Sequence de notas
  },
  
  setupUnlock: function() {
    // Prime com blip silencioso
  }
};
```

**Benefício:** Encapsulamento, mais fácil de gerenciar lifecycle.

---

## Resumo de Mudanças Propostas

| Problema | Solução | Impacto | Prioridade |
|----------|---------|--------|-----------|
| Duplicação constantes | Estrutura única `NOTE_DATA` | ~20 linhas poupadas | Alta |
| 4 builders SVG | `SvgBuilder` module | ~150 linhas poupadas | Alta |
| Criação botões repetida | `createButtonGrid()` | ~80 linhas poupadas | Alta |
| Funções gigantes | Dividir `renderFret()` | Legibilidade | Média |
| Variáveis globais | `AppState` object | Manutenção | Média |
| Listeners repetidas | Delegation + helper | ~30 linhas poupadas | Baixa |
| Audio management | `AudioEngine` module | Testabilidade | Média |
| Tooltips | `TooltipManager` | ~60 linhas, separação | Média |

---

## Impacto Total Estimado
- **Linhas reduzidas:** ~350-450 (18-24%)
- **Complexidade ciclomática:** Redução ~30%
- **Manutenibilidade:** Significativamente melhorada
- **Breaking changes:** Nenhuma (refactor interno)

---

## Próximos Passos (se decidir refatorar)

1. Começar pela **prioridade Alta** (constantes + builders + botões)
2. Testar que tudo ainda funciona após cada mudança
3. Depois refactor **prioridade Média** (estrutura, audio, tooltips)
4. Adicionar comentários e documentação
5. Considerar migração futura para módulos/TypeScript
