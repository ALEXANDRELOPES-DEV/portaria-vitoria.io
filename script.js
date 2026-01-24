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

// --- CONSULTA EXTERNA DE PLACA ---
window.consultarPlaca = () => {
    const placa = $('#plate').value.trim();
    if (!placa) return toast("Digite a placa primeiro!");
    
    const placaLimpa = placa.replace('-', '').toUpperCase();
    const url = `https://buscaplacas.com.br/resultado.php?ref=nwgpa12&placa=${placaLimpa}`;
    window.open(url, '_blank');
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
let guards = [...defaultGuards];
savedGuards.forEach(sg => { if (!guards.find(g => g.id === sg.id)) guards.push(sg); });

let activeGuardId = localStorage.getItem('vitoria_active_guard'); 
let records = store.get('vitoria_records', []);
let authorizedVehicles = store.get('vitoria_authorized', []); 
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
            if(target === 'autorizados') renderAuthorizedTable();
        });
    });
}

// --- RENDERIZAÇÃO DE SERVIÇOS ---
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

// --- FUNÇÃO DE AUTO-PREENCHIMENTO (PLACA RECONHECIDA) ---
function setupAutocomplete() {
    const plateInput = $('#plate');
    const nameInput = $('#name');
    const serviceSelect = $('#serviceType');

    if (!plateInput) return;

    plateInput.addEventListener('input', (e) => {
        const val = e.target.value.toUpperCase().replace('-', '').trim();
        
        if (val.length >= 7) {
            const found = authorizedVehicles.find(v => v.plate.replace('-', '').toUpperCase() === val);
            
            if (found) {
                nameInput.value = found.name;
                serviceSelect.value = found.service || "";
                toast(`Bem-vindo, ${found.name} (${found.type})`);
                plateInput.style.border = "2px solid #2ecc71";
            }
        } else {
            plateInput.style.border = "";
        }
    });
}

