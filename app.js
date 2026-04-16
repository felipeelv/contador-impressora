const SUPABASE_URL  = 'https://kmnosfjpxpsmtjqgwoih.supabase.co';
const SUPABASE_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imttbm9zZmpweHBzbXRqcWd3b2loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNzEzNDYsImV4cCI6MjA4ODc0NzM0Nn0.qiB-divCLL4sTWO_XJacQXLBFHVOrt39AU_5s7a7b7w';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

let extratos = [];
let conteudosDB = {};
let turmasDB = [];

const kpiTotalFolhas      = document.getElementById('kpi-total-folhas');
const kpiTopDisciplina    = document.getElementById('kpi-top-disciplina');
const kpiMesAtual         = document.getElementById('kpi-mes-atual');
const kpiMesLabel         = document.getElementById('kpi-mes-label');
const kpiTotalRegistros   = document.getElementById('kpi-total-registros');
const tableBody           = document.getElementById('history-table-body');
const searchInput         = document.getElementById('search-input');
const filterBimestre      = document.getElementById('filter-bimestre');
const filterTurma         = document.getElementById('filter-turma');
const modal               = document.getElementById('entry-modal');
const entryForm           = document.getElementById('entry-form');

const selectDisciplina    = document.getElementById('disciplina');
const selectTurma         = document.getElementById('turma');
const selectBimestre      = document.getElementById('bimestre');
const selectUnidade       = document.getElementById('unidade');
const selectTipo          = document.getElementById('tipo');
const selectImpressora    = document.getElementById('impressora');
const inputPaginas        = document.getElementById('paginas_por_aluno');
const inputFolhasCalc     = document.getElementById('folhas_calculadas');
const displayTotalFolhas  = document.getElementById('total-folhas-calc');

document.addEventListener('DOMContentLoaded', async () => {
    await loadConteudos();
    await loadTurmas();
    await loadExtratos();
    populateTurmaFilter();
    updateDashboard();
    renderTable();
    renderReports();
});

async function loadExtratos() {
    const { data, error } = await db
        .from('impressoes')
        .select('*')
        .order('data', { ascending: false });

    if (error) {
        console.error('Erro ao carregar impressões:', error);
        return;
    }

    // Normaliza os campos do banco para o formato usado no frontend
    extratos = (data || []).map(row => ({
        id:           row.id,
        data:         row.data,
        disciplina:   row.disciplina,
        serie:        row.serie,
        turma:        row.turma,
        bimestre:     row.bimestre,
        unidade:      row.unidade,
        tipo:         row.tipo,
        impressora:   row.impressora,
        paginas:      row.paginas,
        totalPaginas: row.total_paginas,
        folhas:       row.folhas,
    }));
}

async function loadTurmas() {
    try {
        const response = await fetch('alunos_por_turma.json');
        const data = await response.json();
        turmasDB = data.turmas || [];
    } catch (e) {
        console.error("Erro ao carregar turmas:", e);
    }
}

async function loadConteudos() {
    try {
        const response = await fetch('conteudos.json');
        conteudosDB = await response.json();

        // Popular disciplinas para o modal
        selectDisciplina.innerHTML = '<option value="">Selecione a Disciplina</option>';
        Object.keys(conteudosDB).sort().forEach(disc => {
            const opt = document.createElement('option');
            opt.value = disc;
            opt.textContent = disc;
            selectDisciplina.appendChild(opt);
        });

        // Popular disciplinas para o relatório
        const reportDisc = document.getElementById('report-disciplina');
        if (reportDisc) {
            Object.keys(conteudosDB).sort().forEach(disc => {
                const opt = document.createElement('option');
                opt.value = disc;
                opt.textContent = disc;
                reportDisc.appendChild(opt);
            });
        }
    } catch (e) {
        console.error("Erro ao carregar conteudos.json:", e);
    }
}

function getSerieFromTurma(disc, turmaName) {
    if (!disc || !turmaName || !conteudosDB[disc]) return null;
    const normalizedTurma = turmaName.toLowerCase().replace(/º/g, '').replace(/ª/g, '').replace(/°/g, '').trim();
    for (let serie of Object.keys(conteudosDB[disc])) {
        const normalizedSerie = serie.toLowerCase().replace(/º/g, '').replace(/ª/g, '').replace(/°/g, '').trim();
        if (normalizedTurma.includes(normalizedSerie)) {
            return serie;
        }
    }
    return null;
}

