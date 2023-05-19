import * as dotenv from 'dotenv';
import { AiXpandClient, AiXpandClientOptions, AiXpandEventType, AiXpandClientEvent } from '@aixpand/client';
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
    name: 'aixp-core',
    fleet: [process.env.AIXPAND_NODE],
    plugins: {},
};

const client = new AiXpandClient(aixpOptions);

client.getStream(AiXpandEventType.HEARTBEAT).subscribe((hearbeatData) => {
    console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
    console.log('Got heartbeat from: ', hearbeatData.sender.host);
    console.log('Known universe: ', client.getUniverse());
    console.log('-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-');
});


client.on(AiXpandClientEvent.AIXP_CLIENT_CONNECTED, (data) => {
    console.log(data);
});

client.on(AiXpandClientEvent.AIXP_CLIENT_BOOTED, (err, status) => {
    console.log('CLIENT SUCCESSFULLY BOOTED!');
});

client.on(AiXpandClientEvent.AIXP_CLIENT_FLEET_CONNECTED, (status) => {
    console.dir(status, { depth: null });
});

client.on(AiXpandClientEvent.AIXP_CLIENT_SYS_TOPIC_SUBSCRIBE, (err, data) => {
    if (err) {
        console.error(err);

        return;
    }

    console.log(data);
});

