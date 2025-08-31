type CacheType<T> = {
	data: T extends object ? T : string;
	message?: string;
	timestamp: number;
};

export class CacheService<T> {
	private memory: Map<string, CacheType<T>>;
	private maxAge: number = 0;

	public constructor() {
		this.memory = new Map();
	}

	public init(maxAge: number = 10 * 60 * 1000) {
		this.maxAge = maxAge;
	}

	public get(key: string) {
		const cache = this.memory.get(key);

		if (!cache) {
			return null;
		}

		if (Date.now() - cache.timestamp > this.maxAge) {
			// 10 minutes
			this.delete(key);
			return null;
		}

		return cache;
	}

	public set(key: string, value: T | string, message?: string) {
		this.memory.set(key, {
			data: value as T extends object ? T : string,
			message,
			timestamp: Date.now()
		});
	}

	public delete(key: string) {
		this.memory.delete(key);
	}

	public clear() {
		this.memory.clear();
	}
}
