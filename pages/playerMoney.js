import { useEffect, useState, useRef } from 'react';
import useRate from "./useRate";
import styles from "./index.module.scss";

export default function playerMoney({playerData, currentPlayer, baseMyMoney}) {
	return (
		<td className={(playerData.playerId == currentPlayer)? styles.me:''}>{playerData.name}：${useRate(playerData.money, baseMyMoney)}</td>
	)
}