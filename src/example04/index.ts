import process from 'process';
import {
    AiXpandClient,
    AiXpandClientEvent,
    AiXpandClientEventContext,
    AiXpandClientOptions,
    AiXPMessage,
    AiXPNotificationData,
    DummyStream,
} from '@aixpand/client';
import {
    TIMESERIES_SIGNATURE,
    TimeSeriesFactory,
    TimeSeriesInstanceConfig,
    TimeSeriesPayload,
} from './timeseries.plugin';
import * as dotenv from 'dotenv';

dotenv.config();

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
    name: 'aixp-core',
    fleet: [preferredNode],
    plugins: {
        [`${TIMESERIES_SIGNATURE}`]: {
            instanceConfig: TimeSeriesInstanceConfig,
            payload: TimeSeriesPayload,
        },
    },
};

const client = new AiXpandClient(aixpOptions);
client.boot();

client.on(TIMESERIES_SIGNATURE, (context: AiXpandClientEventContext, err, data: TimeSeriesPayload) => {
    console.dir(data, { depth: null });

    // this is an example of how to close a pipeline from the context of a received payload.
    client.publish(preferredNode, context.pipeline?.close()).then(
        (result: AiXPMessage<AiXPNotificationData>) => {
            console.log(result.data.notification);
            try {
                client.removePipeline(context.pipeline);
            } catch (err) {
                console.error(err);
            }
        },
        (reason) => {
            console.log('the error: ', reason.data.notification);
        },
    );
});

let requestSent = false;
client.on(AiXpandClientEvent.AIXP_RECEIVED_HEARTBEAT_FROM_ENGINE, (data) => {
    if (data.executionEngine === preferredNode && !requestSent) {
        const factory = new TimeSeriesFactory();

        const instance = factory.makePluginInstance('ts-request', [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8], 2);
        const pipeline = client.createPipeline(preferredNode, new DummyStream()).attachPluginInstance(instance);

        const deploy = pipeline.deploy();

        client.publish(preferredNode, deploy).then(
            (result: AiXPMessage<AiXPNotificationData>) => {
                console.log(result.data.notification);
            },
            (reason) => {
                console.log('the error: ', reason.data.notification);
                client.removePipeline(pipeline);
            },
        );

        requestSent = true;
    }
});

// Logging for debug purposes:
client.on(AiXpandClientEvent.AIXP_CLIENT_BOOTED, (err, status) => {
    console.log('CLIENT SUCCESSFULLY BOOTED!');
});

client.on(AiXpandClientEvent.AIXP_CLIENT_SYS_TOPIC_SUBSCRIBE, (err, data) => {
    if (err) {
        console.error(err);

        return;
    }

    console.log(data);
});
