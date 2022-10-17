import Head from 'next/head';
import styles from './index.module.scss';
import { useEffect, useState } from 'react';
import io from "socket.io-client";
let socket;

export default function Home() {
	const [ socketId, setSocketId ] = useState('');
	const [ myId, setMyId ] = useState(0);
	const [ players, setPlayers ] = useState([]);
	const [ playersMoney, setPlayersMoney ] = useState([]);
	const [ currentPlayer, setCurrentPlayer ] = useState(0);
	const [ isMyTurn, setMyTurn ] = useState(false);

	//myCards[0]、myCards[1] 龍柱
	const defaultMyCards = [{"number":0,"type":"","imgName":"back.jpg"},{"number":0,"type":"","imgName":"back.jpg"}]
	const [ myCards, setMyCard ] = useState(defaultMyCards);
	const [ my3edCards, set3edCard ] = useState({});

	const baseMoney = 10;
	const baseMyMoney = 30;
	const [ inputBets, setInputBets ] = useState(0);
	const [ bets, setBets ] = useState(0);
	const [ myMoney, setMyMoney ] = useState(baseMyMoney);
	const [ totalMoney, setTotalMoney ] = useState(0);

	const [ ranking, setRanking ] = useState([]);

	async function dealCards(){
		const apiUrlEndpoint = `/api/dealCards`;
		const getData = {
			method: "POST",
			header: { "Content-Type": "application/json" },
			body: JSON.stringify({
				socketId: socketId
			})
		}
		const response = await fetch(apiUrlEndpoint, getData);
		const res = await response.json();
		setMyCard(res.data);
		set3edCard({});
	}

	async function getCard(){
		const apiUrlEndpoint = `/api/getCard`;
		const getData = {
			method: "POST",
			header: { "Content-Type": "application/json" },
			body: JSON.stringify({
				socketId: socketId,
				myCards: myCards,
				bets: bets,
				baseMyMoney: baseMyMoney,
				baseMoney: baseMoney
			})
		}
		const response = await fetch(apiUrlEndpoint, getData);
		const res = await response.json();
		set3edCard(res.my3edCards);
		setPlayers(res.players);
		socket.emit('update-players',res.players);
	}

	async function nextPlayer(){
		const apiUrlEndpoint = `/api/setNextPlayer`;
		const getData = {
			method: "POST",
			header: { "Content-Type": "application/json" },
			body: JSON.stringify({
				socketId: socketId
			})
		}
		const response = await fetch(apiUrlEndpoint, getData);
		const res = await response.json();
		socket.emit('set-next-player', res);
		setCurrentPlayer(res);
		setMyCard(defaultMyCards);
		set3edCard({});
		setBets(0);
		setInputBets(0)
	}

	async function playerLogin(){
		const apiUrlEndpoint = `/api/playerLogin`;
		const getData = {
			method: "POST",
			header: { "Content-Type": "application/json" },
			body: JSON.stringify({
				socketId: socketId,
				baseMoney: baseMoney,
				baseMyMoney: baseMyMoney
			})
		}
		const response = await fetch(apiUrlEndpoint, getData);
		const res = await response.json();
		setPlayers(res);
		socket.emit('update-players',res);
	}

	function onChangeInputBets(e) {
		setInputBets(e.target.value);
		setBets(e.target.value);
	}

	async function socketInitializer(){
		await fetch('/api/socket');
		socket = io();

		socket.on('connect', () => {
			setSocketId(socket.id);
		});

		socket.on('update-players', playersData => {
			setPlayers(playersData);
		});

		socket.on('set-next-player', nextPlayer => {
			setCurrentPlayer(nextPlayer);
		});

		socket.on('game-over', rankingData => {
			setRanking(rankingData);
		});

		socket.on('new-game', playersData => {
			setPlayers(playersData);
			document.getElementById("game").style.display = "block";
			document.getElementById(styles['gameOver']).style.display = "none";
		});
	}

	async function gameOver() {
		const apiUrlEndpoint = `/api/gameOver`;
		const getData = {
			method: "POST",
			header: { "Content-Type": "application/json" },
			body: JSON.stringify({
				totalMoney: totalMoney
			})
		}
		const response = await fetch(apiUrlEndpoint, getData);
		const res = await response.json();
		setRanking(res);
		socket.emit('game-over',res);
	}

	async function newGame() {
		const apiUrlEndpoint = `/api/newGame`;
		const getData = {
			method: "POST",
			header: { "Content-Type": "application/json" },
			body: JSON.stringify({
				baseMoney: baseMoney,
				baseMyMoney: baseMyMoney
			})
		}
		const response = await fetch(apiUrlEndpoint, getData);
		const res = await response.json();
		setPlayers(res);
		socket.emit('new-game',res);
		document.getElementById("game").style.display = "block";
		document.getElementById(styles['gameOver']).style.display = "none";
	}

	useEffect(()=>{
		socketInitializer();
	},[]);

	useEffect(()=>{
		async function f(){
			if(socketId!==''){
				await playerLogin();
				//await getPlayers();
			}
		}
		f();
	},[socketId]);

	useEffect(()=>{
		let playersMoney = [];
		let playersGroup = [];
		let baseAllMoney = players.length * baseMyMoney;
		let totalPlayersMoney = 0;
		players.forEach((player,index)=>{
			totalPlayersMoney += player.money;
			let playerName = '玩家'+player.rowNum;
			if(player.socketId == socketId){
				setMyId(player.playerId);
				setMyMoney(player.money);
				playerName = '我';
			}
			if(player.isCurrentPlayer){
				setCurrentPlayer(player.playerId)
			}
			playersGroup[player.playerId] = {name:playerName, playerId:player.playerId, money:player.money};
			if(player.rowNum % 3 == 0){
				playersMoney.push(playersGroup);
				playersGroup = [];
			}
		});
		if(playersGroup.length > 0){
			playersMoney.push(playersGroup);
		}
		setPlayersMoney(playersMoney);
		setTotalMoney( baseAllMoney - totalPlayersMoney);
	},[players]);

	useEffect(()=>{
		if(currentPlayer == myId){
			setMyTurn(true);
		}else{
			setMyTurn(false);
		}
	},[currentPlayer,myId]);

	useEffect(()=>{
		if(bets > totalMoney) {
			alert('最多可下注 $'+totalMoney);
			setInputBets(totalMoney);
			setBets(totalMoney);
		}else if(bets > myMoney) {
			alert('沒錢了(ಥ﹏ಥ) 最多可下注 $'+myMoney);
			setInputBets(myMoney);
			setBets(myMoney);
		}
	},[bets]);

	useEffect(()=>{
		console.log(ranking.length)
		if(ranking.length > 0){
			document.getElementById("game").style.display = "none";
			document.getElementById(styles['gameOver']).style.display = "block";
		}
	},[ranking]);

	let the3edCardDev = <>
		<button onClick={getCard} disabled={!isMyTurn || !myCards[0].number || bets<=0}>補牌</button>
		<button onClick={nextPlayer} disabled={!isMyTurn || !myCards[0].number}>pass</button>
	</>;
	let theDealCardDev = <>
		<button onClick={dealCards} disabled={!isMyTurn || myCards[0].number}>重新發牌</button>
	</>
	if(my3edCards.imgName) {
		the3edCardDev = <img src={`/images/pocker/${my3edCards.imgName}`} />;
		theDealCardDev = <button onClick={nextPlayer}>pass</button>;
	}else if(myMoney <=0 ) {
		theDealCardDev = <button onClick={gameOver} disabled={!isMyTurn}>遊戲結束</button>;
	}

	return (
		<>
			<Head>
				<title>射龍門</title>
			</Head>
			<div className={styles.mainContent} id="game">
				<ul className={styles.playerArea}>
					{
						players.map( (player, index) => {
							let name = `玩家${player.rowNum}`;
							let arrow = '';
							let colorClass = '';
							if(player.playerId == myId){
								name = '我';
							}
							if(index < Object.keys(players).length - 1){
								arrow = ' → ';
							}
							if(player.playerId == currentPlayer){
								colorClass = 'red'
							}
							return (
								<li key={index}><span className={colorClass} >{name}</span> {arrow} </li>
							);
						})
					}
				</ul>
				<div className={styles.publicMoney}>${totalMoney}</div>
				<div className={styles.gameBoard}>
					<div className={styles.card1}><img src={`/images/pocker/${myCards[0].imgName}`} /></div>
					<div className={styles.card3}>{the3edCardDev}</div>
					<div className={styles.card2}><img src={`/images/pocker/${myCards[1].imgName}`} /></div>
				</div>
				<div className={styles.bets+(myCards[0].number? " "+styles.active : "")}>
					<div className={styles.title}>下注</div>
					<div className={styles.coin+(bets==10? " "+styles.active : "")} onClick={() => setBets(10)}>$10</div>
					<div className={styles.coin+(bets==30? " "+styles.active : "")} onClick={() => setBets(30)}>$30</div>
					<div className={styles.coin+(bets==50? " "+styles.active : "")} onClick={() => setBets(50)}>$50</div>
					<div className={styles.inputCoin}>
						<input className={(bets && bets==inputBets? styles.active : "")} type="number" value={inputBets} onChange={onChangeInputBets} />
					</div>
				</div>
				<div className={styles.dealCards}>
					{theDealCardDev}
				</div>
				<table className={styles.privateMoney}>
					<tbody>
					{
						playersMoney.map( (groups, index) => {
							return(
								<tr key={index}>
									{
										groups.map((plmny,index) => {
											return(<td key={index} className={(plmny.playerId == myId)? styles.me:''}>{plmny.name}：${plmny.money}</td>)
										})
									}
								</tr>
							)
						})
					}
					</tbody>
				</table>
			</div>
			<div className={styles.mainContent} id={styles['gameOver']}>
				<div className={styles.publicMoney}>${totalMoney}</div>
				<table>
					<thead>
						<tr>
							<th>排名</th>
							<th>玩家</th>
							<th>勝負</th>
						</tr>
					</thead>
					<tbody>
					{
						ranking.map((rank, index) => {
							let rankName = `玩家${rank.rowNum}`;
							if (rank.playerId == myId) {
								rankName = '我';
							}
							let totalMyMoney = rank.money - baseMyMoney;
							let totalMyMoneyText = '$'+totalMyMoney;
							if(totalMyMoney < 0){
								totalMyMoneyText = '-$'+(totalMyMoney * -1);
							}
							return (
								<tr>
									<td>{index+1}</td>
									<td>{rankName}</td>
									<td>{totalMyMoneyText}</td>
								</tr>
							)
						})
					}
					</tbody>
				</table>
				<button onClick={newGame}>再玩一局</button>
			</div>
		</>
	)
}
