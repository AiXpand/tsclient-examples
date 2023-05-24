import express, { Application, Request, Response } from 'express';
import * as bodyParser from 'body-parser';
import {
    AiXpandClient,
    AiXpandClientEvent,
    AiXpandClientEventContext,
    AiXpandClientOptions,
    DummyStream,
} from '@aixpand/client';
import path from 'path';
import process from 'process';
import * as dotenv from 'dotenv';
import {
    CHAT_PLUGIN_SIGNATURE,
    ChatbotPersona,
    ChatInstanceConfig,
    ChatInstanceFactory,
    ChatReply,
} from './chat.plugin';

dotenv.config();

const app: Application = express();
const PORT = 3030;
let clientBooted = false;
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
        [`${CHAT_PLUGIN_SIGNATURE}`]: {
            instanceConfig: ChatInstanceConfig,
            payload: ChatReply,
        },
    },
};
let chatPipeline = null;
let chatStream = null;

let pendingResponse = null;
let pendingReplies = {
    'funny-bot': null,
    'sarcastic-bot': null,
    'plain-bot': null,
};

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const createPipeline = (engine: string) => {
    const chatbotFactory = new ChatInstanceFactory();

    if (engine != preferredNode) {
        return;
    }

    if (!chatPipeline) {
        chatPipeline = client.createPipeline(preferredNode, new DummyStream());
        chatStream = chatPipeline.getDataCaptureThread();

        console.log(`Created pipeline with DCT #${chatStream.id}`);
    }

    const funnyInstance = chatPipeline.getPluginInstance('funny-bot');
    if (!funnyInstance) {
        chatPipeline.attachPluginInstance(chatbotFactory.makePluginInstance('funny-bot', '', '', ChatbotPersona.FUNNY));
    }

    const sarcasticInstance = chatPipeline.getPluginInstance('sarcastic-bot');
    if (!sarcasticInstance) {
        chatPipeline.attachPluginInstance(
            chatbotFactory.makePluginInstance('sarcastic-bot', '', '', ChatbotPersona.SARCASTIC),
        );
    }

    const plainInstance = chatPipeline.getPluginInstance('plain-bot');
    if (!plainInstance) {
        chatPipeline.attachPluginInstance(chatbotFactory.makePluginInstance('plain-bot', '', '', ChatbotPersona.PLAIN));
    }
};

const allInstancesReplied = () => {
    return Object.keys(pendingReplies).reduce((status, instanceId) => status && pendingReplies[instanceId], true);
};

// ===== Express WebApp =====

app.get('/', function (req, res) {
    if (clientBooted && !chatPipeline) {
        createPipeline(preferredNode);
    }

    res.render('chatbot');
});

app.post('/end', (req, res) => {
    console.log('Received END CONVERSATION.');

    client.publish(preferredNode, chatPipeline.close()).then(
        (result) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            console.log(result.data.notification);
            try {
                client.removePipeline(chatPipeline);

                chatPipeline = null;
                chatStream = null;

                res.json({ success: true });
            } catch (err) {
                console.error(err);
            }
        },
        (reason) => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            console.log('the error: ', reason.data.notification);

            res.json({ success: false });
        },
    );
});

app.post('/question', bodyParser.json(), (req: Request, res: Response): void => {
    if (!clientBooted) {
        res.json({ status: false, message: 'AiXpand Network client not booted.' });

        return;
    }

    chatPipeline.getPluginInstance('funny-bot').getConfig().updateQuestion(req.body.question).updateName(req.body.name);
    chatPipeline
        .getPluginInstance('sarcastic-bot')
        .getConfig()
        .updateQuestion(req.body.question)
        .updateName(req.body.name);
    chatPipeline.getPluginInstance('plain-bot').getConfig().updateQuestion(req.body.question).updateName(req.body.name);

    client.publish(preferredNode, chatPipeline.deploy('example-05-session')).then(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        (response) => console.log(response.data.notification),
        (error) => {
            console.log('pipeline deploy error: ', error.data.notification);
            client.removePipeline(chatPipeline);
        },
    );

    pendingResponse = res;
});

app.listen(PORT, (): void => {
    console.log('SERVER IS UP ON PORT:', PORT);
});

// ===== AiXpand network client logic =====

const client = new AiXpandClient(aixpOptions);

client.on(CHAT_PLUGIN_SIGNATURE, (context: AiXpandClientEventContext, err, data: ChatReply) => {
    console.log(`Received response from instance with id: ${context.instance.id}`);

    pendingReplies[context.instance.id] = data.reply;
    if (allInstancesReplied()) {
        console.log('All instances replied, sending output.');

        pendingResponse.json({
            status: true,
            content: {
                funny: pendingReplies['funny-bot'],
                sarcastic: pendingReplies['sarcastic-bot'],
                plain: pendingReplies['plain-bot'],
            },
        });

        pendingReplies = {
            'funny-bot': null,
            'sarcastic-bot': null,
            'plain-bot': null,
        };

        pendingResponse = null;
    }
});

client.on(AiXpandClientEvent.AIXP_RECEIVED_HEARTBEAT_FROM_ENGINE, (data) => {
    clientBooted = true;
    createPipeline(data.executionEngine);
});

client.on(AiXpandClientEvent.AIXP_CLIENT_SYS_TOPIC_SUBSCRIBE, (err, data) => {
    if (err) {
        console.error(err);

        return;
    }

    console.log(data);
});
