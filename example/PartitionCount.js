var kafka = require('kafka-node'),
    Client = kafka.Client,
    getPartitionCount = require('../src/PartitionCount');

var client = new Client();

client.on('ready', function () {
    console.log('ready');
    getPartitionCount(client, 'test', function (err, count) {
        console.log('err', err);
        console.log('count', count);
    })
});
