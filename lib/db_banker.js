import { query } from "./db";

export async function createBanker() {
	const updateSQL = `UPDATE banker SET deletedTime=NOW() WHERE deletedTime is null`;
	await query({ query: updateSQL });
	const insertSQL = `INSERT INTO banker () VALUES ()`;
	await query({ query: insertSQL });
	return;
}

export async function setTotalMoney(bankerId, totalMoney) {
	const updateSQL = `UPDATE banker SET deletedTime=NOW(), money=${totalMoney} WHERE bankerId=${bankerId}`;
	await query({ query: updateSQL });
	return;
}