function populateTurmas() {
    const disc = selectDisciplina.value;
    selectTurma.innerHTML = '<option value="">Selecione a Turma</option>';
    selectBimestre.innerHTML = '<option value="">Selecione o Bimestre</option>';
    selectUnidade.innerHTML = '<option value="">Selecione a Unidade</option>';
    calculateTotal();

    if (!disc || !conteudosDB[disc]) return;

    turmasDB.forEach(t => {
        if (getSerieFromTurma(disc, t.turma)) {
            const opt = document.createElement('option');
            opt.value = t.turma;
            opt.dataset.alunos = t.alunos;
            opt.textContent = `${t.turma} (${t.alunos} alunos)`;
            selectTurma.appendChild(opt);
        }
    });
}

function calculateTotal() {
    const option = selectTurma.options[selectTurma.selectedIndex];
    const alunos = option && option.dataset.alunos ? parseInt(option.dataset.alunos) : 0;
    const paginas = parseInt(inputPaginas.value) || 0;

    const totalPaginas = alunos * paginas;
    const folhasPorAluno = Math.ceil(paginas / 2);
    const totalFolhas = alunos * folhasPorAluno;

    document.getElementById('paginas_calculadas').value = totalPaginas;
    inputFolhasCalc.value = totalFolhas;
}

function populateBimestres() {
    const disc = selectDisciplina.value;
    const turma = selectTurma.value;
    selectBimestre.innerHTML = '<option value="">Selecione o Bimestre</option>';
    selectUnidade.innerHTML = '<option value="">Selecione a Unidade</option>';

    const serie = getSerieFromTurma(disc, turma);
    if (!disc || !serie || !conteudosDB[disc][serie]) return;

    Object.keys(conteudosDB[disc][serie]).sort().forEach(bim => {
        const opt = document.createElement('option');
        opt.value = bim;
        opt.textContent = bim + 'º Bimestre';
        selectBimestre.appendChild(opt);
    });
}

function populateUnidades() {
    const disc = selectDisciplina.value;
    const turma = selectTurma.value;
    const bim = selectBimestre.value;
    selectUnidade.innerHTML = '<option value="">Selecione a Unidade</option>';

    const serie = getSerieFromTurma(disc, turma);
    if (!disc || !serie || !bim || !conteudosDB[disc][serie][bim]) return;

    Object.keys(conteudosDB[disc][serie][bim]).forEach(unid => {
        const opt = document.createElement('option');
        opt.value = unid;
        opt.textContent = unid;
        selectUnidade.appendChild(opt);
    });
}

function getFilteredData() {
    const bimestre = filterBimestre.value;
    const turma    = filterTurma.value;

    return extratos.filter(item => {
        const matchBimestre = !bimestre || item.bimestre === bimestre;
        const matchTurma    = !turma    || item.turma === turma;
        return matchBimestre && matchTurma;
    });
}

