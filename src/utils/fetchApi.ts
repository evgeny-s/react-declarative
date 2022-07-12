
export class FetchError extends Error {
    constructor(
        readonly originalError: any,
        readonly request: RequestInfo,
        readonly response: Response | undefined,
    ) {
        super(originalError.message || 'FetchError');
    }
};

export const fetchApi = async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = input instanceof URL ? input.toString() : input;
    let response: Response | undefined = undefined;
    try {
        response = await fetch(request, init);
        return await response.json();
    } catch (error: any) {
        throw new FetchError(
            error,
            request,
            response,
        );
    }
};

export default fetchApi;
