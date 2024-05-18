declare interface MyPayload {
	_id: string;
	role: "admin" | "user" | "judge";
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

