# Kafka Testing with KafkaJS

## Setup Zookeeper and Kafka

1. Start Zookeeper:

   ```sh
   docker run --name zookeeper -p 2181:2181 zookeeper
   ```

2. Start Kafka:

   ```sh
   docker run -p 9092:9092 --name kafka -e KAFKA_ZOOKEEPER_CONNECT=192.168.29.82:2181 -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://192.168.29.82:9092 -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 confluentinc/cp-kafka
   ```

## Initialize NPM Project

3. Initialize the npm project:

   ```sh
   npm init -y
   ```

## Create Topic Script

4. Create `topic.js`:

   ```javascript
   const { Kafka } = require("kafkajs");

   run();

   async function run() {
     try {
       const kafka = new Kafka({
         clientId: "myapp",
         brokers: ["192.168.29.82:9092"],
       });
       const admin = kafka.admin();
       console.log("Connecting..........");
       await admin.connect();
       console.log("Connected!");

       // Delete the topic if it exists
       const topics = await admin.listTopics();
       if (topics.includes("Users")) {
         console.log("Deleting existing topic...");
         await admin.deleteTopics({
           topics: ["Users"],
         });
         console.log("Deleted Successfully");
       }

       // Create the topic
       await admin.createTopics({
         topics: [
           {
             topic: "Users",
             numPartitions: 2,
           },
         ],
       });
       console.log("Created Successfully");

       await admin.disconnect();
     } catch (err) {
       console.error(`Something bad happened: ${err}`);
     } finally {
       process.exit(0);
     }
   }
   ```

## Create Producer Script

5. Create `producer.js`:

   ```javascript
   const { Kafka, Partitioners } = require("kafkajs");
   const msg = process.argv[2];

   run();

   async function run() {
     try {
       const kafka = new Kafka({
         clientId: "myapp",
         brokers: ["192.168.29.82:9092"],
       });
       const producer = kafka.producer({
         createPartitioner: Partitioners.LegacyPartitioner,
       });
       console.log("Connecting..........");
       await producer.connect();
       console.log("Connected!");

       const partition = msg[0] < "N" ? 0 : 1;
       console.log(msg, partition);

       const result = await producer.send({
         topic: "Users",
         messages: [
           {
             value: msg,
             partition: partition,
           },
         ],
       });

       console.log(`Sent Successfully: ${JSON.stringify(result)}`);
       await producer.disconnect();
     } catch (err) {
       console.error(`Something bad happened: ${err}`);
     } finally {
       process.exit(0);
     }
   }
   ```

## Create Consumer Script

6. Create `consumer.js`:

   ```javascript
   const { Kafka } = require("kafkajs");

   run();

   async function run() {
     try {
       const kafka = new Kafka({
         clientId: "myapp",
         brokers: ["192.168.29.82:9092"],
       });
       const consumer = kafka.consumer({ groupId: "test" });
       console.log("Connecting..........");
       await consumer.connect();
       console.log("Connected!");

       await consumer.subscribe({
         topic: "Users",
         fromBeginning: true,
       });

       await consumer.run({
         eachMessage: async (result) => {
           console.log(
             `Received message: ${result.message.value} on ${result.partition}`
           );
         },
       });

       // await consumer.disconnect();
     } catch (err) {
       console.error(`Something bad happened: ${err}`);
     }
   }
   ```

## Testing

### Sending Messages

7. Create some messages using the producer script:

   ```sh
   node producer.js Gaurav
   ```

### Consuming Messages

8. To test it, keep running the consumer script:

   ```sh
   node consumer.js
   ```

9. Send data using the producer script:

   ```sh
   node producer.js Test
   ```

### Testing Parallel Processing and Queuing

10. To test parallel processing and queue, start another instance of `consumer.js`:

    ```sh
    node consumer.js
    ```

11. Now, when you send messages with:

    ```sh
    node producer.js Adam
    ```

    The message will be shown in any one of the consumers listening to that partition. If you send:

    ```sh
    node producer.js Yuj
    ```

    It will be sent to another consumer, because it will go to a different partition due to our partition logic.
