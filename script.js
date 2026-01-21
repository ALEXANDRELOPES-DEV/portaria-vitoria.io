// 1. BLOQUEIO DE SEGURANÇA
(function() {
    const logado = localStorage.getItem('vitoria_logado');
    if (logado !== 'true') {
        window.location.href = "login.html";
    }
})();

// Utilidades
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

const store = {
    get(key, fallback) { 
        try { return JSON.parse(localStorage.getItem(key)) ?? fallback } 
        catch { return fallback } 
    },
    set(key, value) { 
        localStorage.setItem(key, JSON.stringify(value)) 
    }
};

const fmtDateTime = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d)) return '—';
    return d.toLocaleString('pt-BR').slice(0, 16);
};

const toast = (msg) => {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2200);
};

// 2. FUNÇÃO SAIR (LOGOUT)
$('#btnLogout').addEventListener('click', () => {
    localStorage.removeItem('vitoria_logado');
    window.location.href = "login.html";
});

// Estado
let guards = store.get('vitoria_guards', []);
let activeGuardId = store.get('vitoria_active_guard', null);
let records = store.get('vitoria_records', []);

// Tabs
$$('#tabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
        $$('#tabs .tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.tab;
        $$('section.card').forEach(sec => {
            sec.style.display = (sec.dataset.panel === target) ? '' : 'none';
        });

        if (target === 'auditoria') {
            filtrarAuditoria();
        }
    });
});

// Renderização
function renderGuardsSelects() {
    const gs = $('#guardSelect'), af = $('#auditGuardFilter');
    if (!gs || !af) return;

    gs.innerHTML = '<option value="">Selecione um porteiro</option>';
    af.innerHTML = '<option value="">Todos</option>';

    guards.forEach(g => {
        const o = `<option value="${g.id}">${g.name} ${g.id === activeGuardId ? '(Ativo)' : ''}</option>`;
        gs.innerHTML += o;
        af.innerHTML += `<option value="${g.id}">${g.name}</option>`;
    });
    
    const activeGuard = guards.find(g => g.id === activeGuardId);
    $('#activeGuardBadge').textContent = `Porteiro: ${activeGuard ? activeGuard.name : 'não selecionado'}`;
}

function renderGuardsTable() {
    const tbody = $('#guardsTable');
    if (!tbody) return;

    tbody.innerHTML = '';
    guards.forEach(g => {
        tbody.innerHTML += `
          <tr>
            <td>${g.name}</td><td>${g.code || '—'}</td>
            <td>${g.id === activeGuardId ? '<span class="badge">Ativo</span>' : ''}</td>
            <td><button class="btn btn-outline" onclick="setGuardActive('${g.id}')">Ativar</button></td>
          </tr>`;
    });
}

window.setGuardActive = (id) => {
    activeGuardId = id;
    store.set('vitoria_active_guard', id);
    renderGuardsSelects(); 
    renderGuardsTable();
    toast('Porteiro ativo alterado.');
};

function renderRecent() {
    const tbody = $('#recentTable');
    if (!tbody) return;

    tbody.innerHTML = '';
    [...records].reverse().slice(0, 10).forEach(r => {
        const gName = guards.find(g => g.id === r.guardId)?.name || '—';
        tbody.innerHTML += `<tr><td>${r.name}</td><td>${r.plate}</td><td>${fmtDateTime(r.inTime)}</td><td>${fmtDateTime(r.outTime)}</td><td>${gName}</td></tr>`;
    });
    $('#countBadge').textContent = `${records.length} registros`;
}

// --- FUNÇÕES DE AUDITORIA ---
function filtrarAuditoria() {
    const fPorteiro = $('#auditGuardFilter')?.value;
    const fInicio = $('#auditStart')?.value; 
    const fFim = $('#auditEnd')?.value;     

    const resultados = records.filter(r => {
        const matchPorteiro = !fPorteiro || r.guardId === fPorteiro;
        const dataReg = r.inTime.split('T')[0];
        const matchInicio = !fInicio || dataReg >= fInicio;
        const matchFim = !fFim || dataReg <= fFim;
        return matchPorteiro && matchInicio && matchFim;
    });

    renderTabelaAuditoria(resultados);
}

