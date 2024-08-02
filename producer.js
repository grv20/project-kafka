const { Kafka } = require("kafkajs");
const msg = process.argv[2];
//[0]:node js application, [1]:file, [2]: first argument
// so if i run this file like node producer.js test, then [2] is test
run();

async function run() {
  try {
    const kafka = new Kafka({
      clientId: "myapp",
      brokers: ["192.168.29.82:9092"],
    });
    const producer = kafka.producer();
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
