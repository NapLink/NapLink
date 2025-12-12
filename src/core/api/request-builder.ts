export type BuiltRequest = {
    payload: string;
    echo: string;
};

export function buildRequestPayload(method: string, params: any, echo: string): BuiltRequest {
    return {
        echo,
        payload: JSON.stringify({
            action: method,
            params,
            echo,
        }),
    };
}
