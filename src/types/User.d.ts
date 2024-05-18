
declare interface UserAuthI {
    email: string;
    password: string;

}

declare interface UserI  extends UserAuthI{
	firstName: string;
	lastName: string;
    role: "admin" | "user" ;
    enable: boolean;
}


type OptimizedUser = Omit<UserI, "password"> & { _id: string };


interface ResetI {
	email: string;
	user: Types.ObjectId;
	createdAt: Date;
	expiresAt: Date;
}



