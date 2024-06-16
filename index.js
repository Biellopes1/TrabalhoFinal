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
app.use(express.static(path.join(process.cwd(), '/publico')));


app.use(express.static(path.join(process.cwd(), '/protegido')));
app.use(cookieParser());
app.use(session({
    secret: 'minhachavesecreta',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 30} 
}));

function autenticar(requisicao, resposta, next) {
    if (requisicao.session.usuarioAutenticado) {
        next();
    } else {
        resposta.redirect('/login.html');
    }
}

app.get('/login', (requisicao, resposta) => {
    resposta.sendFile(path.join(process.cwd(), '/Publico/login.html'));
});


function autenticarUsuario(requisicao, resposta) {
    const  usuario = requisicao.body.usuario;
    const senha = requisicao.body.senha;
    if ((usuario === 'Gabriel' && senha === '12345') || (usuario === 'Renato' && senha === '13579')) {
        requisicao.session.usuarioAutenticado = true;
        requisicao.session.ultimoAcesso = new Date();
        resposta.cookie('ultimoAcesso', requisicao.session.ultimoAcesso.toString());
        resposta.redirect('/');
    } else {
        resposta.send('Usuário ou senha inválidos!');
    }
}

app.post('/login', autenticarUsuario);

app.get('/logout', (req, resp) => {
    req.session.destroy();
    resp.redirect('/login.html');
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
    const nome = requisicao.body.nome;
    const email = requisicao.body.email;
    const telefone = requisicao.body.telefone;

    if (nome && email && telefone ) {
        ListarCliente.push({
            nome: nome,
            email: email,
            telefone: telefone,
        });
        resposta.redirect('/ListarCliente');
    } else {
        resposta.write(
            `<!DOCTYPE html>
            <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Cadastro de Cliente</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
                    integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
            </head>
            <body>
                <ul class="nav justify-content-center">
                    <li class="nav-item">
                        <a class="nav-link active" aria-current="page" href="/">Inicio</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/cadastroCliente.html">Cadastro de cliente</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/cadastroPets.html">Cadastro de Pets</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/">Relatorio</a>
                    </li>
                </ul>
                <br />
                <h3 style="text-align: center;">Pagina de Cadastro </h3>
                <br />
                <div class="container" style="border: solid 2px; padding: 15px;">
                    <form method="POST" action="/cadastroCliente" class="row g-3 needs-validation" novalidate>
                        <legend>Cadastrar Cliente:</legend>
                        <div class="col-md-4">
                            <label for="nome" class="form-label">Nome:</label>
                            <input type="text" class="form-control" id="nome" name="nome" value="${nome}" required>
                            ${!nome ? '<div class="alert alert-danger" role="alert">Por favor, informe o seu nome completo!</div>' : ''}
                        </div>
                        <div class="col-md-4">
                            <label for="email" class="form-label">Email:</label>
                            <input type="email" class="form-control" id="email" name="email" value="${email}" required>
                            ${!email ? '<div class="alert alert-danger" role="alert">Por favor, informe o email!</div>' : ''}
                        </div>
                        <div class="col-md-3">
                            <label for="telefone" class="form-label">Telefone:</label>
                            <input type="text" class="form-control" id="telefone" name="telefone" value="${telefone}" required>
                            ${!telefone ? '<div class="alert alert-danger" role="alert">Por favor, informe o numero de telefone fixo!</div>' : ''}
                        </div>
                        <div class="col-12">
                            <button class="btn btn-primary" type="submit">Cadastrar</button>
                            <a class="btn btn-secondary" href="/">Voltar</a>
                        </div>
                    </form>
                </div>
            </body>
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
                integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
                crossorigin="anonymous"></script>
            </html>`);
        resposta.end();
    }
}


function cadastroPets(requisicao, resposta){
    const nome = requisicao.body.nome;
    const raca = requisicao.body.raca;
    const idade = requisicao.body.idade;

	if(nome && raca && idade ) {
        ListarPets.push({
            nome: nome,
            raca: raca,
            idade: idade,
        });
        resposta.redirect('/ListarPets');
    } else {resp.write(`<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cadastro de Pets</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container">
        <h3 class="mt-5">Cadastro de Pets</h3>
        <form method="POST" action="/cadastroPets">
            <div class="mb-3">
                <label for="nome" class="form-label">Nome</label>
                <input type="text" class="form-control" id="nome" name="nome" required>
            </div>
            <div class="mb-3">
                <label for="raca" class="form-label">Raça</label>
                <input type="text" class="form-control" id="raca" name="raca" required>
            </div>
            <div class="mb-3">
                <label for="idade" class="form-label">Idade</label>
                <input type="number" class="form-control" id="idade" name="idade" required>
            </div>
            <button type="submit" class="btn btn-primary">Cadastrar</button>
        </form>
        <a href="/" class="btn btn-secondary mt-3">Voltar</a>
    </div>
</body>
</html>`);
resposta.end();
}
}

function adotarPet(requisicao, resposta){
    const interessado = requisicao.body.interessado;
    const  pet = requisicao.body.pet;
    const data=new Date().toLocaleString();
	if(interessado && pet) {
        ListarAdocoes.push({
            interessado: interessado,
            pet: pet,
            data:data,
        });
        resposta.redirect('/ListarAdocoes');
    } else {
	resposta.status(400).send('Todos os campos são obrigatórios!');
}
}

app.post('/cadastroCliente',autenticar ,cadastroCliente);
app.post('/cadastroPets',autenticar ,cadastroPets);
app.post('/adotarPet',autenticar ,adotarPet);

app.get('/ListarCliente', (req, resp) => {
    resp.write('<!DOCTYPE html>');
    resp.write('<html>');
    resp.write('<head>');
    resp.write('<meta charset="UTF-8">');
    resp.write('<title>Lista de Clientes</title>');
    resp.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">');
    resp.write('</head>');
    resp.write('<body>');
    resp.write('<h3>Clientes Cadastrados</h3>');
    resp.write('<table class="table table-dark table-striped">');
    resp.write('<tr>');
    resp.write('<th>Nome</th>');
    resp.write('<th>Email</th>');
    resp.write('<th>Telefone</th>');
    resp.write('</tr>');

    for (let i = 0; i < ListarCliente.length; i++) {
        resp.write('<tr>');
        resp.write(`<td>${ListarCliente[i].nome}</td>`);
        resp.write(`<td>${ListarCliente[i].email}</td>`);
        resp.write(`<td>${ListarCliente[i].telefone}</td>`);
        resp.write('</tr>');
    }

    resp.write('</table>');
    resp.write('<button><a href="/">Voltar</a></button>');
    resp.write('</body>');
    resp.write('<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>');
    resp.write('</html>');
    resp.end();
});

app.get('/ListarPets',autenticar,(req, resp) => {
    resp.write('<!DOCTYPE html>');
    resp.write('<html>');
    resp.write('<head>');
    resp.write('<meta charset="UTF-8">');
    resp.write('<title>Lista de Clientes</title>');
    resp.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">');
    resp.write('</head>');
    resp.write('<body>');
    resp.write('<h3>Clientes Cadastrados</h3>');
    resp.write('<table class="table table-dark table-striped">');
    resp.write('<tr>');
    resp.write('<th>Nome</th>');
    resp.write('<th>Raca</th>');
    resp.write('<th>Idade</th>');
    resp.write('</tr>');

    for (let i = 0; i < ListarPets.length; i++) {
        resp.write('<tr>');
        resp.write(`<td>${ListarPets[i].nome}</td>`);
        resp.write(`<td>${ListarPets[i].raca}</td>`);
        resp.write(`<td>${ListarPets[i].idade}</td>`);
        resp.write('</tr>');
    }

    resp.write('</table>');
    resp.write('<button><a href="/">Voltar</a></button>');
    resp.write('</body>');
    resp.write('<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>');
    resp.write('</html>');
    resp.end();
});

app.get('/ListarAdocoes',autenticar,(req, resp) => {
    resp.write('<!DOCTYPE html>');
    resp.write('<html>');
    resp.write('<head>');
    resp.write('<meta charset="UTF-8">');
    resp.write('<title>Lista de interessados</title>');
    resp.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">');
    resp.write('</head>');
    resp.write('<body>');
    resp.write('<h3>Adoções já cadastrado</h3>');
    resp.write('<table class="table table-dark table-striped">');
    resp.write('<tr>');
    resp.write('<th>Interessado</th>');
    resp.write('<th>Pet</th>');
    resp.write('<th>Data</th>');
    resp.write('</tr>');

    for (let i = 0; i < ListarAdocoes.length; i++) {
        resp.write('<tr>');
        resp.write(`<td>${ListarAdocoes[i].interessado}</td>`);
        resp.write(`<td>${ListarAdocoes[i].pet}</td>`);
        resp.write(`<td>${ListarAdocoes[i].data}</td>`);
        resp.write('</tr>');
    }

    resp.write('</table>');
    resp.write('<a href="/" class="btn btn-secondary mt-3">Voltar</a>');
    resp.write('</body>');
    resp.write('</html>');
    resp.end();
});

app.get('/adotarPet', autenticar, (req, resp) => {
    resp.send(`
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <title>Adotar um Pet</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
            <div class="container">
                <h3>Adotar um Pet</h3>
                <form method="POST" action="/adotarPet">
                    <div class="mb-3">
                        <label for="interessado" class="form-label">Interessado</label>
                        <select class="form-select" id="interessado" name="interessado" required>
                            ${ListarCliente.map(cliente => `<option value="${cliente.nome}">${cliente.nome}</option>`).join('')}
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="pet" class="form-label">Pet</label>
                        <select class="form-select" id="pet" name="pet" required>
                            ${ListarPets.map(pet => `<option value="${pet.nome}">${pet.nome}</option>`).join('')}
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary">Adotar</button>
                </form>
                <a href="/" class="btn btn-secondary mt-3">Voltar</a>
            </div>
        </body>
        </html>
    `);
});

app.get('/ListarAdocoes', autenticar, (req, resp) => {
    resp.send(`
        <!DOCTYPE html>
        <html lang="pt-br">
        <head>
            <meta charset="UTF-8">
            <title>Lista de Adoções</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
            <div class="container">
                <h3>Adoções Registradas</h3>
                <table class="table table-dark table-striped">
                    <tr><th>Interessado</th><th>Pet</th><th>Data</th></tr>
                    ${ListarAdocoes.map(adocao => `<tr><td>${adocao.interessado}</td><td>${adocao.pet}</td><td>${adocao.data}</td></tr>`).join('')}
                </table>
                <a href="/" class="btn btn-secondary mt-3">Voltar</a>
            </div>
        </body>
        </html>
    `);
});

app.listen(porta, host, () => {
    console.log(`Servidor rodando em http://${host}:${porta}`);
});