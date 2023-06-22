import { Bind, DataCaptureThreadConfig, Embedable, Embedded } from '@aixpand/client';

@Embedable()
export class IOTStreamConfigMetadata {
    @Bind('HOST')
    host: string;

    @Bind('PORT')
    port: string;

    @Bind('USER')
    username: string;

    @Bind('PASS')
    password: string;

    @Bind('TOPIC')
    topic: string;

    @Bind('PROTOCOL')
    protocol: string;

    constructor(
        host: string,
        port: string,
        username: string,
        password: string,
        topic = 'lummetry/payloads',
        protocol = 'mqtts',
    ) {
        this.host = host;
        this.port = port;
        this.username = username;
        this.password = password;
        this.topic = topic;
        this.protocol = protocol;
    }
}

@DataCaptureThreadConfig()
export class IOTQueueListener {
    @Bind('TYPE')
    type = 'IotQueueListener';

    @Bind('RECONNECTABLE')
    reconnectable = true;

    @Embedded(IOTStreamConfigMetadata, 'STREAM_CONFIG_METADATA')
    streamConfigMetadata: IOTStreamConfigMetadata;

    constructor(host: string, port: string, username: string, password: string) {
        this.streamConfigMetadata = new IOTStreamConfigMetadata(host, port, username, password);
    }
}
