export type FetchType = typeof fetch;
export interface HttpResponse<T> {
	status: number;
	success: boolean;
	message: string;
	value: T;
}
export interface HttpRequestType {
	fetch: FetchType;
	input: RequestInfo | URL;
	init?: RequestInit;
}