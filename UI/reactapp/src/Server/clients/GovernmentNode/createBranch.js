const {getMerkleTree} = require("./../merkle");
const fs  = require("fs");
const math = require("mathjs");
var createBranch = function (transactionList, header){
    var verTransList = JSON.parse(fs.readFileSync("./clients/GovernmentNode/verTransList.json").toString());               
	//console.log("bbbbbbbbbbbbbbb",verTransList,transactionList[1].data.from)
	var branchList = [];
	for (let j in verTransList){
		var count = new Number(0);
		//console.log(transactionList, buyer, root);
		for (var trans of transactionList){
			if(trans.data.landID == verTransList[j].transaction.data.landId){
				var branch = [];
				getMerkleTree(transactionList, (tree)=>{
					returnedRoot = tree.root()
					
					if(returnedRoot != header.hashMerkleRoot){
						console.log("Transaction List in wrong order", returnedRoot, header.hashMerkleRoot);
					}
					
					var levelCount = tree.depth()
					for (var i = 0;i < levelCount;i++){
							//console.log(Math.ceil(transactionList.length / (Math.pow(2,i))) - 1);
							if((count == Math.ceil(transactionList.length / (Math.pow(2,i))) - 1) && count %2 ==0){
								branch.push({hash : tree.level(levelCount - i)[count],position : "center"});
								//console.log("hi")												
							}
							else{
								if(count%2 == 0)
									branch.push({hash : tree.level(levelCount - i)[count + 1] , position : "right"});
								else
									branch.push({hash : tree.level(levelCount  - i)[count - 1], position: "left"});
							}
						//console.log("count :", count)
						count = Math.floor(count/2);	
					}  	
				});
				branchList.push({
					peerId: verTransList[j].peerId,
					branch: branch,
					header: header,
					landID: verTransList[j].transaction.data.landId
				});
				verTransList.splice(j,1)
				console.log("branch",branch);
				break;			
			}
			count++;
		}
	}
	fs.writeFileSync("./clients/GovernmentNode/branchList.json", JSON.stringify(branchList,undefined,2));						
	fs.writeFileSync("./clients/GovernmentNode/verTransList.json", JSON.stringify(verTransList,undefined,2));						
}

module.exports = {createBranch};
