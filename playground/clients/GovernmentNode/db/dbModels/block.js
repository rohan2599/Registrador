var mongoose = require("mongoose");

var blockHeader = new mongoose.Schema({
        blockHeight   : {
        type: Number,
        required :true,
        minlength : 1,
    },
        hashPrevBlock : {
        type: String,
        minlength : 1,
    },
        hashMerkleRoot : {
        type: String,
        required :true,
        minlength : 1,
    },
        blockTimeStamp : {
        type: Number,
        required :true,
        minlength : 1,
    }    
});

var Block = new mongoose.Schema({
    class : {
        type: String,
        required :true,
        minlength : 1,
    },    
    header : blockHeader,
    transactionCount : {
        type: Number,
        required :true,
        minlength : 1,
    },
    transactionList : {
        type: [String],
        required :true,
        minlength : 1,
    },
    blockGenerator  : {
        type: String,
        required :true,
        minlength : 1,
    },
    signature : {
        type: String,
        required :true,
        minlength : 1,    
    }   
}); 

var block = mongoose.model("block",Block);
module.exports = {block}