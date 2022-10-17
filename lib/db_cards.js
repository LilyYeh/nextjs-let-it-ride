import { query } from "./db";
/*
 * 牌庫堆 isDeleted=0; socketId=null
 * 手牌   isDeleted=0; socketId=1;
 * 棄牌堆 isDeleted=1; socketId=null;
 */

// count 牌庫
export async function countCards() {
	const countSQL = `SELECT count(cardId) as cnt FROM cards WHERE isDeleted=0 AND socketId is null`;
	const countCards = await query({ query: countSQL });
	return countCards[0].cnt;
}

// select cards in 牌庫
export async function getCards(socketId, limit) {
	const querySQL = `SELECT cardId, number, type, CONCAT(number,type,'.jpg') imgName 
					  FROM cards 
					  WHERE isDeleted=0 AND socketId is null 
					  ORDER BY RAND() 
					  LIMIT ${limit}`;
	const cards = await query({ query: querySQL });

	let handCards = [];
	cards.forEach( ({cardId}) => {
		handCards.push(cardId);
	})
	const updateSQL = `UPDATE cards SET socketId='${socketId}' WHERE cardID IN (?)`;
	await query({ query: updateSQL, values: handCards });
	return cards;
}

// 放入棄牌堆
export async function foldCards(socketId) {
	const updateSQL = `UPDATE cards SET isDeleted=1, socketId=null WHERE socketId='${socketId}'`;
	await query({ query: updateSQL });
	return;
}

// 重新洗牌
export async function shuffle() {
	const updateSQL = `UPDATE cards SET isDeleted=0 WHERE socketId is null`;
	await query({ query: updateSQL });
	return;
}
