import "dotenv/config";
import { db } from "../../settings";
import { seedUsers } from "./user.seed";


async function seed()  {
	await db;
	await seedUsers();
}
seed();