function renderReports() {
    const container = document.getElementById('reports-container');
    if (!container) return;

    const baseData = getFilteredData();
    const filterDisc = document.getElementById('report-disciplina').value;

    const data = filterDisc ? baseData.filter(item => item.disciplina === filterDisc) : baseData;

    const agrupado = {};
    data.forEach(item => {
        const key = `${item.disciplina} | ${item.unidade}`;
        if (!agrupado[key]) {
            agrupado[key] = {
                disciplina: item.disciplina,
                unidade: item.unidade,
                paginas: 0,
                folhas: 0
            };
        }
        agrupado[key].paginas += parseInt(item.totalPaginas || item.folhas || 0);
        agrupado[key].folhas += parseInt(item.folhas || 0);
    });

    const chavesOrdenadas = Object.keys(agrupado).sort();

    container.innerHTML = '';

    if (chavesOrdenadas.length === 0) {
        container.innerHTML = `<p class="text-sm text-eleve-gray col-span-full">Nenhum dado encontrado para os filtros atuais.</p>`;
        return;
    }

    chavesOrdenadas.forEach(key => {
        const grupo = agrupado[key];
        const card = document.createElement('div');
        card.className = "border border-eleve-gray-light rounded-lg p-4 bg-eleve-light/30 hover:bg-white hover:shadow-card transition-all";
        card.innerHTML = `
            <p class="text-xs font-semibold text-eleve-orange mb-1 uppercase tracking-wide">${grupo.disciplina}</p>
            <h4 class="text-sm font-bold text-eleve-dark mb-3 truncate" title="${grupo.unidade}">${grupo.unidade}</h4>
            <div class="flex justify-between items-end border-t border-eleve-gray-light pt-3">
                <div>
                    <p class="text-[10px] text-eleve-gray uppercase tracking-wider mb-0.5 font-semibold">Total Páginas</p>
                    <p class="text-lg font-bold text-eleve-teal-dark">${grupo.paginas.toLocaleString('pt-BR')}</p>
                </div>
                <div class="text-right">
                    <p class="text-[10px] text-eleve-gray uppercase tracking-wider mb-0.5 font-semibold">Folhas</p>
                    <p class="text-sm font-medium text-eleve-gray-dark">${grupo.folhas.toLocaleString('pt-BR')}</p>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

const PAGE_META = {
    dashboard: { title: 'Dashboard',           subtitle: 'Acompanhe os gastos em materiais didáticos' },
    history:   { title: 'Histórico',            subtitle: 'Todos os lançamentos registrados' },
    reports:   { title: 'Controle de Unidades', subtitle: 'Acompanhe o consumo por série e unidade' },
    fluxo:     { title: 'Fluxo Mensal',         subtitle: 'Volume de impressões por mês e impressora' },
};

const ALL_SECTIONS = ['history', 'reports', 'fluxo'];
const NAV_MAP = {
    dashboard: 'nav-dashboard',
    history:   'nav-historico',
    reports:   'nav-reports',
    fluxo:     'nav-fluxo',
};

const MOB_NAV_MAP = {
    dashboard: 'mob-nav-dashboard',
    history:   'mob-nav-historico',
    reports:   'mob-nav-reports',
    fluxo:     'mob-nav-fluxo',
};

const SECTION_VISIBILITY = {
    dashboard: { show: ['history'],  hide: ['reports', 'fluxo'] },
    history:   { show: ['history'],  hide: ['reports', 'fluxo'] },
    reports:   { show: ['reports'],  hide: ['history',  'fluxo'] },
    fluxo:     { show: ['fluxo'],    hide: ['history',  'reports'] },
};

function showSection(sectionId) {
    const meta = PAGE_META[sectionId] || PAGE_META.dashboard;
    document.getElementById('page-title').textContent    = meta.title;
    document.getElementById('page-subtitle').textContent = meta.subtitle;

    const vis = SECTION_VISIBILITY[sectionId] || SECTION_VISIBILITY.dashboard;
    vis.show.forEach(id => { const el = document.getElementById(id); el && el.classList.remove('hidden'); });
    vis.hide.forEach(id => { const el = document.getElementById(id); el && el.classList.add('hidden'); });

    Object.values(NAV_MAP).forEach(navId => {
        const el = document.getElementById(navId);
        if (!el) return;
        el.classList.remove('bg-eleve-teal/10', 'text-eleve-teal-dark', 'font-semibold');
        el.classList.add('text-eleve-gray', 'font-medium');
    });
    const activeEl = document.getElementById(NAV_MAP[sectionId]);
    if (activeEl) {
        activeEl.classList.add('bg-eleve-teal/10', 'text-eleve-teal-dark', 'font-semibold');
        activeEl.classList.remove('text-eleve-gray', 'font-medium');
    }

    // Atualiza bottom nav mobile
    Object.values(MOB_NAV_MAP).forEach(navId => {
        const el = document.getElementById(navId);
        if (!el) return;
        el.classList.remove('text-eleve-teal-dark');
        el.classList.add('text-eleve-gray');
        el.querySelector('span').className = 'text-[10px] font-medium';
    });
    const activeMobEl = document.getElementById(MOB_NAV_MAP[sectionId]);
    if (activeMobEl) {
        activeMobEl.classList.add('text-eleve-teal-dark');
        activeMobEl.classList.remove('text-eleve-gray');
        activeMobEl.querySelector('span').className = 'text-[10px] font-semibold';
    }

    if (sectionId === 'fluxo') renderFluxo();
}

// ─── Fluxo Mensal ────────────────────────────────────────────────────────────

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function initFluxoAnoFilter() {
    const sel = document.getElementById('fluxo-filter-ano');
    if (!sel) return;
    const anos = [...new Set(extratos.map(item => new Date(item.data).getFullYear()))].sort((a,b) => b-a);
    const anoAtual = new Date().getFullYear();
    if (!anos.includes(anoAtual)) anos.unshift(anoAtual);
    sel.innerHTML = '';
    anos.forEach(a => {
        const opt = document.createElement('option');
        opt.value = a;
        opt.textContent = a;
        if (a === anoAtual) opt.selected = true;
        sel.appendChild(opt);
    });
}

function renderFluxo() {
    initFluxoAnoFilter();

    const ano = parseInt(document.getElementById('fluxo-filter-ano')?.value || new Date().getFullYear());

    const meses = {};
    extratos.forEach(item => {
        const d = new Date(item.data);
        if (d.getFullYear() !== ano) return;
        const m = d.getMonth();
        if (!meses[m]) meses[m] = { colorA: 0, colorB: 0, pb: 0, totalPags: 0, totalFolhas: 0 };
        const pags   = parseInt(item.totalPaginas || item.folhas || 0);
        const folhas = parseInt(item.folhas || 0);
        meses[m].totalPags   += pags;
        meses[m].totalFolhas += folhas;
        if (item.impressora === 'Color A')      meses[m].colorA += pags;
        else if (item.impressora === 'Color B') meses[m].colorB += pags;
        else if (item.impressora === 'PB')      meses[m].pb     += pags;
    });

    const mesesComDados = Object.values(meses);
    const totalAno   = mesesComDados.reduce((s, m) => s + m.totalPags, 0);
    const mediaMes   = mesesComDados.length ? Math.round(totalAno / mesesComDados.length) : 0;
    const maxVal     = Math.max(...mesesComDados.map(m => m.totalPags), 0);
    const picoIdx    = Object.keys(meses).find(k => meses[k].totalPags === maxVal);

    const totalColorA = mesesComDados.reduce((s,m) => s + m.colorA, 0);
    const totalColorB = mesesComDados.reduce((s,m) => s + m.colorB, 0);
    const totalPB     = mesesComDados.reduce((s,m) => s + m.pb, 0);
    const topImpressora = totalColorA >= totalColorB && totalColorA >= totalPB ? 'Color A'
                        : totalColorB >= totalPB ? 'Color B' : 'PB';

    document.getElementById('fluxo-total-ano').textContent  = totalAno.toLocaleString('pt-BR');
    document.getElementById('fluxo-ano-label').textContent  = `acumulado em ${ano}`;
    document.getElementById('fluxo-media').textContent      = mediaMes.toLocaleString('pt-BR');
    document.getElementById('fluxo-pico-mes').textContent   = picoIdx !== undefined ? MESES[parseInt(picoIdx)] : '—';
    document.getElementById('fluxo-pico-val').textContent   = picoIdx !== undefined ? `${maxVal.toLocaleString('pt-BR')} págs` : 'sem dados';
    document.getElementById('fluxo-top-impressora').textContent = totalAno > 0 ? topImpressora : '—';

    const tbody = document.getElementById('fluxo-table-body');
    tbody.innerHTML = '';

    if (mesesComDados.length === 0) {
        tbody.innerHTML = `
          <tr><td colspan="7" class="py-16 text-center">
            <div class="flex flex-col items-center gap-2">
              <div class="w-10 h-10 rounded-full bg-eleve-gray-light flex items-center justify-center text-eleve-gray">
                <i data-feather="inbox" class="w-5 h-5"></i>
              </div>
              <p class="text-sm text-eleve-gray font-medium">Nenhum dado para ${ano}.</p>
            </div>
          </td></tr>`;
        if (window.feather) feather.replace();
        return;
    }

    for (let m = 0; m < 12; m++) {
        if (!meses[m]) continue;
        const d = meses[m];
        const pct = maxVal > 0 ? Math.round((d.totalPags / maxVal) * 100) : 0;
        const isCurrent = m === new Date().getMonth() && ano === new Date().getFullYear();

        const tr = document.createElement('tr');
        tr.className = `border-b border-eleve-gray-light/60 transition-colors ${isCurrent ? 'bg-eleve-teal/5' : 'hover:bg-eleve-light/50'}`;
        tr.innerHTML = `
            <td class="py-4 px-6 font-semibold text-eleve-dark text-sm">
                ${MESES[m]}
                ${isCurrent ? '<span class="ml-2 text-[10px] bg-eleve-teal/10 text-eleve-teal-dark font-bold px-2 py-0.5 rounded-full uppercase">Atual</span>' : ''}
            </td>
            <td class="py-4 px-6 text-sm text-blue-600 font-medium">${d.colorA > 0 ? d.colorA.toLocaleString('pt-BR') : '<span class="text-eleve-gray">—</span>'}</td>
            <td class="py-4 px-6 text-sm text-purple-600 font-medium">${d.colorB > 0 ? d.colorB.toLocaleString('pt-BR') : '<span class="text-eleve-gray">—</span>'}</td>
            <td class="py-4 px-6 text-sm text-gray-500 font-medium">${d.pb > 0 ? d.pb.toLocaleString('pt-BR') : '<span class="text-eleve-gray">—</span>'}</td>
            <td class="py-4 px-6 font-bold text-eleve-orange text-sm">${d.totalPags.toLocaleString('pt-BR')}</td>
            <td class="py-4 px-6 text-sm text-eleve-gray-dark font-medium">${d.totalFolhas.toLocaleString('pt-BR')}</td>
            <td class="py-4 px-6 min-w-[140px]">
                <div class="flex items-center gap-2">
                    <div class="flex-1 bg-eleve-gray-light rounded-full h-2 overflow-hidden">
                        <div class="h-2 rounded-full bg-eleve-orange transition-all duration-500" style="width:${pct}%"></div>
                    </div>
                    <span class="text-xs text-eleve-gray font-medium w-8 text-right">${pct}%</span>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    }

    const trTotal = document.createElement('tr');
    trTotal.className = "bg-eleve-light border-t-2 border-eleve-gray-light";
    const totalFolhasAno = mesesComDados.reduce((s,m) => s + m.totalFolhas, 0);
    trTotal.innerHTML = `
        <td class="py-4 px-6 font-bold text-eleve-dark text-sm uppercase tracking-wide">Total ${ano}</td>
        <td class="py-4 px-6 font-bold text-blue-600 text-sm">${totalColorA > 0 ? totalColorA.toLocaleString('pt-BR') : '—'}</td>
        <td class="py-4 px-6 font-bold text-purple-600 text-sm">${totalColorB > 0 ? totalColorB.toLocaleString('pt-BR') : '—'}</td>
        <td class="py-4 px-6 font-bold text-gray-500 text-sm">${totalPB > 0 ? totalPB.toLocaleString('pt-BR') : '—'}</td>
        <td class="py-4 px-6 font-bold text-eleve-orange text-base">${totalAno.toLocaleString('pt-BR')}</td>
        <td class="py-4 px-6 font-bold text-eleve-dark text-sm">${totalFolhasAno.toLocaleString('pt-BR')}</td>
        <td class="py-4 px-6"></td>
    `;
    tbody.appendChild(trTotal);

    if (window.feather) feather.replace();
}

function applyFilters() {
    updateDashboard();
    renderTable();
    renderReports();
}

function populateTurmaFilter() {
    const turmas = [...new Set(extratos.map(item => item.turma))].sort();
    const currentVal = filterTurma.value;

    filterTurma.innerHTML = '<option value="">Todas</option>';
    turmas.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        if (t === currentVal) opt.selected = true;
        filterTurma.appendChild(opt);
    });
}

