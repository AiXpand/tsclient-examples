import * as dotenv from 'dotenv';
import { AiXpandClient, AiXpandClientEvent, AiXpandClientOptions, AiXpandEventType, CacheType } from '@aixpand/client';
import * as process from 'process';

dotenv.config();

console.log('Running...');
const aixpOptions: AiXpandClientOptions = {
    mqtt: {
        protocol: process.env.MQTT_PROTOCOL,
        host: process.env.MQTT_HOST,
        port: parseInt(process.env.MQTT_PORT),
        username: process.env.MQTT_USERNAME,
        password: process.env.MQTT_PASSWORD,
        session: {
            clean: true,
            clientId: null,
        },
    },
    options: {
        offlineTimeout: 60,
        bufferPayloadsWhileBooting: false,
        cacheType: CacheType.MEMORY,
    },
    name: 'aixp-core',
    fleet: [process.env.AIXPAND_NODE],
    plugins: {},
};

console.log(`Attempting to connect to node: ${process.env.AIXPAND_NODE}`);

const client = new AiXpandClient(aixpOptions);
client.boot();

client.getStream(AiXpandEventType.HEARTBEAT).subscribe((hearbeatData) => {
    console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
    console.log('Got heartbeat from: ', hearbeatData.sender.host);
    console.log('Known universe: ', client.getUniverse());
    console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
});

// Connection debug information below:
client.on(AiXpandClientEvent.AIXP_CLIENT_CONNECTED, (data) => {
    console.log(data);
});

client.on(AiXpandClientEvent.AIXP_CLIENT_BOOTED, (err, status) => {
    console.log('CLIENT SUCCESSFULLY BOOTED!', new Date());
});

client.on(AiXpandClientEvent.AIXP_RECEIVED_HEARTBEAT_FROM_ENGINE, (data) => {
    console.log('AIXP_RECEIVED_HEARTBEAT_FROM_ENGINE', data);
});

client.on(AiXpandClientEvent.AIXP_CLIENT_SYS_TOPIC_SUBSCRIBE, (err, data) => {
    if (err) {
        console.error(err);
        return;
    }

    console.log('Subscription:', data);
});
