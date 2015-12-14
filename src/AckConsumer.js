var kafka = require('kafka-node'),
    HighLevelConsumer = kafka.HighLevelConsumer,
    Offset = kafka.Offset;

var AckConsumer = function (client, payloads, options) {
    options = options ? JSON.parse(JSON.stringify(options)) : {};
    options.autoCommit = false;

    // Instantiate consumer
    HighLevelConsumer.call(this, client, payloads, options);

    var topics = {};
    var offset = new Offset(client);

    this.on('message', function (message) {
        // Store committed offset for topic/partition
        var partitions = topics[message.topic] = topics[message.topic] || {};
        partitions[message.partition] = partitions[message.partition] || {
            pending: message.offset,
            dirty: false,
            acknowledged: []
        };
    });

    this.ack = function ack(message) {
        var topic = topics[message.topic]
        if (!topic) throw 'Message from topic not previously seen';

        var partition = topic[message.partition]
        if (!partition) throw 'Message from partition not previously seen';

        if (message.offset == partition.pending) {
            for (;;) {
                partition.pending++
                var index = partition.acknowledged.indexOf(partition.pending);
                if (index === -1) {
                    break;
                }
                partition.acknowledged.splice(index, 1);
            }
            console.log('Committable', message.topic, message.partition, partition.pending);
            partition.dirty = true;
        } else {
            partition.acknowledged.push(message.offset);
        }
    };

    function getCommitPayloads() {
        var payloads = [];
        for (var topicName in topics) {
            if (topics.hasOwnProperty(topicName)) {
                payloads = payloads.concat(getTopicPayloads(topicName));
            }
        }
        return payloads;
    }

    function getTopicPayloads(topicName) {
        var topic = topics[topicName];
        var payloads = [];
        for (var partitionId in topic) {
            if (topic.hasOwnProperty(partitionId)) {
                var partition = topic[partitionId];
                if (partition.dirty) {
                    payloads.push({
                        topic: topicName,
                        partition: Number(partitionId),
                        offset: partition.pending
                    });
                }
            }
        }
        return payloads;
    }

    this.commit = function () {
        var payloads = getCommitPayloads();

        var cb;
        for (var i = 0; i < arguments.length; i++) {
            if (typeof arguments[i] === 'function') {
                cb = arguments[i];
                break;
            }
        }

        if (payloads.length > 0) {
            offset.commit(this.options.groupId, payloads, cb);
        } else if (cb) {
            cb();
        }
    };
}

AckConsumer.prototype = Object.create(HighLevelConsumer.prototype);

module.exports = AckConsumer;