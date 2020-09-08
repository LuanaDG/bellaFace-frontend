import React from 'react';
import { Redirect } from 'react-router-dom'

export default class Logout extends React.Component {


    componentDidMount() {
       // caso necessitar melhorar algo no componente
    }

    render() {

        if(sessionStorage.getItem('usuarioLogado')){
            sessionStorage.removeItem('usuarioLogado');       
        }

        return <Redirect to='/login' />;
    }
}