// --- GESTÃO DE REGISTROS (ENTRADA/SAÍDA) ---
if ($('#formRecord')) {
    $('#formRecord').addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
            name: $('#name').value.toUpperCase(),
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
        $('#plate').style.border = "";
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
            <tr>
                <td onclick="prepareEdit('${r.id}')" style="cursor:pointer">${r.name}</td>
                <td onclick="prepareEdit('${r.id}')" style="cursor:pointer">${r.plate}</td>
                <td>${fmtDateTime(r.inTime)}</td>
                <td>${fmtDateTime(r.outTime)}</td>
                <td style="color: #d4af37; font-size: 0.8rem;">${r.service || '—'}</td>
                <td style="text-align:center">
                    <button class="btn" style="background:#2ecc71; color:white; padding:4px 8px; font-size:10px; border:none; border-radius:4px; cursor:pointer; width:auto;" 
                        onclick="quickAuthorize('${r.id}')">+ FIXO</button>
                </td>
            </tr>`;
    });
    if($('#countBadge')) $('#countBadge').textContent = `${records.length} registros`;
}

// --- VEÍCULOS AUTORIZADOS ---

window.quickAuthorize = (recordId) => {
    const rec = records.find(r => r.id === recordId);
    if (!rec) return toast("Erro ao localizar registro.");

    if (authorizedVehicles.find(v => v.plate === rec.plate)) {
        return toast("Veículo já está nos autorizados!");
    }

    // Pede apenas o modelo, pois nome, placa e serviço já vêm do registro
    const modelo = prompt(`Qual o modelo do veículo (${rec.plate})?`, "Não informado");
    if (modelo === null) return; 

    const isFunc = confirm(`Deseja autorizar "${rec.name}" como FUNCIONÁRIO?\n(Clique em Cancelar para Visitante Fixo)`);
    const type = isFunc ? "Funcionário" : "Visitante Fixo";

    authorizedVehicles.push({
        id: crypto.randomUUID(),
        name: rec.name.toUpperCase(),
        plate: rec.plate.toUpperCase(),
        modelo: modelo.toUpperCase(),
        service: rec.service || "Não informado", // Já preenchido do registro inicial
        type: type
    });

    store.set('vitoria_authorized', authorizedVehicles);
    toast("Adicionado aos autorizados!");
    renderAuthorizedTable();
};

window.editAuthorized = (id) => {
    const v = authorizedVehicles.find(item => item.id === id);
    if (!v) return;

    const novoNome = prompt("Editar Nome:", v.name);
    if (novoNome === null) return;
    const novaPlaca = prompt("Editar Placa:", v.plate);
    if (novaPlaca === null) return;
    const novoModelo = prompt("Editar Modelo:", v.modelo || "");
    if (novoModelo === null) return;
    const novoServico = prompt("Editar Serviço Padrão:", v.service || "");
    if (novoServico === null) return;

    v.name = novoNome.toUpperCase();
    v.plate = novaPlaca.toUpperCase();
    v.modelo = novoModelo.toUpperCase();
    v.service = novoServico;

    store.set('vitoria_authorized', authorizedVehicles);
    renderAuthorizedTable();
    toast("Atualizado!");
};

function renderAuthorizedTable(filterText = '') {
    const tbody = $('#authorizedTableBody');
    if (!tbody) return;
    
    const filtered = authorizedVehicles.filter(v => 
        v.name.toLowerCase().includes(filterText.toLowerCase()) || 
        v.plate.toLowerCase().includes(filterText.toLowerCase())
    );

    tbody.innerHTML = filtered.length === 0 ? '<tr><td colspan="6" style="text-align:center">Nenhum veículo fixo</td></tr>' : '';
    
    filtered.forEach(v => {
        tbody.innerHTML += `
            <tr>
                <td onclick="editAuthorized('${v.id}')" style="cursor:pointer; color:var(--gold-light);">${v.name} ✏️</td>
                <td onclick="editAuthorized('${v.id}')" style="cursor:pointer;">${v.plate}</td>
                <td style="color: #d4af37;">${v.modelo || '—'}</td>
                <td style="font-size: 0.8rem;">${v.service || '—'}</td>
                <td><span class="badge" style="background:rgba(212,175,55,0.1)">${v.type}</span></td>
                <td>
                    <button class="btn" style="color:#e74c3c; background:none; border:1px solid #e74c3c; width:auto;" onclick="removeAuthorized('${v.id}')">Excluir</button>
                </td>
            </tr>`;
    });
}

window.filterAuthorizedTable = () => {
    renderAuthorizedTable($('#authSearch').value);
};

window.removeAuthorized = (id) => {
    if(confirm("Remover dos autorizados?")) {
        authorizedVehicles = authorizedVehicles.filter(v => v.id !== id);
        store.set('vitoria_authorized', authorizedVehicles);
        renderAuthorizedTable();
        toast("Removido.");
    }
};

// --- AUDITORIA, IMPRESSÃO E EQUIPE ---
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
    tbody.innerHTML = dados.length === 0 ? '<tr><td colspan="6" style="text-align:center">Sem resultados</td></tr>' : '';
    dados.forEach(r => {
        const gName = guards.find(g => g.id === r.guardId)?.name || 'N/A';
        tbody.innerHTML += `<tr><td>${r.name}</td><td>${r.plate}</td><td>${fmtDateTime(r.inTime)}</td><td>${fmtDateTime(r.outTime)}</td><td>${r.service}</td><td>${gName}</td></tr>`;
    });
}

function imprimirRelatorio() {
    const tabelaHTML = $('#auditTableBody').innerHTML;
    if (!tabelaHTML || tabelaHTML.includes('Sem resultados')) return toast("Filtre os dados primeiro!");
    const win = window.open('', '', 'height=700,width=900');
    win.document.write(`<html><head><style>table{width:100%;border-collapse:collapse;} th,td{border:1px solid #000;padding:8px;text-align:left;}</style></head><body><h2>Relatório Vitória</h2><table>${tabelaHTML}</table></body></html>`);
    win.document.close();
    win.print();
}

function renderGuardsTable() {
    const tbody = $('#guardsTable');
    if (!tbody) return;
    tbody.innerHTML = '';
    guards.forEach(g => {
        const isMe = g.id === activeGuardId;
        tbody.innerHTML += `<tr><td>${g.name} ${isMe ? '(Você)' : ''}</td><td>${g.id}</td><td>Ativo</td><td>${isMe ? '●' : ''}</td></tr>`;
    });
}

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    setupAutocomplete();
    
    if ($('#btnLogout')) $('#btnLogout').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = "login.html";
    });
    if ($('#btnFilter')) $('#btnFilter').addEventListener('click', filtrarAuditoria);
    if ($('#btnExport')) $('#btnExport').addEventListener('click', imprimirRelatorio);

    renderServiceSelect();
    renderRecent();
    renderGuardsTable();
    renderAuthorizedTable();
    
    if ($('#formGuard')) $('#formGuard').style.display = activeGuardId === 'admin' ? 'block' : 'none';
});
