import React, { Component } from 'react';
import './SPVHandleTransaction.css';
import Main from '../Main/Main'
import { Table } from 'semantic-ui-react';

import { subscribeToTimer } from '../Api/Api';
import openSocket from 'socket.io-client';
const socket = openSocket('http://localhost:8000');

class SPVAddTransaction extends Component {

    state = {
        timeStamp:"",
        buyerTimeStamp:"",
        landID:"",
        from:"",
        to:"",
        amount:"",
        buyerSignature:"",
        flag:false,
        flag1:false
    }

    makeTransaction(today){
        // make transactions and send to the network
        const trans = {
            "class": "transaction",
            "data": {
                "timeStamp": today,
                "buyerTimeStamp" : this.state.buyerTimeStamp,
                "landID" : this.state.landID,
                "from": [this.state.from],
                "to": [this.state.to],
                "amount": this.state.amount,
            },
            "buyerSignature": this.state.buyerSignature,
            "sellerSignature": ""
        }
        socket.emit('sendTransaction',trans);
        this.setState({
            flag1:true
        })
    }

       

    verify = async ()=> {
        socket.emit('verifyTransaction');
        this.setState({
            flag:true
        })
    }

  


  render() {

    const blockList=[1,2,3,4,5,6,7,8,9,10] 
    let today = new Date().getTime();

    return (
        <div>
            <Main/>
        <div id="main">
            <div className="both" style={{
					 background: '#2bbbad'
				 }}>
             	<h2  className ="Head"> Add Transaction</h2>
            </div>
        </div>
                <div style={{
                    opacity: 0.8,
                    marginRight: 50,
                    marginLeft: 50,
                    marginTop: 50
                }}>
                <Table celled> 
                    <Table.Header> 
                        <Table.Row> 
                        <Table.HeaderCell> Fields </Table.HeaderCell> 
                        <Table.HeaderCell> Data </Table.HeaderCell> 
                        </Table.Row> 
                    </Table.Header> 
   
                    <Table.Body>   
                        <Table.Row> 
                            <Table.Cell>class</Table.Cell> 
                            <Table.Cell>Transaction</Table.Cell> 
                        </Table.Row> 
                        <Table.Row> 
                            <Table.Cell>timestamp</Table.Cell> 
                            <Table.Cell>{today}</Table.Cell> 
                        </Table.Row>
                        <Table.Row> 
                            <Table.Cell>buyer timestamp</Table.Cell> 
                            <Table.Cell><input type ="text" onChange={event => this.setState({buyerTimeStamp:event.target.value})}/></Table.Cell> 
                        </Table.Row>
                        <Table.Row> 
                            <Table.Cell>landID</Table.Cell> 
                            <Table.Cell><input type ="text" onChange={event => this.setState({landID:event.target.value})}/></Table.Cell> 
                        </Table.Row> 
                        <Table.Row> 
                            <Table.Cell>from</Table.Cell> 
                            <Table.Cell><input type ="text" onChange={event => this.setState({from:event.target.value})}/></Table.Cell> 
                        </Table.Row> 
                        <Table.Row> 
                            <Table.Cell>to</Table.Cell> 
                            <Table.Cell><input type="text" onChange={event => this.setState({to:event.target.value})}/></Table.Cell> 
                        </Table.Row> 
                        <Table.Row> 
                            <Table.Cell>amount</Table.Cell> 
                            <Table.Cell> <input type = "text" onChange={event => this.setState({amount:event.target.value})}/></Table.Cell>
                        </Table.Row>
                        <Table.Row> 
                            <Table.Cell>buyerSignature</Table.Cell> 
                            <Table.Cell> <input type = "text" onChange={event => this.setState({buyerSignature:event.target.value})}/></Table.Cell>
                        </Table.Row> 
                    </Table.Body>
                </Table>
                <div className="buttons">
                    <button onClick={this.makeTransaction.bind(this, today)}> CREATE </button>
                    {/* <button onClick={()=> { socket.emit('sendTransaction','huhu');}} > CREATE </button> */}
                    <button> DISCARD </button>
                </div>
                <div className="buttons2" style={{marginTop: 30}}>
                        <button onClick={this.verify.bind(this)}> VERIFY </button>
                         </div>

                         {
                            this.state.flag1?
                        <div className="note1" align="center" >
                        {
                            this.state.flag?
                            <div>
                             Transaction Verified !!!!
                            </div>
                            :
                            <div>
                            Transaction not Verified !!!
                            </div>
                        }
                        </div>
                        :
                        <div> </div>
                        }
               
            </div>
        </div>
    );
  }
}

export default SPVAddTransaction;
