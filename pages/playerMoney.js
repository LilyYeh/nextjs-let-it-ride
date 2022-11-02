import { useEffect, useState, useRef } from 'react';
import useRate from "./useRate";
import styles from "./index.module.scss";

const players_img = ['queen','king','prince2','queen-flower','king2','prince'];

export default function playerMoney({playerData, currentPlayer, baseMyMoney, getCardFlag}) {
	const [ money, setMoney ]=useState(playerData.money);
	const [ style, setStyle ]=useState(styles[players_img[playerData.playerId%6]]);


	useEffect(() => {
		if(getCardFlag){
			if (playerData.money > money) {
				setStyle(styles[players_img[playerData.playerId % 6] + '-win']);
			} else if (playerData.money < money) {
				setStyle(styles[players_img[playerData.playerId % 6] + '-lose']);
			} else {
				setStyle(styles[players_img[playerData.playerId % 6]]);
			}
		}else{
			setStyle(styles[players_img[playerData.playerId % 6]]);
		}

		setMoney(playerData.money);
	},[playerData.money,getCardFlag]);

	return (
		<>
			<td className={style + ' ' + (currentPlayer==playerData.playerId? styles.me : '') + ' ' + styles[playerData.name]}>
				<span className={styles.myMoney}>${useRate(playerData.money, baseMyMoney)}</span>
			</td>
		</>
	)
}