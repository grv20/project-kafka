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
