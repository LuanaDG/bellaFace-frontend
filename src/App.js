import React from 'react';
import { BrowserRouter as Router, Switch,Route,Redirect} from 'react-router-dom';
import Login from './login';
import Products from './products';
import Logout from './logout';
import logo7 from './images/logo7.jpg'; 




function App() {
  return (

    <Router>
      <div>

        <nav className="navbar navbar-expand-lg navbar-dark " style={{backgroundColor : '#6b4d89'}}>

        
          <a className="navbar-brand"  href="/"><img alt="Bella Face" src={logo7}></img></a>
          <button className="navbar-toggler"  type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav">
              
               <li className="nav-item">
                  <a className="nav-link" href="/products">Compras</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/login">Login</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/logout">Logout</a>
                </li>    
            </ul>
          </div>
        </nav>





        <Switch>
          <Route exact path="/">
            <div className="text-center">
              <h1>Bem-vindo ao Sistema da Bella Face</h1>
              { /*<img src=""></img> */}
            </div>

          </Route>
          <Route path="/products">
            { sessionStorage.getItem('usuarioLogado') ? <Products />  : <Redirect to="/login" /> }    
          </Route>

          <Route path="/login">
            <Login />
          </Route>
          <Route path="/logout">
            <Logout />
          </Route>

          <Route path="*">
            <Redirect to="/login" />
          </Route>

        </Switch>

      </div>

    </Router>

  );
}

export default App;
