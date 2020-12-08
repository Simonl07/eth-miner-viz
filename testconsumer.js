const Kinesis = require('lifion-kinesis');
var AWS = require('aws-sdk');
AWS.config.update({region:'us-west-2'});

const kinesis = new Kinesis({
  streamName: 'ethblocks',
  region: 'us-west-2'
});
kinesis.on('data', (data) => {
  	for (var record of data.records) {
		console.log(record.data)
	}
});
kinesis.startConsumer();