function updateDashboard() {
    const data = getFilteredData();

    const totalFolhas = data.reduce((acc, curr) => acc + parseInt(curr.folhas || 0), 0);
    const totalPaginas = data.reduce((acc, curr) => acc + parseInt(curr.totalPaginas || curr.folhas || 0), 0);

    const currentMonth = new Date().getMonth();
    const currentYear  = new Date().getFullYear();
    const mesNome      = new Date().toLocaleDateString('pt-BR', { month: 'long' });

    const dadosNoMes = extratos.filter(item => {
        const d = new Date(item.data);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const folhasNoMes = dadosNoMes.reduce((acc, curr) => acc + parseInt(curr.folhas || 0), 0);
    const paginasNoMes = dadosNoMes.reduce((acc, curr) => acc + parseInt(curr.totalPaginas || curr.folhas || 0), 0);

    let colorA = 0, colorB = 0, pb = 0;
    dadosNoMes.forEach(item => {
        const pgs = parseInt(item.totalPaginas || item.folhas || 0);
        if (item.impressora === 'Color A')      colorA += pgs;
        else if (item.impressora === 'Color B') colorB += pgs;
        else if (item.impressora === 'PB')      pb     += pgs;
    });

    const FRANQUIA = 20000;

    const mesFranquiaEl = document.getElementById('mes-franquia');
    if (mesFranquiaEl) mesFranquiaEl.textContent = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

    updateFranquia('color-a', colorA, FRANQUIA);
    updateFranquia('color-b', colorB, FRANQUIA);
    document.getElementById('kpi-pb').textContent = pb.toLocaleString('pt-BR');

    const disciplinaCount = {};
    data.forEach(item => {
        if (!disciplinaCount[item.disciplina]) disciplinaCount[item.disciplina] = 0;
        disciplinaCount[item.disciplina] += parseInt(item.totalPaginas || item.folhas || 0);
    });

    let topDisciplina = '—';
    let max = 0;
    for (let d in disciplinaCount) {
        if (disciplinaCount[d] > max) {
            max = disciplinaCount[d];
            topDisciplina = d;
        }
    }

    document.getElementById('kpi-total-paginas').textContent = totalPaginas.toLocaleString('pt-BR');
    document.getElementById('kpi-total-folhas-label').textContent = `${totalFolhas.toLocaleString('pt-BR')} folhas acumuladas`;

    document.getElementById('kpi-mes-atual-paginas').textContent = paginasNoMes.toLocaleString('pt-BR');
    document.getElementById('kpi-mes-label').textContent = `${folhasNoMes.toLocaleString('pt-BR')} folhas neste mês`;

    kpiTopDisciplina.textContent  = topDisciplina;
    kpiTotalRegistros.textContent = data.length.toLocaleString('pt-BR');
}

function updateFranquia(key, usado, limite) {
    const pct      = Math.min(Math.round((usado / limite) * 100), 100);
    const restante = Math.max(limite - usado, 0);

    let barColor, badgeClass, badgeText;
    if (pct >= 100) {
        barColor   = 'bg-red-500';
        badgeClass = 'bg-red-100 text-red-600';
        badgeText  = 'Estourado';
    } else if (pct >= 85) {
        barColor   = 'bg-eleve-orange';
        badgeClass = 'bg-eleve-orange/10 text-eleve-orange-dark';
        badgeText  = 'Atenção';
    } else if (pct >= 60) {
        barColor   = 'bg-yellow-400';
        badgeClass = 'bg-yellow-100 text-yellow-700';
        badgeText  = 'Moderado';
    } else {
        barColor   = 'bg-eleve-teal';
        badgeClass = 'bg-eleve-teal/10 text-eleve-teal-dark';
        badgeText  = 'OK';
    }

    document.getElementById(`kpi-${key}`).textContent  = usado.toLocaleString('pt-BR');
    document.getElementById(`pct-${key}`).textContent  = `${pct}% usado`;
    document.getElementById(`rest-${key}`).textContent = `${restante.toLocaleString('pt-BR')} restantes`;

    const bar   = document.getElementById(`bar-${key}`);
    bar.style.width = `${pct}%`;
    bar.className   = `h-3 rounded-full transition-all duration-700 ${barColor}`;

    const badge = document.getElementById(`badge-${key}`);
    badge.textContent = badgeText;
    badge.className   = `text-xs font-bold px-2.5 py-1 rounded-full ${badgeClass}`;
}

function renderTable() {
    const searchTerm = searchInput.value.toLowerCase();
    const base       = getFilteredData();

    const filtered = base.filter(item =>
        item.disciplina.toLowerCase().includes(searchTerm) ||
        (item.turma && item.turma.toLowerCase().includes(searchTerm))
    );

    filtered.sort((a, b) => new Date(b.data) - new Date(a.data));

    tableBody.innerHTML = '';

    if (filtered.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" class="py-16 text-center">
              <div class="flex flex-col items-center gap-2">
                <div class="w-10 h-10 rounded-full bg-eleve-gray-light flex items-center justify-center text-eleve-gray">
                  <i data-feather="inbox" class="w-5 h-5"></i>
                </div>
                <p class="text-sm text-eleve-gray font-medium">Nenhum lançamento encontrado.</p>
              </div>
            </td>
          </tr>`;
        if (window.feather) feather.replace();
        return;
    }

    filtered.forEach(item => {
        const tr        = document.createElement('tr');
        tr.className    = "border-b border-eleve-gray-light/60 hover:bg-eleve-light/50 transition-colors group";
        const dateObj   = new Date(item.data);
        const dateFmt   = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

        tr.innerHTML = `
            <td class="py-3.5 px-6 text-sm text-eleve-gray">${dateFmt}</td>
            <td class="py-3.5 px-6 text-sm font-semibold text-eleve-dark">
                ${item.disciplina}
                <div class="flex items-center gap-2 mt-0.5">
                    <span class="text-[10px] text-eleve-gray font-normal">${item.tipo || 'Conteúdo'}</span>
                    ${item.impressora ? `<span class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-eleve-gray-light/60 text-eleve-gray-dark">${item.impressora}</span>` : ''}
                </div>
            </td>
            <td class="py-3.5 px-6 text-sm text-eleve-gray truncate max-w-[150px]" title="${item.turma || item.serie}">
                ${item.turma || item.serie}
            </td>
            <td class="py-3.5 px-6">
                <span class="bg-eleve-teal/10 text-eleve-teal-dark text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap">
                    ${item.bimestre}º Bim · ${item.unidade}
                </span>
            </td>
            <td class="py-3.5 px-6">
                <div class="font-bold text-eleve-orange">${parseInt(item.totalPaginas || item.folhas || 0).toLocaleString('pt-BR')} págs</div>
                <div class="text-[10px] text-eleve-gray font-normal">(${parseInt(item.folhas || 0).toLocaleString('pt-BR')} folhas)</div>
            </td>
            <td class="py-3.5 px-6 text-right">
                <button class="w-8 h-8 inline-flex items-center justify-center rounded-full text-eleve-gray hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" onclick="deleteEntry('${item.id}')" title="Excluir Registro">
                    <i data-feather="trash-2" class="w-4 h-4"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });

    if (window.feather) feather.replace();
}

function openModal() {
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('data-lancamento').value = hoje;
    modal.classList.add('active');
}

function closeModal() {
    modal.classList.remove('active');
    entryForm.reset();
    calculateTotal();
}

async function handleFormSubmit(event) {
    event.preventDefault();

    const totalFolhas = parseInt(inputFolhasCalc.value) || 0;
    const totalPaginas = parseInt(document.getElementById('paginas_calculadas').value) || 0;

    if (totalFolhas <= 0) {
        alert("Preencha a turma e as páginas corretamente para calcular o total de folhas.");
        return;
    }

    const disc = selectDisciplina.value.trim();
    const turma = selectTurma.value.trim();
    const serieDerivada = getSerieFromTurma(disc, turma) || turma;
    const dataEscolhida = document.getElementById('data-lancamento').value;

    const novoRegistro = {
        data:          dataEscolhida ? new Date(dataEscolhida + 'T12:00:00').toISOString() : new Date().toISOString(),
        disciplina:    disc,
        serie:         serieDerivada,
        turma:         turma,
        bimestre:      selectBimestre.value,
        unidade:       selectUnidade.value.trim(),
        tipo:          selectTipo.value,
        impressora:    selectImpressora.value,
        paginas:       inputPaginas.value,
        total_paginas: totalPaginas,
        folhas:        totalFolhas,
    };

    const { data, error } = await db
        .from('impressoes')
        .insert(novoRegistro)
        .select()
        .single();

    if (error) {
        console.error('Erro ao salvar:', error);
        alert('Erro ao salvar o registro. Tente novamente.');
        return;
    }

    // Adiciona ao array local no formato do frontend
    extratos.unshift({
        id:           data.id,
        data:         data.data,
        disciplina:   data.disciplina,
        serie:        data.serie,
        turma:        data.turma,
        bimestre:     data.bimestre,
        unidade:      data.unidade,
        tipo:         data.tipo,
        impressora:   data.impressora,
        paginas:      data.paginas,
        totalPaginas: data.total_paginas,
        folhas:       data.folhas,
    });

    populateTurmaFilter();
    closeModal();
    updateDashboard();
    renderTable();
    renderReports();
}

async function deleteEntry(id) {
    if (confirm('Tem certeza que deseja excluir este registro de impressão?')) {
        const { error } = await db
            .from('impressoes')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Erro ao excluir:', error);
            alert('Erro ao excluir o registro. Tente novamente.');
            return;
        }

        extratos = extratos.filter(item => item.id !== id);
        populateTurmaFilter();
        updateDashboard();
        renderTable();
        renderReports();
    }
}
