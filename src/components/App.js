import React, { Component } from 'react';
import Web3 from  'web3';
import logo from '../DAI.png';
import './App.css';
import Marketplace from '../abis/marketplace.json'
import Navbar from './Navbar'
import Main from './Main'

class App extends Component {

  async componentWillMount() { /* What we want to do to load our web3 connection*/
    await this.loadWeb3()
    await this.loadBlockchainData()
    //console.log(window.web3)
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3){
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3
    //Load account
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] }) /* Just get metamask address */
    //console.log(accounts)
    const networkId = await web3.eth.net.getId() /*Detect the network dynamically*/
    //console.log(networkId)
    const networkData = Marketplace.networks[networkId]
    if(networkData) {
      const marketplace = web3.eth.Contract(Marketplace.abi, networkData.address) //This is the deployed Web 3.0 contract
      this.setState({ marketplace })
      const productCount = await marketplace.methods.productCount().call() //call methods just read data. A send method sends transactions.
      //console.log(productCount)
      this.setState({ productCount }) //Loop through the products and load them on this react component.
      // Load products
      for (var i = 1; i <= productCount; i++) {
        const product = await marketplace.methods.products(i).call()
        this.setState({
          products: [...this.state.products, product]
        })
      }
      this.setState({ loading: false })
      console.log(this.state.products)
    } else {
      window.alert('Marketplace contract not deployed to detected network.')
    }
   
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '', /* We're going to be updating this value*/
      productCount: 0,
      products: [],
      loading: true
    }

    this.createProduct = this.createProduct.bind(this) //let React know that createProduct on line 79 is the same as that on line 62
    this.purchaseProduct = this.purchaseProduct.bind(this)
  }

  createProduct(name, price){
    this.setState({ loading: true }) //tell React we're going to be loading
    this.state.marketplace.methods.createProduct(name, price).send({ from: this.state.account }) //".methods" exposes the functions on the smart contract. Send and pass in metadata.
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  purchaseProduct(id, price){
    this.setState({ loading: true }) //tell React we're going to be loading
    //".methods" exposes the functions on the smart contract. Send and pass in metadata.
    this.state.marketplace.methods.purchaseProduct(id).send({ from: this.state.account, value: price })
    .once('receipt', (receipt) => {
      this.setState({ loading: false })
    })
  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex">
              { this.state.loading 
                ? <div className="d-flex align-items-center"><strong>Loading...</strong></div>
                : <Main 
                  products={this.state.products}
                  createProduct={this.createProduct}
                  purchaseProduct={this.purchaseProduct} /> 
              }
            </main>
          </div> 
        </div>
      </div>
    );
  }
}

export default App;
