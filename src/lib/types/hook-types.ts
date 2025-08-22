export type EndpointType = `/${string}`;

/**
 * Represents an endpoint configuration with both a protected and a fallback endpoint.
 *
 * @property protected - The primary protected endpoint.
 * @property fallback - The fallback endpoint to use if the protected one is unavailable.
 */
export interface ProtectedAndFallbackEndpoint {
	protected: EndpointType;
	fallback: EndpointType;
}
