declare interface MyPayload {
	_id: string;
	role: "admin" | "user" | "judge";
	type?: "access" | "refresh";
	exp?: number;
	iat?: number;
}

declare interface TokenPair {
	accessToken: string;
	refreshToken: string;
}


declare namespace Types {
	interface ObjectId {
		toString(): string;
		equals(id: string | ObjectId): boolean;
	}
}


declare interface DateIntervalQuery {
	startDate?: string | number | Date;
	endDate?: string | number | Date;
}


declare interface DateInterval {
	startDate: Date;
	endDate: Date;
}

