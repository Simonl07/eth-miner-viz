const Web3 = require("web3");
const { makeBatchRequest } = require('web3-batch-request');
var AWS = require('aws-sdk');
AWS.config.update({region:'us-west-2'});

const addr2pool = {
	"0x5a0b54d5dc17e0aadc383d2db43b0a0d3e029c4c": "Spark Pool",
	"0xea674fdde714fd979de3edf0f56aa9716b898ec8": "Ethermine",
	"0x829bd824b016326a401d083b33d092293333a830": "F2Pool",
	"0x04668ec2f57cc15c381b461b9fedab5d451c8f7f": "zhizhu.top",
	"0xd224ca0c819e8e97ba0136b3b95ceff503b79f53": "UUPool",
	"0x52bc44d5378309ee2abf1539bf71de1b7d7be3b5": "Nanopool",
	"0x4c549990a7ef3fea8784406c1eecc98bf4211fa5": "Hiveon Pool",
	"0xb3b7874f13387d44a3398d298b075b7a3505d8d4": "Babel Pool",
	"0x3ecef08d0e2dad803847e052249bb4f8bff2d5bb": "MiningPoolHub",
	"0x99c85bb64564d9ef9a99621301f22c9993cb89e3": "BeePool",
	"0x005e288d713a5fb3d7c9cf1b43810a98688c7223": "xnpool",
	"0x06b8c5883ec71bc3f4b332081519f23834c8706e": "Mining Express",
	"0x2a5994b501e6a560e727b6c2de5d856396aadd38": "PandaMiner",
	"0xeea5b82b61424df8020f5fedd81767f2d0d25bfb": "BTC.com Pool",
	"0x00192fb10df37c9fb26829eb2cc623cd1bf599e8": "2Miners: PPLNS",
	"0x002e08000acbbae2155fab7ac01929564949070d": "2Miners: SOLO",
	"0x35f61dfb08ada13eba64bf156b80df3d5b3a738d": "firepool",
	"0xc4aeb20798368c48b27280847e187bb332b9bc77": "Easy2Mine",
	"0x8595dd9e0438640b5e1254f9df579ac12a86865f": "EzilPool",
	"0x9d6d492bd500da5b33cf95a5d610a73360fcaaa0": "Huobi Mining Pool",
	"0x09ab1303d3ccaf5f018cd511146b07a240c70294": "Minerall Pool",
	"0xa7b0536fb02c593b0dfd82bd65aacbdd19ae4777": "Poolin",
	"0x1ca43b645886c98d7eb7d27ec16ea59f509cbe1a": "viabtc",
	"0x6a7a43be33ba930fe58f34e07d0ad6ba7adb9b1f": "Coinotron",
	"0x4bb96091ee9d802ed039c4d1a5f6216f90f81b01": "Ethpool",
	"0x52f13e25754d822a3550d0b68fdefe9304d27ae8": "EthashPool",
	"0x44fd3ab8381cc3d14afa7c4af7fd13cdc65026e1": "W POOL",
	"0x52e44f279f4203dcf680395379e5f9990a69f13c": "Bw Pool",
	"0x249bdb4499bd7c683664c149276c1d86108e2137": "Cruxpool",
	"0x7f3b29ae0d5edae9bb148537d4ed2b12beddf8b3": "MATPool",
	"0xf35074bbd0a9aee46f4ea137971feec024ab704e": "ETH.SoloPool.org",
	"0xcf6ce585cb4a78a6f96e6c8722927161a696f337": "MaxHash: Solo Mining",
	"0x433022c4066558e7a32d850f02d2da5ca782174d": "ALTpool.pro",
	"0x7f101fe45e6649a6fb8f3f8b43ed03d353f2b90c": "Flexpool.io",
	"0xf64f9720cfcb59ca4f5f45e6fdb3f68b875b7295": "ICanMining.ru",
	"0xa3c084ae80a3f03963017669bc696e961d3ae5d5": "Uleypool",
	"0xb6cf40aee9990c25d7d6193952af222e120b31c2": "FKPool",
	"0xd144e30a0571aaf0d0c050070ac435deba461fab": "ClonaNetwork",
	"0x6a851246689eb8fc77a9bf68df5860f13f679fa0": "ZET Technologies",
	"0x6c3183792fbb4a4dd276451af6baf5c66d5f5e48": "MaxHash: EthPool",
	"0xe5a349fc4ff853dfdd0b7eaaa9dcd8918e768f49": "CoolPool.Top: SOLO",
	"0x2a98776c7e13ed1c240858bd241dcf95fc1928b4": "myminers.org: Solo",
	"0x464b0b37db1ee1b5fbe27300acfbf172fd5e4f53": "FKPool: Old Address",
	"0x4ff271d3e8298213be3d88d257f3973a4b6d727b": "Baypool",
	"0xd0db3c9cf4029bac5a9ed216cd174cba5dbf047c": "HashON Pool"
};

let web3 = new Web3(
  // Replace YOUR-PROJECT-ID with a Project ID from your Infura Dashboard
  new Web3.providers.WebsocketProvider("wss://mainnet.infura.io/ws/v3/11d897be0bea45fc8c68e2121e56fbbf")
);

// create Amazon Kinesis service object
var kinesis = new AWS.Kinesis({
    apiVersion: '2013-12-02',
	region: 'us-west-2'
});


var blocksubscription = web3.eth.subscribe('newBlockHeaders')
.on("connected", function(subscriptionId){
    console.log(subscriptionId);
})
.on("data", function(blockHeader){
	blockHeader['received_at'] = new Date().getTime();
	if (blockHeader['miner'].toLowerCase() in addr2pool) {
		blockHeader['pool'] = addr2pool[blockHeader['miner'].toLowerCase()]
	}else{
		blockHeader['pool'] = 'unknown'
	}

	kinesis.putRecord({
		PartitionKey: blockHeader['hash'],
		Data: JSON.stringify(blockHeader),
		StreamName: 'ethblocks'
	}, function(err, data) {
		if (err) {
			console.error(err);
		}
	});
})
.on("error", console.error);

var cnt = 0;
var ptxsubscription = web3.eth.subscribe('pendingTransactions')
.on("error", console.error)
.on("data", async function(transaction){
	var transaction_obj;
	if (cnt++ % 5 != 0) {
		return;
	}
	await new Promise(r => setTimeout(r, 2000));
	web3.eth.getTransaction(transaction).then(tx => {
		if (tx != null) {
			tx['blockHash'] = transaction
			tx['received_at'] = new Date().getTime()
			kinesis.putRecord({
	            PartitionKey: tx['blockHash'],
				Data: JSON.stringify(tx),
	            StreamName: 'ethptx'
	        }, function(err, data) {
	            if (err) {
	                console.error(err);
	            }
	        });
		}
	});
});
