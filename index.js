import express from 'express';
import path from 'path';

const host = '0.0.0.0';
const porta = 3000;
let ListarProdutos = [];

const app = express();

app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(process.cwd(), '/Publico')));

function cadastroProduto(requisicao, resposta) {
    const versao = requisicao.body.versao;
    const marca = requisicao.body.marca;
    const custo = requisicao.body.custo;
    const produto = requisicao.body.produto;

    if (versao && marca && custo && produto) {
        ListarProdutos.push({
            versao: versao,
            marca: marca,
            custo: custo,
            produto: produto,
        });
        resposta.redirect('/ListarProdutos');
    } else {
        resposta.write(
            `<!DOCTYPE html>
            <html lang="pt-br">
            
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Cadastro de Produtos</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
                    integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
            </head>
            
            <body>
                <ul class="nav justify-content-center">
                    <li class="nav-item">
                        <a class="nav-link active" aria-current="page" href="/">Inicio</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/cadastroProduto.html">Cadastro de Produtos</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/ListarProdutos">Relatorio</a>
                    </li>
                </ul>
                <br />
                <h3 style="text-align: center;">Pagina de Cadastro </h3>
                <br />
                <div class="container" style="border: solid 2px; padding: 15px;">
                    <form method="POST" action="/cadastroProduto" class="row g-3 needs-validation" novalidate>
                        <legend>Cadastrar Produto:</legend>
                        <div class="col-md-4">
                            <label for="versao" class="form-label">Versão:</label>
                            <input type="text" class="form-control" id="versao" name="versao" value="${versao}" required>`);
        if (versao=="") {
            resposta.write(`<div class="alert alert-danger" role="alert">
            Por favor, informe a versão do produto
          </div>`);
        }
        resposta.write(` </div>
                        <div class="col-md-4">
                            <label for="marca" class="form-label">Marca:</label>
                             <input type="text" class="form-control" id="marca" name="marca" value="${marca}" required>`);
        if (marca=="") {
            resposta.write(`<div class="alert alert-danger" role="alert">
            Por favor, informe a marca do produto
            </div>`);
        }
        resposta.write(`</div>
                        <div class="col-md-4">
                         <label for="custo." class="form-label">Custo</label>
                        <div class="input-group has-validation">
                          <span class="input-group-text" id="inputGroupPrepend">R$</span>
                         <input type="number" class="form-control" id="custo" name="custo" value="${custo}" min="0" step="0.01" required> `);
        if (custo=="") {
            resposta.write(`<div class="alert alert-danger" role="alert">
            Por favor, informe o custo do produto
            </div>`);
        }
        resposta.write(`</div>
        </div>
        <div class="col-md-3">
            <label for="produto" class="form-label">Produto</label>
            <select class="form-select" id="produto" name="produto" required>
                <option selected disabled value="${produto}">Selecione</option>
                <option value="Mouse">Mouse</option>
                <option value="Teclado">Teclado</option>
                <option value="Celular">Celular</option>
                <option value="Notebook">Notebook</option>
                <option value="Carregador de Celular">Carregador de Celular</option>
                <option value="Fone de Ouvido">Fone de Ouvido</option>
            </select>`);
        if (!produto) {
            resposta.write(`<div class="alert alert-danger" role="alert">
            Por favor, selecione o produto!
            </div>`);
        }
        resposta.write(`</div>
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

app.post('/cadastroProduto', cadastroProduto);

app.get('/ListarProdutos', (req, resp) => {
    resp.write('<!DOCTYPE html>');
    resp.write('<html>');
    resp.write('<head>');
    resp.write('<meta charset="UTF-8">');
    resp.write('<title>Lista de Produtos</title>');
    resp.write('<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">')
    resp.write('</head>');
    resp.write('<body>');
    resp.write('<h3>Produtos Cadastrados</h3>');
    resp.write('<table class="table table-dark table-striped">');
    resp.write('<tr>');
    resp.write('<th>Versão</th>');
    resp.write('<th>Marca</th>');
    resp.write('<th>Custo</th>');
    resp.write('<th>Categoria</th>');
    resp.write('</tr>');

    for (let i = 0; i < ListarProdutos.length; i++) {
        resp.write('<tr>');
        resp.write(`<td>${ListarProdutos[i].versao}</td>`);
        resp.write(`<td>${ListarProdutos[i].marca}</td>`);
        resp.write(`<td>R$ ${ListarProdutos[i].custo}</td>`);
        resp.write(`<td>${ListarProdutos[i].produto}</td>`);
        resp.write('</tr>');
    }

    resp.write('</table>');
    resp.write('<button><a href="/index.html">Voltar</a></button>');
    resp.write('</body>');
    resp.write('<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>')
    resp.write('</html>');
    resp.end();
});

app.listen(porta, host, () => {
    console.log(`Servidor rodando em http://${host}:${porta}`);
});
