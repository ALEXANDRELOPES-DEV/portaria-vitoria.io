// 1. BLOQUEIO DE SEGURANÇA E VALIDAÇÃO DE LOGIN
(function() {
    const logado = localStorage.getItem('vitoria_logado');
    const activeGuard = localStorage.getItem('vitoria_active_guard');
    
    if (logado !== 'true' || !activeGuard) {
        window.location.href = "login.html";
    }
})();

// --- CONFIGURAÇÕES E UTILIDADES ---
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
    return isNaN(d) ? '—' : d.toLocaleString('pt-BR').slice(0, 16);
};

const toast = (msg) => {
    const t = $('#toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 3000);
};

// --- LISTA DE CATEGORIAS DE SERVIÇO ---
const CATEGORIAS_SERVICO = [
    "Entrega de mercadorias", "Coleta de material", "Entrega de documentos",
    "Serviços de correio e courier (Sedex, DHL, FedEx)",
    "Entrega de suprimentos internos (papelaria, limpeza, manutenção)",
    "Devolução de produtos", "Visita ao administrativo",
    "Fornecedores de insumos (matéria-prima, embalagens, equipamentos)",
    "Representantes comerciais", "Auditores externos", "Clientes em visita técnica",
    "Prestadores de serviço terceirizados (TI, manutenção, segurança)",
    "Reparo de internet e rede", "Manutenção elétrica", "Serviços hidráulicos",
    "Instalação de equipamentos industriais", "Suporte de informática",
    "Serviços de climatização (ar-condicionado, ventilação)", "Limpeza e higienização",
    "Segurança patrimonial (rondas, vigilância, monitoramento)",
    "Controle de acesso de visitantes (cadastro, crachá, autorização)",
    "Serviços de alimentação (refeitório, coffee break, catering)",
    "Gestão de resíduos (coleta seletiva, descarte de materiais)"
];

// --- ESTADO GLOBAL ---
const defaultGuards = [
    { id: 'admin', name: 'Administrador' },
    { id: 'porteiro_julio', name: 'Julio' },
    { id: 'porteiro_barbosa', name: 'Barbosa' },
    { id: 'porteiro_marcos', name: 'Marcos' },
    { id: 'porteiro_alexandre', name: 'Alexandre' }
];

let savedGuards = store.get('vitoria_guards', []);
// Filtramos a lista para garantir que os removidos não voltem
let guards = [...defaultGuards];
savedGuards.forEach(sg => { if (!guards.find(g => g.id === sg.id)) guards.push(sg); });

let activeGuardId = localStorage.getItem('vitoria_active_guard'); 
let records = store.get('vitoria_records', []);
let editingRecordId = null; 

// --- CONTROLE DE ABAS ---
function initTabs() {
    const tabs = $$('.tab');
    const panels = $$('section[data-panel]');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            panels.forEach(p => {
                p.style.display = p.getAttribute('data-panel') === target ? 'block' : 'none';
            });
        });
    });
}

// --- RENDERIZAÇÃO ---
function renderServiceSelect() {
    const st = $('#serviceType');
    const af = $('#auditServiceFilter');
    if (!st) return;

    st.innerHTML = '<option value="" disabled selected>Selecione o motivo...</option>';
    CATEGORIAS_SERVICO.forEach(s => st.innerHTML += `<option value="${s}">${s}</option>`);

    if (af) {
        af.innerHTML = '<option value="">Todos os serviços</option>';
        CATEGORIAS_SERVICO.forEach(s => af.innerHTML += `<option value="${s}">${s}</option>`);
    }

    const current = guards.find(g => g.id === activeGuardId);
    if($('#activeGuardBadge')) $('#activeGuardBadge').textContent = `Conectado: ${current ? current.name : 'Sistema'}`;
}

// --- SALVAMENTO E EDIÇÃO ---
if ($('#formRecord')) {
    $('#formRecord').addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
            name: $('#name').value,
            plate: $('#plate').value.toUpperCase(),
            inTime: $('#inTime').value,
            outTime: $('#outTime').value,
            service: $('#serviceType').value,
            guardId: activeGuardId
        };

        if (editingRecordId) {
            const index = records.findIndex(r => r.id === editingRecordId);
            records[index] = { ...records[index], ...data, id: editingRecordId };
            toast('Registro atualizado!');
            editingRecordId = null;
        } else {
            records.push({ id: crypto.randomUUID(), ...data });
            toast('Salvo com sucesso!');
        }

        store.set('vitoria_records', records);
        renderRecent(); 
        e.target.reset();
        renderServiceSelect();
    });
}

window.prepareEdit = (id) => {
    const r = records.find(rec => rec.id === id);
    if (!r) return;
    editingRecordId = id;
    $('#name').value = r.name;
    $('#plate').value = r.plate;
    $('#inTime').value = r.inTime || '';
    $('#outTime').value = r.outTime || '';
    $('#serviceType').value = r.service || '';
    $('.tab[data-tab="registro"]').click();
    toast("Modo de edição ativado");
};

function renderRecent() {
    const tbody = $('#recentTable');
    if (!tbody) return;
    tbody.innerHTML = '';
    [...records].reverse().slice(0, 10).forEach(r => {
        tbody.innerHTML += `
            <tr onclick="prepareEdit('${r.id}')" style="cursor:pointer">
                <td>${r.name}</td><td>${r.plate}</td>
                <td>${fmtDateTime(r.inTime)}</td><td>${fmtDateTime(r.outTime)}</td>
                <td style="color: #d4af37; font-size: 0.8rem;">${r.service || '—'}</td>
            </tr>`;
    });
    if($('#countBadge')) $('#countBadge').textContent = `${records.length} registros`;
}

