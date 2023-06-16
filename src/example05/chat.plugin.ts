import {
    Bind,
    Embedable,
    Embedded,
    PluginInstance,
    PluginPayload,
    Alertable,
    AiXpandPlugin,
    AiXpandPluginInstance,
    AbstractRestCustomExec,
    RestRequestData,
    AixpandAlerter,
} from '@aixpand/client';

export const CHAT_PLUGIN_SIGNATURE = 'CHAT_PLUGIN';

export enum ChatbotPersona {
    PLAIN = 'Motionmask-plain',
    SARCASTIC = 'Motionmask-sarcastic',
    FUNNY = 'Motionmask-funny',
}

@Embedable(CHAT_PLUGIN_SIGNATURE)
export class ChatData extends RestRequestData {
    @Bind('CODE')
    code: string;

    setCode(code: string) {
        this.code = code;

        return this;
    }
}

@Alertable()
@PluginInstance(CHAT_PLUGIN_SIGNATURE)
export class ChatInstanceConfig extends AbstractRestCustomExec {
    @Bind('CHAT_USER_NAME')
    username: string;

    @Bind('CHAT_QUESTION')
    question: string;

    @Bind('MOTIONMASK_PERSONA')
    persona: ChatbotPersona;

    constructor(data: ChatData, user: string, question: string, persona: ChatbotPersona) {
        super(data);

        this.username = user;
        this.question = question;
        this.persona = persona;
    }

    updateName(user: string) {
        this.username = user;

        return this;
    }

    updateQuestion(question: string) {
        this.question = question;

        return this;
    }
}

@Embedable([CHAT_PLUGIN_SIGNATURE])
export class Identifiers {
    @Bind('streamId')
    streamId: string;

    @Bind('instanceId')
    instanceId: string;

    @Bind('payloadId')
    payloadId: number;

    @Bind('initiatorId')
    initiatorId: string;

    @Bind('sessionId')
    sessionId: string | null;

    @Bind('idTags')
    idTags: any[];
}

@PluginPayload(CHAT_PLUGIN_SIGNATURE)
export class ChatReply {
    @Embedded(Identifiers, 'identifiers')
    identifiers: Identifiers;

    @Bind('exec_result')
    reply: string;

    @Bind('exec_errors')
    errors: number;

    @Bind('exec_warning')
    warnings: string[];
}

export class ChatInstanceFactory extends AiXpandPlugin<ChatInstanceConfig> {
    makePluginInstance(
        instanceId: string,
        user: string,
        question: string,
        persona: ChatbotPersona = ChatbotPersona.FUNNY,
    ): AiXpandPluginInstance<ChatInstanceConfig> {
        const data = new ChatData().setCode(
            'eNp1kM9KxDAQh+95iqF7Udj1DXooUlGk7bJdz2Fo02ywyWQzCeLbm8BWFPE08P2++ZOIHTgCYzV8mOgUMxxAE82wUAAfaE5TNOTEDmbKZixcqwiRgHN5fG7O8m1sT7JvuvY/qxvOL0PfNeOrPLancegbWAJZqDoqwy3y+4ExTMjRTNV+42gzX5JznxWgm3/pfkXjKiGC4rRGqMGvSRv3MF0wojcyO3cC4JoUl556ixctiyK3YJ8lrwLnbT8d+71J3tIiJlbhz6QCZb5VFSO/Vt4+sn7ClTO8F1/z+Hxl',
        );

        return new AiXpandPluginInstance(
            instanceId,
            new ChatInstanceConfig(data, user, question, persona),
            null,
            new AixpandAlerter(3),
        );
    }
}
