
const b64u =  require("b64u");
const crypto = require("crypto")
const fs = require('fs')  

var	{transactionVerify} = require("./transactionVerify")
var {getMerkleTree} = require("./../merkle");
var {block} = require("./db/dbModels/block");

var myPublicKey = "User2";
var signature   = "blockGenerator's_Signature"; 

var blockMaker = async (transactionList, callback) => {
 	var transElementList = JSON.parse(fs.readFileSync("./transactionElement.json").toString());
 	console.log("traaa",transElementList)
 	var blockElementList = [];    //list of transactions going in the block
 	for(var i=0;i<transElementList.length;i++){
 		transElementList[i].priority++;
 		if(blockElementList.length < 3){
 			blockElementList.push(JSON.stringify(transElementList[i].transaction,undefined,2));
 			transElementList.splice(i,i+1);
 			i--
 		}
 	}
	
	await transactionVerify(transactionList,(reply)=>{
		console.log(reply);
		var sortedTrans = [];     // sorted list of recieved(valid) transactions 

		for(i in transactionList){
			if(reply[i]){
				var hash = crypto.createHash('sha256');
				hash.update(JSON.stringify(transactionList[i],undefined,2));
				sortedTrans.push({hash: hash.digest('hex'), transaction : transactionList[i]});
			}
		}
		sortedTrans.sort((a,b) => {return (a.hash > b.hash) ? 1 : ((a.hash < b.hash) ? -1 : 0);})
		for(i in sortedTrans){
			if(blockElementList.length < 3 ){
 			blockElementList.push(JSON.stringify(sortedTrans[i].transaction,undefined,2));
			}
			else{
				transElementList.push({priority: 0,transaction: sortedTrans[i].transaction});
			}
		}
		getMerkleTree(blockElementList,(tree) => {
				block.find().sort("-header.blockHeight").exec((err,recievedBlock) => {
					if(err || block == undefined || block == null){
						return callback("error in previous block retrieval");
					}
					else{
						var blockCreated = {};
						var blockHeight = -1;
						var hashPrevBlock = "";
						//console.log("r",recievedBlock)
						if( recievedBlock.length == 0){ // genesisBlock
							blockHeight = 0;
							hashPrevBlock = null;
						}
						else if(recievedBlock[0].header.blockHeight >=0){
							blockHeight = recievedBlock[0].header.blockHeight + 1;
							var hash = crypto.createHash('sha256');
							hash.update(JSON.stringify(recievedBlock[0],undefined,2));
							hashPrevBlock =  hash.digest('hex');						
						}
						
						blockCreated = {
							class : "block", 
							header : {
						        blockHeight   : blockHeight,
						        hashPrevBlock : hashPrevBlock,
						        hashMerkleRoot : tree.root(),
						        blockTimeStamp : new Date().getTime() 
							},
						    transactionCount : blockElementList.length,
						    transactionList : blockElementList,
						    blockGenerator  : "User2",
						}
						// create signature
						// var signature  = blockSigCreate(blockCreated);
						
						blockCreated["signature"] = signature; 
						fs.writeFileSync("./transactionElement.json", JSON.stringify(transElementList));
						return callback(blockCreated);
					}
				});
			});
	});
}

blockMaker([{
			class: "transaction",
			timeStamp: 1456,
			landID: "land2345",
			from: ["User1"],
			to: ["User2"],
			amount: 9012321113 
		},{
			class: "transaction",
			timeStamp: 123456,
			landID: "land67",
			from: ["User2"],
			to: ["User1"],
			amount: 123211213 
		}],(reply) =>{
		console.log("rep",reply);
});

module.exports = {blockMaker};