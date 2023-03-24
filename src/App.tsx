
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import {sequence} from '0xsequence'

import { SequenceIndexerClient } from '@0xsequence/indexer'

const indexer = new SequenceIndexerClient('https://polygon-indexer.sequence.app')

function App() {
  const [score, setScore] = useState(0);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [foodPosition, setFoodPosition] = useState({ x: 0, y: 0 });
  const [fishPositions, setFishPositions] = useState([
    { x: 50, y: 50, pace: 1 },
    { x: 250, y: 250, pace: 1 },
  ]);
  const [address, setAddress] = React.useState<any>(null)

  const gameBoardRef: any = useRef();

  useEffect(() => {
    if(address){
      loadBalance()
    }
  }, [address])

  useEffect(() => {
    if (isGameRunning) {
      const intervalId = setInterval(() => {
        setFoodPosition(prevPos => {
          const newX = Math.floor(Math.random() * gameBoardRef!.current!.clientWidth);
          const newY = Math.floor(Math.random() * gameBoardRef!.current!.clientHeight);
          return { x: newX, y: newY };
        });
      }, 4000);
      return () => clearInterval(intervalId);
    }
  }, [isGameRunning]);

  useEffect(() => {
    if (isGameRunning) {
      const intervalId = setInterval(() => {
        setFishPositions(prevPositions => {
          const newPositions = prevPositions.map(prevPos => {
            const dx = foodPosition.x - prevPos.x;
            const dy = foodPosition.y - prevPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= prevPos.pace && foodPosition.x != 0) {
              setScore(prevScore => prevScore + 1);
              setFoodPosition({ x: 0, y: 0 });
              return prevPos;
            } else {
              const newX = prevPos.x + (dx / distance) * prevPos.pace;
              const newY = prevPos.y + (dy / distance) * prevPos.pace;
              return { x: newX, y: newY, pace: prevPos.pace };
            }
          });
          return newPositions;
        });
      }, 50);
      return () => clearInterval(intervalId);
    }
  }, [isGameRunning, foodPosition]);

  const handleGameBoardClick = (e: any) => {
    const clickPosition = { x: e.clientX, y: e.clientY };
    setFoodPosition(clickPosition);
  };

  const loadBalance = async () => {

    // query Sequence Indexer for all token balances of the account on Polygon
    const tokenBalances = await indexer.getTokenBalances({
        accountAddress: address,
        includeMetadata: true
    })

    // query Sequence Indexer for the MATIC balance on Polygon
    const balance = await indexer.getEtherBalance({
      accountAddress: address,
    })
      
    const pace: any = {
      polygon: 0,
      usdc: 0 
    }

    // token balance store
    const ownerBalance = {
      usdc: 0
    }

    tokenBalances.balances.map((token: any) => {
      if(token.contractAddress == "0x2791bca1f2de4661ed88a30c99a7a9449aa84174"){
        console.log('usdc')
        console.log(token)
        ownerBalance.usdc = token.balance
      }
    })

    pace.polygon = Number((BigInt(balance!.balance!.balanceWei)/BigInt(10e18))) / Number(BigInt(BigInt(balance.balance.balanceWei)/BigInt(10e18) + BigInt(ownerBalance.usdc)/BigInt(1e5)))
    pace.usdc = Number(BigInt(ownerBalance.usdc)/BigInt(1e5)) / Number(BigInt(BigInt(balance.balance.balanceWei)/BigInt(10e18) + BigInt(ownerBalance.usdc)/BigInt(1e5)))

    setFishPositions([
      { x: 50, y: 50, pace: Math.max(Number(pace.polygon)*5, 7) },
      { x: 250, y: 250, pace: Math.max(Number(pace.polygon)*5, 7) },
    ])
  }

  sequence.initWallet('polygon')

  const login = async () => {
    const wallet = await sequence.getWallet()
    const connectDetails = await wallet.connect({
      app: 'OpenReef',
      authorize: true,
      // And pass settings if you would like to customize further
      settings: {
        theme: "blue",
        bannerUrl: "https://bafkreiemxvi6sorur3bqjyoro2z2hybtgiffzsaycyd2k3rxe7vcrzb3ia.ipfs.nftstorage.link/",  // 3:1 aspect ratio, 1200x400 works best
      }
    })
    setAddress(connectDetails.session?.accountAddress)
    setIsGameRunning(true)
    setFoodPosition(prevPos => {
      const newX = Math.floor(Math.random() * gameBoardRef!.current!.clientWidth);
      const newY = Math.floor(Math.random() * gameBoardRef!.current!.clientHeight);
      return { x: newX, y: newY };
    });
  }

  return (
    <div>
      <button className="login" onClick={() => login()}>{address ? address.slice(0,6)+'...' : 'login'}</button>
      <h1>Fish Food Game</h1>
      <p>Score: {score}</p>
      <div
        ref={gameBoardRef}
        style={{ height: '500px', width: '500px', backgroundColor: '#ADD8E6', position: 'relative' }}
        onClick={handleGameBoardClick}
      >
        {foodPosition.x !== 0 && (
          <p style={{
            position: 'absolute',
            top: foodPosition.y - 25,
            left: foodPosition.x - 25,
            width: '10px',
            height: '10px',
          }} id='food'>🟓</p>
        )}
        {fishPositions.map((fishPosition, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: fishPosition.y - 25,
              left: fishPosition.x - 25,
              fontSize: '50px',
            }}
          >
            🐟
          </div>
        ))}
      </div>
      </div>
  )
}

export default App;