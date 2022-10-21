import { useEffect, useState, useRef } from 'react';

export default function useRate(value, defaultRate=0) {
	const [rate,setRate]=useState(0);
	const mounted=useRef();
	const tm=useRef();
	const tmTwo=useRef();

	useEffect(()=>{
		if(!mounted.current){ //componentDidMount
			setRate(defaultRate);
			mounted.current=true;
		}else{
			let minus = 1;
			if(rate-value < -50 || 50 < rate-value){
				minus = 10;
			}
			if(rate>value){
				if(tm.current){
					clearTimeout(tm.current);
				}
				tmTwo.current=setTimeout(()=>{setRate(rate-minus)},20);
			}
			else if(rate<value){
				if(tmTwo.current){
					clearTimeout(tmTwo.current);
				}
				tm.current=setTimeout(()=>{setRate(rate+minus)},20);
			}
		}
	},[value,rate]);

	return rate;
}