function renderTabelaAuditoria(dados) {
    const tbody = $('#auditTableBody'); 
    if (!tbody) return;
    tbody.innerHTML = '';
    
    if (dados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 20px;">Nenhum registro encontrado.</td></tr>';
        return;
    }

    dados.forEach(r => {
        const gName = guards.find(g => g.id === r.guardId)?.name || '—';
        tbody.innerHTML += `
            <tr>
                <td>${r.name}</td>
                <td>${r.plate}</td>
                <td>${fmtDateTime(r.inTime)}</td>
                <td>${fmtDateTime(r.outTime)}</td>
                <td>${gName}</td>
            </tr>`;
    });
}

if ($('#btnFilter')) {
    $('#btnFilter').addEventListener('click', filtrarAuditoria);
}

// --- SALVAMENTO LOCAL DE REGISTROS ---
$('#formRecord').addEventListener('submit', (e) => {
    e.preventDefault();
    const guardId = $('#guardSelect').value || activeGuardId;
    if (!guardId) return toast('Selecione um porteiro!');

    const rec = {
        id: crypto.randomUUID(),
        name: $('#name').value,
        plate: $('#plate').value.toUpperCase(),
        inTime: $('#inTime').value,
        outTime: $('#outTime').value,
        guardId
    };

    records.push(rec);
    store.set('vitoria_records', records);
    renderRecent(); 
    e.target.reset();
    toast('Salvo com sucesso!');
});

// --- SALVAMENTO LOCAL DE PORTEIROS ---
$('#formGuard').addEventListener('submit', (e) => {
    e.preventDefault();
    const g = { 
        id: crypto.randomUUID(), 
        name: $('#guardName').value, 
        code: $('#guardId').value 
    };

    guards.push(g);
    store.set('vitoria_guards', guards);
    renderGuardsSelects(); 
    renderGuardsTable();
    e.target.reset();
    toast('Porteiro cadastrado.');
});

// --- FUNÇÃO PARA GERAR PDF (CORRIGIDA PARA IMPRIMIR APENAS DADOS) ---
if ($('#btnExport')) {
    $('#btnExport').addEventListener('click', () => {
        const rows = $('#auditTableBody').querySelectorAll('tr');
        if (rows.length === 0 || rows[0].innerText.includes("Nenhum registro")) {
            return toast("Não há dados para exportar.");
        }

        const win = window.open('', '_blank');
        win.document.write(`
            <html>
            <head>
                <title>Relatório de Portaria - VITÓRIA</title>
                <style>
                    body { font-family: sans-serif; padding: 20px; color: #333; }
                    h2 { text-align: center; color: #000; border-bottom: 2px solid #D4AF37; padding-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #ccc; padding: 10px; text-align: left; font-size: 12px; }
                    th { background-color: #f2f2f2; }
                    .footer { margin-top: 30px; font-size: 10px; text-align: center; color: #777; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                <h2>VITÓRIA IMPORTAÇÃO E EXPORTAÇÃO</h2>
                <p><strong>Relatório de Movimentação de Veículos</strong></p>
                <p>Data de emissão: ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}</p>
                <table>
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Placa</th>
                            <th>Entrada</th>
                            <th>Saída</th>
                            <th>Porteiro</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${$('#auditTableBody').innerHTML}
                    </tbody>
                </table>
                <div class="footer">Sistema de Portaria Digital - Vitória</div>
                <script>
                    window.onload = function() { window.print(); window.close(); };
                </script>
            </body>
            </html>
        `);
        win.document.close();
    });
}

// Inicialização
if (guards.length === 0) {
    guards = [{ id: '1', name: 'Administrador', code: 'ADM' }];
    activeGuardId = '1';
    store.set('vitoria_guards', guards);
    store.set('vitoria_active_guard', '1');
}

// --- FUNÇÃO PARA APAGAR REGISTROS ---
if ($('#btnClearRecords')) {
    $('#btnClearRecords').addEventListener('click', () => {
        const confirmar = confirm("Tem certeza que deseja APAGAR TODOS os registros?");
        if (confirmar) {
            records = []; 
            store.set('vitoria_records', []); 
            renderRecent();
            filtrarAuditoria();
            toast('Registros apagados!');
        }
    });
}

renderGuardsSelects(); 
renderGuardsTable(); 
renderRecent();
