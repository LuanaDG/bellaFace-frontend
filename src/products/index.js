import React from 'react';
import axios from 'axios';
//import { Redirect } from 'react-router-dom';

export default class Products extends React.Component {


    constructor(props) {
        super(props);

        this.state = {
            messageError: null,
            messageSuccess : null,
            listProducts: [],
            currentProduct: {
                id: null,
                quantity: 1,
                name: '',
                description: '',
                price: '',
                created: ''
            },
            carrinho: [],
            order: {
                customerId:null,
                listProducts: [],
                totalOrder: 0,
                comments: ''
            }

        }

        this.listarProdutos = this.listarProdutos.bind(this);
        this.recebeProdutoEscolhido = this.recebeProdutoEscolhido.bind(this);
        this.onChange = this.onChange.bind(this);
        this.adicionarProdutoAoCarrinho = this.adicionarProdutoAoCarrinho.bind(this);
        this.removerProdutoDoCarrinho = this.removerProdutoDoCarrinho.bind(this);
        this.produtoNaoEstaNoCarrinho = this.produtoNaoEstaNoCarrinho.bind(this);
        this.finalizarCompra = this.finalizarCompra.bind(this);
        this.onChangeMaster = this.onChangeMaster.bind(this);
        this.limpaMensagens = this.limpaMensagens.bind(this);
        this.verificarSeFinalDeSemana = this.verificarSeFinalDeSemana.bind(this);

    }

    resetState() {
        const messageError = null;
        const messageSuccess = null;
        const listProducts = [];
        const currentProduct = {
            id: null,
            quantity: 1,
            name: '',
            description: '',
            price: '',
            created: ''
        };
        const carrinho = [];
        const order = {
            customerId:null,
            listProducts: [],
            totalOrder: 0,
            comments: ''
        };
        this.setState({ listProducts });
        this.setState({ currentProduct });
        this.setState({ carrinho });
        this.setState({ order });
        this.setState({ messageError });
        this.setState({ messageSuccess });
        this.listarProdutos();
    }

    limpaMensagens(){
        this.setState({ messageError:null });
        this.setState({ messageSuccess:null });
    }

    componentDidMount() {
        this.listarProdutos();
        this.verificarSeFinalDeSemana();

    }

    verificarSeFinalDeSemana() {
        const verificaData = new Date();
        const finalDeSemana = verificaData.getDay() === 0 || verificaData.getDay() === 6 ? true : false;

        if(finalDeSemana === true ) {
          this.setState({ messageError :'Não é possível fazer compras no final de semana.'});
        }
    }


    listarProdutos() {
        axios.get(`http://localhost:8080/products`)
            .then(response => {
                const listProducts = response.data;
                this.setState({ listProducts });
            }).catch(error => {
                
                this.setState({ messageError :'Inconsistência ao listar os produtos: '+(error.response? error.response.data : error)});
                console.log(error);
            })
    }

    recebeProdutoEscolhido(produtoEscolhido) {
        this.limpaMensagens();
        produtoEscolhido.quantity = 1;
        this.setState({ currentProduct: produtoEscolhido });
    }

