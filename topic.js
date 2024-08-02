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

    // Check if the topic already exists
    const topics = await admin.listTopics();
    if (!topics.includes("Users")) {
      // Create the topic
      await admin.createTopics({
        topics: [
          {
            topic: "Users",
            numPartitions: 2, // Updated to numPartitions
          },
        ],
      });
      console.log("Created Successfully");
    } else {
      console.log("Topic already exists");
    }

    await admin.disconnect();
  } catch (err) {
    console.error(`Something bad happened: ${err}`);
  } finally {
    process.exit(0);
  }
}
