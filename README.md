Kafkack
=======

Kafkack provides an at-least-once delivery mechansim with acknowledgement
semantics on top of kafka-node. Instead of using the normal HighLevelConsumer
class use the provided AckConsumer and call .ack(message) after processing
each message. This works by taking control over committing offsets instead of
automatically committing after reading from a topic.

In theory you could just use the Offset class and commit yourself, but node is
asynchronous so messages could get complete in a different order to how they
started. Kafkack keeps track on a per topic/partition basis of the most recent
completed set of messages and only commits to that point.

**Important** - You must eventually acknowledge all messages, even if there is
an error processing a message. If you don't then offsets won't be committed
and large numbers of messages will be replayed when the client restarts. You
need to consider for yourself how to handle errors when processing messages.
