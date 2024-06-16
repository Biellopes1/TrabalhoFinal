import express from 'express';
import path from 'path';
import session from 'express-session';
import cookieParser from 'cookie-parser';

const host = '0.0.0.0';
const porta = 3000;
let ListarCliente = [];
let ListarPets = [];
let ListarAdocoes = [];

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), '/Publico')));
app.use(cookieParser());
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1800000 } // 30 minutos
}));

function autenticar(requisicao, resposta, next) {
    if (requisicao.session.autenticado) {
        next();
    } else {
        resposta.redirect('/login');
    }
}

app.get('/login', (requisicao, resposta) => {
    resposta.sendFile(path.join(process.cwd(), '/Publico/login.html'));
});

app.post('/login', (requisicao, resposta) => {
    const { usuario, senha } = requisicao.body;
    if (usuario === 'Gabriel' && senha === '12345' || usuario==='Renato' && senha==='13579') {
        requisicao.session.autenticado = true;
        requisicao.session.ultimoAcesso = new Date();
        resposta.cookie('ultimoAcesso', requisicao.session.ultimoAcesso.toString());
        resposta.redirect('/');
    } else {
        resposta.send('Usuário ou senha inválidos!');
    }
});

app.get('/', autenticar, (requisicao, resposta) => {
    const ultimoAcesso = requisicao.cookies.ultimoAcesso || 'Primeiro acesso';
    resposta.send(`
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Menu do Sistema</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
            <div class="container">
                <h3>Menu do Sistema</h3>
                <p>Último acesso: ${ultimoAcesso}</p>
                <ul class="nav justify-content-center">
                    <li class="nav-item"><a class="nav-link" href="/cadastroCliente.html">Cadastro de Interessados</a></li>
                    <li class="nav-item"><a class="nav-link" href="/cadastroPets.html">Cadastro de Pets</a></li>
                    <li class="nav-item"><a class="nav-link" href="/adotarPet">Adotar um Pet</a></li>
                </ul>
            </div>
        </body>
        </html>
    `);
});

function cadastroCliente(requisicao, resposta) {
    const { nome, email, telefone } = requisicao.body;
    if (nome && email && telefone) {
        ListarCliente.push({ nome, email, telefone });
        resposta.redirect('/ListarCliente');
    } else {
        resposta.status(400).send('Todos os campos são obrigatórios!');
    }
}

function cadastroPets(requisicao, resposta) {
    const { nome, raca, idade } = requisicao.body;
    if (nome && raca && idade) {
        ListarPets.push({ nome, raca, idade });
        resposta.redirect('/ListarPets');
    } else {
        resposta.status(400).send('Todos os campos são obrigatórios!');
    }
}

function adotarPet(requisicao, resposta) {
    const { interessado, pet } = requisicao.body;
    if (interessado && pet) {
        const data = new Date().toLocaleString();
        ListarAdocoes.push({ interessado, pet, data });
        resposta.redirect('/ListarAdocoes');
    } else {
        resposta.status(400).send('Todos os campos são obrigatórios!');
    }
}

app.post('/cadastroCliente', cadastroCliente);
app.post('/cadastroPets', cadastroPets);
app.post('/adotarPet', adotarPet);

app.get('/ListarCliente', autenticar, (req, resp) => {
    resp.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Lista de Clientes</title>');
    resp.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"></head>');
    resp.write('<body><div class="container"><h3>Clientes Cadastrados</h3><table class="table table-dark table-striped">');
    resp.write('<tr><th>Nome</th><th>Email</th><th>Telefone</th></tr>');
    ListarCliente.forEach(cliente => {
        resp.write(`<tr><td>${cliente.nome}</td><td>${cliente.email}</td><td>${cliente.telefone}</td></tr>`);
    });
    resp.write('</table><a href="/" class="btn btn-secondary mt-3">Voltar</a></div></body></html>');
    resp.end();
});

app.get('/ListarPets', autenticar, (req, resp) => {
    resp.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Lista de Pets</title>');
    resp.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"></head>');
    resp.write('<body><div class="container"><h3>Pets Cadastrados</h3><table class="table table-dark table-striped">');
    resp.write('<tr><th>Nome</th><th>Raça</th><th>Idade</th></tr>');
    ListarPets.forEach(pet => {
        resp.write(`<tr><td>${pet.nome}</td><td>${pet.raca}</td><td>${pet.idade}</td></tr>`);
    });
    resp.write('</table><a href="/" class="btn btn-secondary mt-3">Voltar</a></div></body></html>');
    resp.end();
});

app.get('/adotarPet', autenticar, (req, resp) => {
    resp.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Adotar um Pet</title>');
    resp.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"></head>');
    resp.write('<body><div class="container"><h3>Adotar um Pet</h3><form method="POST" action="/adotarPet">');
    resp.write('<div class="mb-3"><label for="interessado" class="form-label">Interessado</label><select class="form-select" id="interessado" name="interessado" required>');
    ListarCliente.forEach(cliente => {
        resp.write(`<option value="${cliente.nome}">${cliente.nome}</option>`);
    });
    resp.write('</select></div><div class="mb-3"><label for="pet" class="form-label">Pet</label><select class="form-select" id="pet" name="pet" required>');
    ListarPets.forEach(pet => {
        resp.write(`<option value="${pet.nome}">${pet.nome}</option>`);
    });
    resp.write('</select></div><button type="submit" class="btn btn-primary">Adotar</button></form><a href="/" class="btn btn-secondary mt-3">Voltar</a></div></body></html>');
    resp.end();
});

app.get('/ListarAdocoes', autenticar, (req, resp) => {
    resp.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Lista de Adoções</title>');
    resp.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"></head>');
    resp.write('<body><div class="container"><h3>Adoções Registradas</h3><table class="table table-dark table-striped">');
    resp.write('<tr><th>Interessado</th><th>Pet</th><th>Data</th></tr>');
    ListarAdocoes.forEach(adocao => {
        resp.write(`<tr><td>${adocao.interessado}</td><td>${adocao.pet}</td><td>${adocao.data}</td></tr>`);
    });
    resp.write('</table><a href="/" class="btn btn-secondary mt-3">Voltar</a></div></body></html>');
    resp.end();
});

app.listen(porta, host, () => {
    console.log(`Servidor rodando em http://${host}:${porta}`);
});
