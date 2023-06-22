import { Bind, Embedable, PluginInstance, AbstractRestCustomExec, RestRequestData } from '@aixpand/client';

export const CUSTOM_REQUEST = 'CUSTOM_REQUEST';

@Embedable(CUSTOM_REQUEST)
export class RequestData extends RestRequestData {
    @Bind('CODE')
    code: string;

    setCode(code: string) {
        this.code = code;

        return this;
    }
}

@PluginInstance(CUSTOM_REQUEST)
export class CustomRequestConfig extends AbstractRestCustomExec {
    @Bind('MAX_TRIES')
    maxTries: number;

    @Bind('MAX_RUN_TIME')
    maxRunTime: number;

    @Bind('N_WORKERS')
    workers: number;

    @Bind('WORKER_CODE')
    workerCode: string;

    constructor(data: RequestData, workerCode: string, maxTries = 10, maxRunTime = 60, workers = 2) {
        super(data);

        this.maxTries = maxTries;
        this.maxRunTime = maxRunTime;
        this.workers = workers;
        this.workerCode = workerCode;
    }
}