// --- AUDITORIA E FILTROS ---
function filtrarAuditoria() {
    const fServico = $('#auditServiceFilter')?.value;
    const fInicio = $('#auditStart')?.value; 
    const fFim = $('#auditEnd')?.value;     
    const resultados = records.filter(r => {
        const matchServico = !fServico || r.service === fServico;
        const dataReg = r.inTime ? r.inTime.split('T')[0] : "";
        return matchServico && (!fInicio || dataReg >= fInicio) && (!fFim || dataReg <= fFim);
    });
    renderTabelaAuditoria(resultados);
}

function renderTabelaAuditoria(dados) {
    const tbody = $('#auditTableBody'); 
    if (!tbody) return;
    tbody.innerHTML = dados.length === 0 ? '<tr><td colspan="6" style="text-align:center">Nenhum registro encontrado</td></tr>' : '';
    dados.forEach(r => {
        const gName = guards.find(g => g.id === r.guardId)?.name || 'Removido';
        tbody.innerHTML += `
            <tr>
                <td>${r.name}</td><td>${r.plate}</td>
                <td>${fmtDateTime(r.inTime)}</td><td>${fmtDateTime(r.outTime)}</td>
                <td>${r.service || '—'}</td><td>${gName}</td>
            </tr>`;
    });
}

// --- FUNÇÃO DE IMPRESSÃO ---
function imprimirRelatorio() {
    const tabelaHTML = $('#auditTableBody').innerHTML;
    if (!tabelaHTML || tabelaHTML.includes('Nenhum registro encontrado')) {
        return toast("Filtre os dados antes de imprimir!");
    }

    const win = window.open('', '', 'height=700,width=900');
    win.document.write(`
        <html><head><title>Relatório VITÓRIA</title>
        <style>
            body { font-family: sans-serif; color: #000; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; font-size: 12px; }
            h2 { text-align: center; }
        </style></head>
        <body>
            <h2>VITÓRIA — RELATÓRIO DE PORTARIA</h2>
            <p>Extraído em: ${new Date().toLocaleString()}</p>
            <table>
                <thead><tr><th>Nome</th><th>Placa</th><th>Entrada</th><th>Saída</th><th>Serviço</th><th>Porteiro</th></tr></thead>
                <tbody>${tabelaHTML}</tbody>
            </table>
        </body></html>
    `);
    win.document.close();
    win.print();
}

// --- EQUIPE E ADMIN (REMOÇÃO CORRIGIDA) ---
if ($('#formGuard')) {
    $('#formGuard').addEventListener('submit', (e) => {
        e.preventDefault();
        const id = $('#guardId').value.trim();
        const name = $('#guardName').value.trim();
        if (guards.find(g => g.id === id)) return toast("ID já existe!");
        
        const ng = { id, name };
        savedGuards.push(ng);
        guards.push(ng); // Adiciona na lista atual
        
        store.set('vitoria_guards', savedGuards);
        renderGuardsTable();
        e.target.reset();
        toast("Porteiro cadastrado!");
    });
}

window.removerPorteiro = (id) => {
    if (activeGuardId !== 'admin') return toast("Ação negado!");
    if (id === 'admin') return toast("Não é possível remover o administrador!");

    if (confirm(`Deseja remover o porteiro ${id} permanentemente?`)) {
        // Remove da lista persistente
        savedGuards = savedGuards.filter(g => g.id !== id);
        store.set('vitoria_guards', savedGuards);

        // Remove da lista em memória (incluindo padrões)
        guards = guards.filter(g => g.id !== id);
        
        renderGuardsTable();
        toast("Porteiro removido.");
    }
};

function renderGuardsTable() {
    const tbody = $('#guardsTable');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    guards.forEach(g => {
        const isMe = g.id === activeGuardId;
        let btnHTML = '';
        
        // Se eu sou admin, posso remover qualquer um exceto eu mesmo
        if (activeGuardId === 'admin') {
            if (g.id !== 'admin') {
                btnHTML = `<button class="btn btn-outline" 
                            style="color:#e74c3c; border-color:#e74c3c; padding:4px 10px; cursor:pointer" 
                            onclick="removerPorteiro('${g.id}')">Remover</button>`;
            } else {
                btnHTML = `<small style="color:#888">Admin Principal</small>`;
            }
        } else {
            btnHTML = `<span style="color:#2ecc71">● Ativo</span>`;
        }

        tbody.innerHTML += `
            <tr>
                <td style="${isMe ? 'color:#d4af37; font-weight:bold' : ''}">${g.name} ${isMe ? '(Você)' : ''}</td>
                <td>${g.id}</td>
                <td>Ativo</td>
                <td>${btnHTML}</td>
            </tr>`;
    });
}

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    if ($('#btnLogout')) $('#btnLogout').addEventListener('click', () => {
        localStorage.removeItem('vitoria_logado');
        localStorage.removeItem('vitoria_active_guard');
        window.location.href = "login.html";
    });
    if ($('#btnFilter')) $('#btnFilter').addEventListener('click', filtrarAuditoria);
    if ($('#btnExport')) $('#btnExport').addEventListener('click', imprimirRelatorio);
    if ($('#btnClearRecords')) $('#btnClearRecords').addEventListener('click', () => {
        if(confirm("Apagar todos os registros do banco de dados?")) { 
            localStorage.removeItem('vitoria_records'); 
            records = [];
            renderRecent();
            toast("Banco de dados limpo!");
        }
    });

    renderServiceSelect();
    renderRecent();
    renderGuardsTable();
    
    if ($('#formGuard')) $('#formGuard').style.display = activeGuardId === 'admin' ? 'block' : 'none';
});
