export type EndpointType = `/${string}`;

export interface ProtectedAndFallbackEndpoint {
	protected: EndpointType;
	fallback: EndpointType;
}
