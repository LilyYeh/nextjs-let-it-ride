import { query } from "./db";

export async function createBanker() {
	const updateSQL = `UPDATE banker SET deletedTime=NOW() WHERE deletedTime is null`;
	await query({ query: updateSQL });
	const insertSQL = `INSERT INTO banker () VALUES ()`;
	await query({ query: insertSQL });
	return;
}

export async function setTotalMoney(totalMoney) {
	//紀錄檯面上金額
	const updateSQL = `UPDATE banker SET deletedTime=NOW(), money=${totalMoney} WHERE deletedTime is null`;
	await query({ query: updateSQL });
	return;
}