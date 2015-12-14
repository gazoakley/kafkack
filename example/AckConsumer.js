var kafka = require('kafka-node'),
    Client = kafka.Client,
    AckConsumer = require('../src/AckConsumer');

var client = new Client(),
    consumer = new AckConsumer(client, [{ topic: 'test' }]);

consumer.on('message', function (message) {
    console.log('Received', message.topic, message.partition, message.offset, message.key);
    setTimeout(function () {
        console.log('Acknowledged', message.topic, message.partition, message.offset);
        consumer.ack(message);
    }, Math.random() * 5000);
});

process.on('SIGINT', function () {
    console.log('Stopping');
    consumer.close(true, function () {
        client.close(function () {
            console.log('Shut down');
            process.exit(0);
        });
    });
});