    formataMoeda(valor) {
        return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    onChange(e) {
        const produto = this.state.currentProduct;
        produto[e.target.name] = e.target.value;
        this.setState({ currentProduct: produto });
    }

    onChangeMaster(e) {
        const order = this.state.order;
        order[e.target.name] = e.target.value;
        this.setState({ order });
    }

    adicionarProdutoAoCarrinho(produto) {

       this.limpaMensagens();

        const order = this.state.order;
        //soma o total dos valores com o item vezes quantidade adicionada
        order.totalOrder = order.totalOrder + (produto.price * produto.quantity);

        //Inclui o item no carrinho
        let carrinhoLocal = this.state.carrinho;
        carrinhoLocal.push(produto);
        this.setState({ carrinho: carrinhoLocal });

        //remove o produto da lista para evitar confundir o usuário
        const listaDeProdutosAtual = this.state.listProducts;
        const listaDeProdutosAtualAtualizada = listaDeProdutosAtual.filter(this.produtoNaoEstaNoCarrinho);
        this.setState({ listProducts: listaDeProdutosAtualAtualizada });

    }

    produtoNaoEstaNoCarrinho(produto) {

        for (const produtoDoCarrinho of this.state.carrinho) {
            if (produto.id === produtoDoCarrinho.id) {
                return false;
            }
        }
        return true;
    }

    removerProdutoDoCarrinho(produtoRemovidoDoCarrinho) {

        this.limpaMensagens();

        const order = this.state.order;
        //subtrai o total dos valores com o item vezes quantidade adicionada
        order.totalOrder = order.totalOrder - (produtoRemovidoDoCarrinho.price * produtoRemovidoDoCarrinho.quantity);

        //redisponibiliza o item na lista geral
        let listaDeProdutosAtual = this.state.listProducts;
        listaDeProdutosAtual.push(produtoRemovidoDoCarrinho);
        this.setState({ listProducts: listaDeProdutosAtual });

        //remove o produto do carrinho 
        const carrinhoLocal = this.state.carrinho;
        const carrinhoAtualizado = carrinhoLocal.filter((item) => { return item.id !== produtoRemovidoDoCarrinho.id });
        this.setState({ carrinho: carrinhoAtualizado });

    }



    finalizarCompra() {
        this.limpaMensagens();

        const orderFinalizada = this.state.order;
        orderFinalizada.listProducts = this.state.carrinho;
        orderFinalizada.customerId = JSON.parse(sessionStorage.getItem('usuarioLogado')).id;
        this.setState({ order: orderFinalizada });

        //TODO axios e enviar para rota de order no backend
        console.log(this.state.order);
        axios.post(`http://localhost:8080/order`,this.state.order)
           .then(response => {
            //Retorna o estado para a situação de início
            this.resetState();
            this.setState({ messageSuccess: 'Compra realizada com sucesso. Order ID: '+response.data.id });

        }).catch(error => {
            this.setState({ messageError :'Inconsistência ao registrar a venda: '+(error.response? error.response.data : error)});
            console.log(error);
        })

        

    }
    


    render() {


        return (
            <div className="container-sm">
                <div className="row">



                    <div className="col-md-10 mx-auto">
                    {this.state.messageSuccess !=null &&
                        <div className="col-md-12 alert alert-success" role="alert">
                            {this.state.messageSuccess}
                        </div>
                     }
                     {this.state.messageError !=null &&
                        <div className="col-md-12 alert alert-danger" role="alert">
                             {this.state.messageError}
                        </div>
                    }

                        <div>
                            <h1 className="h4 text-gray-800 mt-3" >Escolha seus Produtos</h1>

                            {this.state.carrinho.length > 0 &&
                                <div className="text-right">
                                    <button className="btn btn-primary mb-3" data-toggle="modal" data-target="#modalcarrinho" >Visualizar Carrinho </button>
                                </div>
                            }
                        </div>
                        <div className="table-responsive">
                            <table className="table table-striped text-center ">


                                <thead>
                                    <tr>

                                        <th scope="col">Nome</th>
                                        <th scope="col">Descrição</th>
                                        <th scope="col">Preço</th>
                                        <th scope="col">Data de Fabricação</th>
                                        <th scope="col"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.listProducts.map((itemDaLista, index) => {

                                            return (

                                                <tr key={index}>
                                                    <td>{itemDaLista.name}</td>
                                                    <td>{itemDaLista.description}</td>
                                                    <td className="text-nowrap">{this.formataMoeda(itemDaLista.price)}</td>
                                                    <td>{itemDaLista.created}</td>
                                                    <td>

                                                        <button className="btn btn-sm btn-secondary " style={{backgroundColor : '#6b4d89'}} data-toggle="modal" data-target="#modal1" type="button" onClick={(e) => this.recebeProdutoEscolhido(itemDaLista)} >Comprar</button>

                                                    </td>
                                                </tr>
                                            );
                                        })
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>


                    <div className="modal fade" id="modal1" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="exampleModalLabel">Selecione a quantidade</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body ">
                                    <div className="form-group row ">
                                        <div className="col-sm-12 mx-auto">
                                            <input type="text" className="form-control-plaintext text-center" value={this.state.currentProduct.name + " - " + this.state.currentProduct.description} readOnly />
                                            <input type="text" className="form-control-plaintext text-center" value={" Preço unitário: " + this.formataMoeda(this.state.currentProduct.price)} readOnly />
                                            <div className="col-sm-10 mx-auto">
                                                <input type="number" min="1" max="99999" id="quantidade" name="quantity" onChange={this.onChange} className="form-control mx-auto col-sm-4 text-center" value={this.state.currentProduct.quantity} />
                                                <hr />
                                                <input type="text" className="form-control-plaintext text-center" value={" Total estimado: " + this.formataMoeda(this.state.currentProduct.price * this.state.currentProduct.quantity)} readOnly />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Cancelar</button>
                                    <button type="button" className="btn btn-primary" style={{backgroundColor : '#6b4d89'}} data-dismiss="modal" onClick={(e) => this.adicionarProdutoAoCarrinho(this.state.currentProduct)} >Incluir no carrinho</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* modal carrinho */}
                    <div className="modal fade bd-example-modal-lg" id="modalcarrinho" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div className="modal-dialog modal-lg" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title" id="exampleModalLabel">Carrinho de compras</h5>
                                    <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body ">
                                    <div className="col-md-10 mx-auto table-responsive">
                                        <table className="table table-striped text-center ">


                                            <thead>
                                                <tr>

                                                    <th scope="col">Nome</th>
                                                    <th scope="col">Descrição</th>
                                                    <th scope="col">Preço</th>
                                                    <th scope="col">quantidade</th>
                                                    <th scope="col">Total</th>
                                                    <th scope="col"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {
                                                    this.state.carrinho.map((itemDaLista, index) => {

                                                        return (

                                                            <tr key={index}>
                                                                <td className="text-nowrap">{itemDaLista.name}</td>
                                                                <td className="text-nowrap">{itemDaLista.description}</td>
                                                                <td className="text-nowrap">{this.formataMoeda(itemDaLista.price)}</td>
                                                                <td>{itemDaLista.quantity}</td>
                                                                <td className="text-nowrap">{this.formataMoeda(itemDaLista.price * itemDaLista.quantity)}</td>
                                                                <td>

                                                                    <button className="btn btn-sm btn-danger " type="button" onClick={(e) => this.removerProdutoDoCarrinho(itemDaLista)} >Excluir</button>

                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="text-right" >
                                        {" Total estimado: " + this.formataMoeda(this.state.order.totalOrder)}
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="comments">Comentário:</label>
                                        <textarea className="form-control" id="comments" rows="3" maxLength="255" name="comments" value={this.state.order.comments} onChange={this.onChangeMaster}></textarea>
                                    </div>

                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" data-dismiss="modal">Continuar comprando</button>
                                    <button type="button" className="btn btn-primary" style={{backgroundColor : '#6b4d89'}} data-dismiss="modal" onClick={this.finalizarCompra} >Concluir compra</button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>



        )
    }
}




