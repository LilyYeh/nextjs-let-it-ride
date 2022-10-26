import useRate from "./useRate";
import styles from "./index.module.scss";

const players_img = ['queen','king','queen-flower','prince'];

export default function playerMoney({playerData, currentPlayer, baseMyMoney, minPrivateMoney, maxPrivateMoney}) {
	let style = styles[players_img[playerData.playerId%4]];
	if(minPrivateMoney == playerData.playerId){
		style = styles[players_img[playerData.playerId%4]+'-lose'];
	}
	if(maxPrivateMoney == playerData.playerId){
		style = styles[players_img[playerData.playerId%4]+'-win'];
	}
	return (
		<>
			<td className={style}>${useRate(playerData.money, baseMyMoney)}</td>
		</>
	)
}