/* --- VARIÁVEIS E TEMA --- */
:root {
    --gold: #D4AF37;
    --gold-dark: #B38F2C;
    --gold-light: #F3E5AB;
    --bg: #0f0f12;
    --card: #15161a;
    --text: #f7f7f7;
    --muted: #bdbdbd;
    --accent: #2b2f3a;
    --success: #2ecc71;
    --danger: #e74c3c;
    --warning: #f39c12;
    --shadow: 0 10px 25px rgba(0, 0, 0, .35);
}

/* --- RESET E BASE --- */
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

html, body {
    height: 100%;
    overflow-x: hidden;
    background-color: var(--bg);
}

body {
    font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background: 
        radial-gradient(circle at 10% -10%, rgba(212, 175, 55, .15), transparent 50%),
        linear-gradient(180deg, #0c0c10 0%, #0f0f12 100%);
    color: var(--text);
    line-height: 1.4;
    -webkit-font-smoothing: antialiased;
}

/* --- TELA DE LOGIN (ESTILOS EXCLUSIVOS) --- */
.login-body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end; 
    padding: 20px;
    padding-bottom: 60px;
    background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('IMG/FUNDOS/5-FUNDO.jpg') !important;
    background-size: cover !important;
    background-position: center center !important;
    background-repeat: no-repeat !important;
    background-attachment: fixed !important;
}

.background-logo-login {
    position: fixed;
    top: 25%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 0;
    pointer-events: none;
}

.background-logo-login img {
    width: 300px;
    max-width: 80vw;
    height: auto;
    filter: drop-shadow(0 0 20px rgba(212, 175, 55, 0.5));
}

.login-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: center;
    padding-bottom: 1.5rem;
}

.login-brand .title {
    color: var(--gold-light);
    font-weight: 800;
    font-size: 1.2rem;
    text-transform: uppercase;
}

/* --- CABEÇALHO E NAVEGAÇÃO (INDEX) --- */
header {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(21, 22, 26, .95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(212, 175, 55, .2);
}

.brand {
    display: flex;
    align-items: center;
    gap: .6rem;
    padding: 0.7rem 1rem;
    justify-content: space-between; /* Para o botão sair ir para a ponta */
}

.logo {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--gold), var(--gold-dark));
    display: grid;
    place-items: center;
    color: #111;
    font-weight: 800;
    flex-shrink: 0;
}

.tabs {
    display: flex;
    gap: .5rem;
    padding: 0.5rem 1rem;
    overflow-x: auto; 
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
}

.tab {
    padding: .6rem 1rem;
    border: 1px solid rgba(212, 175, 55, .3);
    color: var(--gold-light);
    background: rgba(212, 175, 55, .05);
    border-radius: 10px;
    white-space: nowrap;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
}

.tab.active {
    background: var(--gold);
    color: #000;
    border-color: transparent;
}

/* --- CONTAINER E LAYOUT --- */
.container {
    width: 100%;
    padding: 1rem;
    max-width: 1200px;
    margin: 0 auto;
}

.grid {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
}

@media (min-width: 1024px) {
    .grid { flex-direction: row; }
    .grid > div { flex: 1; }
}

/* --- CARDS --- */
.card {
    background: var(--card);
    border: 1px solid rgba(212, 175, 55, .15);
    border-radius: 16px;
    width: 100%;
    z-index: 10;
    position: relative;
    padding: 1rem;
}

.card-header {
    padding: 0.5rem 0 1rem 0;
    border-bottom: 1px solid rgba(255,255,255,0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* --- FORMULÁRIOS E BOTÕES --- */
.form-group, .form-row {
    margin-bottom: 1.2rem;
}

.button-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-bottom: 12px;
}

label {
    display: block;
    font-size: 0.8rem;
    color: var(--gold-light);
    margin-bottom: 0.5rem;
    font-weight: 600;
}

input, select {
    width: 100%;
    padding: 14px;
    border-radius: 10px;
    border: 1px solid rgba(212, 175, 55, .3);
    background: #000;
    color: #fff;
    font-size: 16px !important;
}

.btn, .btn-primary, .btn-login {
    width: 100%;
    padding: 14px;
    border-radius: 10px;
    font-weight: 800;
    font-size: 0.9rem;
    text-transform: uppercase;
    border: none;
    cursor: pointer;
    transition: transform 0.1s;
    display: block;
    text-align: center;
}

.btn-primary, .btn-login {
    background: linear-gradient(135deg, var(--gold), var(--gold-dark));
    color: #000;
}

.btn-outline {
    background: transparent;
    border: 1px solid #444;
    color: #fff;
}

.btn:active { transform: scale(0.98); }

/* --- TABELAS --- */
.table-responsive {
    width: 100%;
    overflow-x: auto;
    border-radius: 12px;
}

table {
    width: 100%;
    min-width: 550px;
    border-collapse: collapse;
}

th {
    background: var(--gold);
    color: #000;
    padding: 12px;
    font-size: 0.75rem;
    text-align: left;
}

td {
    padding: 12px;
    font-size: 0.85rem;
    border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}

/* --- COMPONENTES EXTRAS --- */
.badge {
    background: rgba(212, 175, 55, 0.1);
    color: var(--gold-light);
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.7rem;
    border: 1px solid rgba(212, 175, 55, 0.2);
}

.toast {
    position: fixed;
    bottom: 1.5rem;
    left: 1rem;
    right: 1rem;
    background: #1a1b20;
    padding: 1rem;
    border-radius: 12px;
    border-left: 5px solid var(--gold);
    z-index: 1000;
    box-shadow: 0 10px 30px rgba(0,0,0,0.6);

    /* Regras de visibilidade e animação */
    opacity: 0;
    visibility: hidden;
    transform: translateY(20px);
    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}
