import React from 'react';
import axios from 'axios';

export default class Login extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            contemUsuarioLogado: false,
            messageError: null,
            messageSuccess: null,
            dadosUsuarioParaLogar: {
                login: '',
                password: ''
            }
        }

        this.onChangeFormLogin = this.onChangeFormLogin.bind(this);
        this.logarUsuario = this.logarUsuario.bind(this);
        this.limpaMensagens = this.limpaMensagens.bind(this);
        this.verificaSeNaoDigitouLoginESenha = this.verificaSeNaoDigitouLoginESenha.bind(this);

    }

    limpaMensagens() {
        this.setState({ messageError: null });
        this.setState({ messageSuccess: null });
    }

    componentDidMount() {
        

    }

    componentWillMount() {
        if (sessionStorage.getItem('usuarioLogado')) {
            this.setState({ contemUsuarioLogado: true });
        }
    }


    onChangeFormLogin(e) {
        this.limpaMensagens();
        const customer = this.state.dadosUsuarioParaLogar;
        customer[e.target.name] = e.target.value;
        this.setState({ dadosUsuarioParaLogar: customer });
    }

    verificaSeNaoDigitouLoginESenha() {

        if (this.state.dadosUsuarioParaLogar.login === '' ||
            this.state.dadosUsuarioParaLogar.password === '') {
                

            this.setState({ messageError: 'Digite seu Login e sua Senha.' });
            return false;
        }

        return true;


    }


    logarUsuario() {
        this.limpaMensagens();

        if (!this.verificaSeNaoDigitouLoginESenha()) {
            return;
        }




        const dadosUsuario = this.state.dadosUsuarioParaLogar;

        axios.post(`http://localhost:8080/customer/login`, dadosUsuario)
            .then(response => {

                const usuarioLogado = response.data;
                sessionStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
                this.setState({ contemUsuarioLogado: true });

            }).catch(error => {
                console.log(error);
                this.setState({ messageError: 'Inconsistência ao efetuar o login: ' + (error.response ? error.response.data : error) });
            })

    }


    render() {

        if (this.state.contemUsuarioLogado) {
            return <div className="text-center">
                <h2> Olá {JSON.parse(sessionStorage.getItem('usuarioLogado')).name}! <br /> Bem vindo ao Sistema da Bella Face.</h2>
                {/* <img src=""></img> */}
            </div>
        }

        return (
            <div className="container -sm">
                <div className="col-md-12">
                    <h4 className="text-center">Bem-vindo ao sistema BellaFace. Faça login para realizar suas compras.</h4>
                    {this.state.messageSuccess != null &&
                        <div className="col-md-12 alert alert-success" role="alert">
                            {this.state.messageSuccess}
                        </div>
                    }
                    {this.state.messageError != null &&
                        <div className="col-md-12 alert alert-danger" role="alert">
                            {this.state.messageError}
                        </div>
                    }
                    <form autoComplete="off" className="px-4 py-3 col-md-6 mx-auto">

                        <div className="form-group">
                            <label htmlFor="login">Digite seu CNPJ</label>
                            <input type="text" id="login" name="login" autoComplete="false" value={this.state.dadosUsuarioParaLogar.login} className="form-control" onChange={this.onChangeFormLogin} placeholder="Apenas números" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="password">Senha</label>
                            <input type="password" className="form-control" autoComplete="false" id="password" name="password" value={this.state.dadosUsuarioParaLogar.password} onChange={this.onChangeFormLogin} placeholder="Digite sua senha" />
                        </div>
                        <button type="button" className="btn btn-sm submit" style={{ backgroundColor: '#6b4d89' }} onClick={this.logarUsuario} >Entrar</button>
                    </form>
                </div>
            </div>
        )
    }
}