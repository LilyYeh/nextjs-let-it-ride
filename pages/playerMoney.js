import { useEffect, useState, useRef } from 'react';
import useRate from "./useRate";
import styles from "./index.module.scss";

const players_img = ['queen','king','queen-flower','prince'];

export default function playerMoney({playerData, currentPlayer, baseMyMoney, getCardFlag}) {
	const [ money, setMoney ]=useState(playerData.money);
	const [ style, setStyle ]=useState(styles[players_img[playerData.playerId%4]]);


	useEffect(() => {
		console.log(getCardFlag);
		if(getCardFlag){
			if (playerData.money > money) {
				setStyle(styles[players_img[playerData.playerId % 4] + '-win']);
			} else if (playerData.money < money) {
				setStyle(styles[players_img[playerData.playerId % 4] + '-lose']);
			} else {
				setStyle(styles[players_img[playerData.playerId % 4]]);
			}
		}else{
			setStyle(styles[players_img[playerData.playerId % 4]]);
		}

		setMoney(playerData.money);
	},[playerData.money,currentPlayer]);

	return (
		<>
			<td className={style + ' ' + (currentPlayer==playerData.playerId? styles.me : '') + ' ' + styles[playerData.name]}>
				<span className={styles.myMoney}>${useRate(playerData.money, baseMyMoney)}</span>
			</td>
		</>
	)
}