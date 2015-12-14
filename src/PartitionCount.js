function getPartitionCount(client, topic, cb) {
    function parseMetadata(err, res) {
        if (err) {
            return cb(err);
        }

        var metadata = res[1].metadata[topic];
        var count = 0;
        for (var partition in metadata) {
            if (metadata.hasOwnProperty(partition)) count++;
        }

        if (count === 0) {
            return cb('Topic does not exist (although metadata request may have now created it)');
        }

        return cb(null, count);
    }

    client.loadMetadataForTopics([topic], parseMetadata);
}

module.exports = getPartitionCount;