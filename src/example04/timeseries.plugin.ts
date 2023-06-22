import {
    Bind,
    Embedable,
    Embedded,
    PluginInstance,
    PluginPayload,
    AiXpandPlugin,
    AiXpandPluginInstance,
} from '@aixpand/client';

export const TIMESERIES_SIGNATURE = 'TIMESERIES_REST_01';

@Embedable(TIMESERIES_SIGNATURE)
export class TimeSeriesRequestData {
    @Bind('HISTORY')
    history: number[];

    @Bind('STEPS')
    steps: number;

    constructor(history: number[] = [], steps = 0) {
        this.history = history;
        this.steps = steps;
    }
}

@Embedable([TIMESERIES_SIGNATURE])
export class TimeSeriesRequest {
    @Embedded(TimeSeriesRequestData, 'DATA')
    data: TimeSeriesRequestData;

    @Bind('TIMESTAMP')
    timestamp: number;

    constructor(history: number[] = [], steps = 0) {
        this.timestamp = new Date().getTime();
        this.data = new TimeSeriesRequestData(history, steps);
    }
}

@PluginInstance(TIMESERIES_SIGNATURE)
export class TimeSeriesInstanceConfig {
    @Embedded(TimeSeriesRequest, 'REQUEST')
    request: TimeSeriesRequest;

    constructor(history: number[] = [], steps = 0) {
        this.request = new TimeSeriesRequest(history, steps);
    }
}

@Embedable(TIMESERIES_SIGNATURE)
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

@PluginPayload(TIMESERIES_SIGNATURE)
export class TimeSeriesPayload {
    @Embedded(Identifiers, 'identifiers')
    identifiers: Identifiers;

    @Bind('request_status')
    status: string;

    @Bind('request_count')
    requestCount: number;

    @Bind('predict_count')
    predictCount: number;

    @Bind('predict_result')
    predictResult: string | number[];
}

export class TimeSeriesFactory extends AiXpandPlugin<TimeSeriesInstanceConfig> {
    makePluginInstance(
        instanceId: string,
        series: number[],
        steps: number,
    ): AiXpandPluginInstance<TimeSeriesInstanceConfig> {
        return new AiXpandPluginInstance(instanceId, new TimeSeriesInstanceConfig(series, steps));
    }
}
