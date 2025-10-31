import { CookieOptions } from "express";
import { randomBytes } from "crypto";
export function validateEmail(email: string) {
	if (email) return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/.test(email);
	return true;
}


export function log(message: string, ...optionalParams: any[]) {
	if (process.env.NODE_ENV !== "test") {
		console.log(message, ...optionalParams);
	}
}


export function RandomEmail() {
	return Math.random().toString(36).substring(7) + "@gmail.com";
}


export function RandomPassword() {
	return randomBytes(10).toString("hex")
}

export function RandomString() {
	return Math.random().toString(36).substring(8);
}



export function getCookiesSettings(stay: boolean = false): CookieOptions {
	return {
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		...(stay ? { maxAge: 15 * 60 * 1000 } : { maxAge: 15 * 60 * 1000 }), // 15 minutes
	};
}

export function getRefreshCookieSettings(stay: boolean = false): CookieOptions {
	return {
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		path: "/auth/refresh", // Refresh token only sent to refresh endpoint
		...(stay ? { maxAge: 7 * 24 * 60 * 60 * 1000 } : { maxAge: 24 * 60 * 60 * 1000 }), // 7 days if stay, 1 day otherwise
	};
}
