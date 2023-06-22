import * as dotenv from 'dotenv';
import {
    AiXpandClient,
    AiXpandClientEvent,
    AiXpandClientOptions,
    AiXpandPluginInstance,
    AiXPMessage,
    CacheType,
    encode,
} from '@aixpand/client';
import * as process from 'process';
import { IOTQueueListener } from './iot.dct';
import { initiatorCode } from './pseudopy/initiator';
import { workerCode } from './pseudopy/worker';
import { CustomRequestConfig, RequestData } from './custom.exec';

dotenv.config();

console.log('Running...');

const preferredNode = process.env.AIXPAND_NODE;
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
    fleet: [preferredNode],
    plugins: {},
};

console.log(`Attempting to connect to node: ${preferredNode}`);

const client = new AiXpandClient(aixpOptions);
client.boot();

const customCallback = (context, err, payload) => {
    console.dir(payload, { depth: null });
};

let jobSent = false;
client.on(AiXpandClientEvent.AIXP_RECEIVED_HEARTBEAT_FROM_ENGINE, async (data) => {
    if (data.executionEngine === preferredNode && !jobSent) {
        const data = new RequestData().setCode(await encode(initiatorCode));

        const pluginInstance = new AiXpandPluginInstance(
            'custom-request-instance',
            new CustomRequestConfig(data, await encode(workerCode)),
        ).setCallback(customCallback);

        console.dir(pluginInstance, { depth: null });

        const pipeline = client
            .createPipeline(
                preferredNode,
                new IOTQueueListener(
                    process.env.MQTT_HOST,
                    process.env.MQTT_PORT,
                    process.env.MQTT_USERNAME,
                    process.env.MQTT_PASSWORD,
                ),
            )
            .attachPluginInstance(pluginInstance);

        const deploy = pipeline.deploy();
        client.publish(preferredNode, deploy).then(
            (result: AiXPMessage<any>) => {
                console.log(result.data.notification);
            },
            (reason) => {
                console.log('the error: ', reason.data.notification);
                client.removePipeline(pipeline);
            },
        );

        jobSent = true;
    }
});
