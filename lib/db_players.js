import { query } from "./db";
import { foldCards } from "./db_cards";
import { createBanker } from "./db_banker";

export async function logout(socketId) {
	// 登出
	//const deleteSQL = `DELETE FROM \`players\` WHERE \`players\`.\`socketId\` = '${socketId}'`;
	const updateSQL = `UPDATE players SET deletedTime=NOW() WHERE socketId = '${socketId}'`;
	await query({ query: updateSQL });

	// set next player
	await setNextPlayer(socketId);

	return;
}

export async function login(socketId, baseMoney, baseMyMoney) {
	let totalPlayers = await countPlayers();
	let isCurrentPlayer = 0;
	if(totalPlayers === 0) {
		isCurrentPlayer = 1;
		// 建立莊家
		await createBanker();
	}

	const querySQL = `SELECT id FROM banker WHERE deletedTime is null ORDER BY id desc`;
	const banker = await query({ query: querySQL });
	const insertSQL = `INSERT INTO players (socketId, name, isCurrentPlayer, money, bankerId) VALUES ('${socketId}', '玩家1', ${isCurrentPlayer}, ${baseMyMoney-baseMoney}, ${banker[0].id})`;
	await query({ query: insertSQL });
	const players = await getPlayers();
	return players;
}

export async function getPlayers() {
	const querySQL = `SELECT ROW_NUMBER() OVER (  ORDER BY playerId  ) rowNum, playerId, socketId, isCurrentPlayer, money, bankerId
					  FROM players 
					  WHERE deletedTime is null`;
	const players = await query({ query: querySQL });
	return players;
}

// count player
export async function countPlayers() {
	const countSQL = `SELECT count(playerId) as cnt FROM players WHERE deletedTime is null`;
	const countPlayers = await query({ query: countSQL });
	return countPlayers[0].cnt;
}

// set next player
export async function setNextPlayer(socketId) {
	// 棄牌
	await foldCards(socketId);

	const querySQL = `SELECT ROW_NUMBER() OVER (  ORDER BY playerId  ) rowNum, playerId, socketId, isCurrentPlayer FROM players WHERE deletedTime is null`;
	const players = await query({ query: querySQL });

	let totalPlayer = players.length;
	if(totalPlayer<=0){
		return;
	}

	let currentPlayerId = players[0].playerId;
	players.forEach((player,index) => {
		if(player.isCurrentPlayer){
			if(player.rowNum < totalPlayer){
				currentPlayerId = players[index + 1].playerId;
			}
		}
	});

	const updateSQL1 = `UPDATE players SET isCurrentPlayer = 0 WHERE deletedTime is null`;
	await query({ query: updateSQL1 });
	const updateSQL2 = `UPDATE players SET isCurrentPlayer = 1 WHERE playerId='${currentPlayerId}'`;
	await query({ query: updateSQL2 });
	return currentPlayerId;
}

// 射龍門(補牌)
export async function goaling(socketId, bets, baseMoney, baseMyMoney) {
	const updateSQL1 = `UPDATE players SET money=money+${bets} WHERE socketId='${socketId}'`;
	await query({ query: updateSQL1 });

	let players = await getPlayers();

	// 計算檯面金額
	let baseAllMoney = players.length * baseMyMoney;
	let totalPlayersMoney = 0;
	players.forEach((player,index)=>{
		totalPlayersMoney += player.money;
	});
	// 檯面沒錢了
	if(baseAllMoney - totalPlayersMoney <= 0){
		const updateSQL2 = `UPDATE players SET money=money-${baseMoney} WHERE deletedTime is null`;
		await query({ query: updateSQL2 });
	}

	players = await getPlayers();
	return players;
}

export async function setNewGame(baseMoney, baseMyMoney) {
	// 建立莊家
	await createBanker();

	const querySQL = `SELECT id FROM banker WHERE deletedTime is null ORDER BY id desc`;
	const banker = await query({ query: querySQL });
	const updateSQL = `UPDATE players SET bankerId=${banker[0].id}, money=${baseMyMoney-baseMoney} WHERE deletedTime is null`;
	await query({ query: updateSQL });
	const players = await getPlayers();
	return players;
}