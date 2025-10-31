
declare interface UserAuthI {
    email: string;
    password: string;

}

declare interface UserI  extends UserAuthI{
	firstName: string;
	lastName: string;
    role: "admin" | "user" ;
    enable: boolean;
	emailVerified: boolean;
	verificationToken?: string;
	verificationTokenExpires?: Date;
	accountStatus: 'active' | 'locked' | 'deleted';
	lockedAt?: Date;
	lockedReason?: string;
	deletedAt?: Date;
}


type OptimizedUser = Omit<UserI, "password"> & { _id: string };


interface ResetI {
	email: string;
	user: Types.ObjectId;
	createdAt: Date;
	expiresAt: Date;
}



