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

export async function createPlayer(data) {
	const insertSQL = `INSERT INTO players (socketId, name, isCurrentPlayer, money, bankerId) VALUES ('${data.socketId}', '玩家1', ${data.isCurrentPlayer}, ${data.money}, ${data.bankerId})`;
	await query({ query: insertSQL });
	return;
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
export async function setNextPlayer(socketId='') {
	// 棄牌
	await foldCards(socketId);

	const querySQL = `SELECT ROW_NUMBER() OVER (  ORDER BY playerId  ) rowNum, playerId, socketId, isCurrentPlayer FROM players WHERE deletedTime is null`;
	let players = await query({ query: querySQL });

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

	const updateSQL = `UPDATE players 
					   SET isCurrentPlayer = CASE
					   		WHEN playerId = ${currentPlayerId} THEN 1
					   		ELSE 0 
					   		END
					   WHERE deletedTime is null`;
	await query({ query: updateSQL });

	players = await getPlayers();

	return players;
}

// 射龍門
export async function goaling(socketId, bets) {
	const updateSQL1 = `UPDATE players SET money=money+${bets} WHERE socketId='${socketId}'`;
	await query({ query: updateSQL1 });

	return;
}

export async function setNewGame(data) {
	const updateSQL = `UPDATE players SET bankerId=${data.bankerId}, money=${data.money} WHERE deletedTime is null`;
	await query({ query: updateSQL });
	return;
}

export async function setKeepGoing(baseMoney) {
	const updateSQL = `UPDATE players SET money=money-${baseMoney} WHERE deletedTime is null`;
	await query({ query: updateSQL });

	return;
}