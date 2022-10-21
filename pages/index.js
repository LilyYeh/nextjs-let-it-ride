import Head from 'next/head';
import styles from './index.module.scss';
import { useEffect, useState } from 'react';
import io from "socket.io-client";
let socket;
import useRate from "./useRate";
import PlayerMoney from './playerMoney'

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
	const baseMyMoney = 1000;
	const [ inputBets, setInputBets ] = useState(0);
	const [ bets, setBets ] = useState(0);
	const [ bigOrSmall, setBigOrSmall ] = useState('');
	const [ myMoney, setMyMoney ] = useState(baseMyMoney);
	const [ totalMoney, setTotalMoney ] = useState(0);
	const [ isAnyPlayerCanPlay, setIsAnyPlayerCanPlay ] = useState(false);
	const [ isAnyPlayerCantPlay, setIsAnyPlayerCantPlay ] = useState(false);

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
				baseMoney: baseMoney,
				bigOrSmall: bigOrSmall
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
		setInputBets(0);
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

	function onChangeInputBets(value) {
		if(value <=0 ) return;
		setInputBets(value);
		setBets(value);
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
			setDefault(playersData);
		});

		socket.on('keep-going', playersData => {
			setDefault(playersData);
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
				baseMyMoney: baseMyMoney,
				totalMoney: totalMoney
			})
		}
		const response = await fetch(apiUrlEndpoint, getData);
		const res = await response.json();
		setDefault(res)
		socket.emit('new-game',res);
	}

	async function keepGoing() {
		const apiUrlEndpoint = `/api/keepGoing`;
		const getData = {
			method: "POST",
			header: { "Content-Type": "application/json" },
			body: JSON.stringify({
				baseMoney: baseMoney,
			})
		}
		const response = await fetch(apiUrlEndpoint, getData);
		const res = await response.json();
		setDefault(res)
		socket.emit('keep-going',res);
	}

	function setDefault(playersData) {
		setPlayers(playersData);
		setMyCard(defaultMyCards);
		set3edCard({});
		setBets(0);
		setInputBets(0);
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
		let canPlay = false;
		let someoneCantPlay = false;
		players.forEach((player,index)=>{
			if(player.money >= 20){
				//還有人有錢
				canPlay = true;
			}
			if(player.money < 30){
				//有人沒錢了
				someoneCantPlay = true;
			}
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
		setTotalMoney(baseAllMoney - totalPlayersMoney);
		setIsAnyPlayerCanPlay(canPlay);
		setIsAnyPlayerCantPlay(someoneCantPlay);
	},[players]);

	useEffect(()=>{
		if(currentPlayer == myId){
			setMyTurn(true);
		}else{
			setMyTurn(false);
		}
	},[currentPlayer,myId]);

	useEffect(()=>{
		if(myCards[0].number>0 && myCards[0].number == myCards[1].number){
			if(myCards[0].number >= 7){
				setBigOrSmall('small');
			}else{
				setBigOrSmall('big');
			}
		}else{
			setBigOrSmall('');
		}
	},[myCards]);

	useEffect(()=>{
		let maxBets = Math.floor(myMoney / 2);
		if(myCards[0].number == myCards[1].number){
			maxBets = Math.floor(myMoney / 3);
		}
		if(bets > totalMoney) {
			alert('最多可下注 $'+totalMoney);
			setInputBets(totalMoney);
			setBets(totalMoney);
		}else if(bets > maxBets) {
			let mB = Math.floor(maxBets/10) * 10;
			alert('沒錢了(ಥ﹏ಥ) 最多可下注 $'+mB);
			setInputBets(mB);
			setBets(mB);
		}
	},[bets]);

	useEffect(()=>{
		if(ranking.length > 0){
			document.getElementById("game").style.display = "none";
			document.getElementById(styles['gameOver']).style.display = "block";
		}
	},[ranking]);

	let the3edCardDev = <>
		<button className={'btn '+'btn-red-outline '+styles.shoot} onClick={getCard} disabled={!isMyTurn || !myCards[0].number || bets<=0 || totalMoney <=0}>射</button>
		<button className={'btn '+'btn-black-outline '+styles.pass} onClick={nextPlayer} disabled={!isMyTurn || !myCards[0].number || totalMoney <=0}>pass</button>
	</>;
	if(my3edCards.imgName) {
		the3edCardDev = <img src={`/images/pocker/${my3edCards.imgName}`} />;
	}

	let theDealCardDev = <>
		<button className={'btn '+'btn-red-outline '+styles.deal} onClick={dealCards} disabled={!isMyTurn || myCards[0].number}>重新發牌</button>
	</>
	if(totalMoney <= 0) {
		theDealCardDev = <>
			<button className={'btn '+'btn-black-outline '+styles.gameOver+' mg-right-1rem'} onClick={gameOver}>遊戲結束</button>
			<button className={'btn '+'btn-red-outline '+styles.keepGoing} onClick={keepGoing}>遊戲繼續</button>
		</>;
		if(isAnyPlayerCantPlay) {
			theDealCardDev = <button className={'btn '+'btn-black-outline '+styles.gameOver} onClick={gameOver}>遊戲結束</button>;
		}
	}else if(!isAnyPlayerCanPlay){
		theDealCardDev = <button className={'btn '+'btn-black-outline '+styles.gameOver} onClick={gameOver}>遊戲結束</button>;
	}else if(isMyTurn && (myMoney < 20 || my3edCards.imgName)){
		theDealCardDev = <button className={'btn '+'btn-black-outline '+styles.pass} onClick={nextPlayer}>完成</button>;
	}

	return (
		<>
			<Head>
				<title>射龍門</title>
			</Head>
			<div className={styles.mainContent} id="game">
				<h1 className={styles.h1}><img src={"/images/logo.png"} /></h1>
				<div className={styles.publicMoney}>${useRate(totalMoney)}</div>
				<div className={styles.gameBoard}>
					<div className={styles.card1}><img src={`/images/pocker/${myCards[0].imgName}`} /></div>
					<div className={styles.card3}>{the3edCardDev}</div>
					<div className={styles.card2}><img src={`/images/pocker/${myCards[1].imgName}`} /></div>
				</div>
				<div className={styles.bets+(myCards[0].number? " "+styles.active : "")}>
					<label className={styles.title}>下注</label>
					<div className={styles.bigOrSmallArea+(myCards[0].number==myCards[1].number? " "+styles.active : "")}>
						<span className={styles.inputRadio} onClick={(e) => setBigOrSmall('big')}>
							<input type="radio" name="bigOrSmall" value="big" onChange={(e) => setBigOrSmall('big')} checked={bigOrSmall=='big'} />大
						</span>
						<span className={styles.inputRadio} onClick={(e) => setBigOrSmall('small')}>
							<input type="radio" name="bigOrSmall" value="small" onChange={(e) => setBigOrSmall('small')} checked={bigOrSmall=='small'} />小
						</span>
					</div>
					<div className={styles.coin+(bets==10? " "+styles.active : "")} onClick={() => setBets(10)}>$10</div>
					<div className={styles.coin+(bets==30? " "+styles.active : "")} onClick={() => setBets(30)}>$30</div>
					<div className={styles.coin+(bets==50? " "+styles.active : "")} onClick={() => setBets(50)}>$50</div>
					<div className={styles.inputCoin+" "+(bets && bets==inputBets? styles.active : "")}>
						<button className={styles.minus} onClick={() => onChangeInputBets(inputBets-10)}>–</button>
						<input type="text" value={inputBets} />
						<button className={styles.plus} onClick={() => onChangeInputBets(inputBets+10)}>+</button>
					</div>
				</div>
				<div className={styles.dealCards}>
					{theDealCardDev}
				</div>
				<table className={styles.privateMoney} id="moneyTable">
					<tbody>
					{
						playersMoney.map( (groups, index) => {
							return(
								<tr key={index}>
									{
										groups.map((plmny,index) => {
											return (<PlayerMoney key={index} playerData={plmny} currentPlayer={currentPlayer} baseMyMoney={baseMyMoney} />)
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
				<h1 className={styles.h1}><img src={"/images/logo.png"} /></h1>
				<div className={styles.publicMoney}>${totalMoney}</div>
				<table>
					<thead>
						<tr>
							<th>排名</th>
							<th>玩家</th>
							<th>$$</th>
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
								<tr key={index}>
									<td>{index+1}</td>
									<td>{rankName}</td>
									<td>{baseMyMoney}</td>
									<td>{totalMyMoneyText}</td>
								</tr>
							)
						})
					}
					</tbody>
				</table>
				<button className={'btn '+'btn-red-outline '+styles.newGame} onClick={newGame}>重新遊戲</button>
			</div>
		</>
	)
}
