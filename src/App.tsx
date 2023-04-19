
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { ethers } from 'ethers'
import { sequence } from '0xsequence'

import { SequenceIndexerClient } from '@0xsequence/indexer'

import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import goldfish from './assets/4.png'
import pf_rainbow from './assets/0.png'
import pf_cyan from './assets/1.png'
import pf_pink from './assets/2.png'
import pf_blue from './assets/3.png'

const indexer = new SequenceIndexerClient('https://mumbai-indexer.sequence.app')

function App() {
  const [score, setScore] = useState(0);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [foodPosition, setFoodPosition] = useState({ x: 0, y: 0 });
  const [goldfishPositions, setGoldfishPositions] = useState<any>([])
  const [parrotFishPositions, setParrotFishPositions] = useState<any>([]);
  const [address, setAddress] = React.useState<any>(null)
  const [joyBalance, setJoyBalance] = useState<any>(0)
  const [goldfishBalance, setGoldfishBalance] = useState<any>(0)
  const [parrotFishBalance, setParrotFishBalance] = useState<any>(0)
  const [init, setInit] = useState<boolean>(false)

  const gameBoardRef: any = useRef();

  useEffect(() => {
    console.log(init)
    console.log()
    if((!init) && address){
      setInit(true)
      loadBalance()
    }
  }, [address, init])

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
        setGoldfishPositions((prevPositions: any) => {
          const newPositions = prevPositions.map((prevPos: any) => {
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
              return { x: newX, y: newY, pace: prevPos.pace, image: prevPos.image };
            }
          });
          return newPositions;
        });

        setParrotFishPositions((prevPositions: any) => {
          const newPositions = prevPositions.map((prevPos: any) => {
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
              return { x: newX, y: newY, pace: prevPos.pace, tokenID: prevPos.tokenID, image: prevPos.image };
            }
          });
          return newPositions;
        });

      }, 50);
      return () => clearInterval(intervalId);
    }
  }, [isGameRunning, foodPosition]);

  const handleGameBoardClick = (e: any) => {
    const clickPosition = { x: e.clientX-64, y: e.clientY -84};
    setFoodPosition(clickPosition);
  };

  const loadBalance = async () => {

    // query Sequence Indexer for all token balances of the account on Polygon
    const tokenBalancesERC1155 = await indexer.getTokenBalances({
        accountAddress: address,
        contractAddress: '0x5d3ff8b04961797407a32d3fbab8a1f53db885e3',
        includeMetadata: true
    })

    setParrotFishPositions([])
    setGoldfishPositions([])

    tokenBalancesERC1155.balances.map((token) => {

      const tokenBalance = Number(token.balance)

      for(let i = 0; i < tokenBalance; i++){
        const image = token.tokenMetadata!.image
        setParrotFishPositions((prev: any ) => [...prev, { x: Math.random()*500, y: Math.random()*500, pace: 1, tokenID: token.tokenID, image: token.tokenMetadata!.image}])
      }
    })

    const tokenBalancesERC721 = await indexer.getTokenBalances({
        accountAddress: address,
        contractAddress: '0xc42ae8452f5057212a7c313589df6c9b83660aa3',
        includeMetadata: true
    })

    tokenBalancesERC721.balances.map((balance) => {


      setGoldfishPositions((prev: any ) => [...prev, { x: Math.random()*500, y: Math.random()*500, pace: 4, image: balance.tokenMetadata!.image }])
    })

  }

  sequence.initWallet('mumbai')

  const login = async () => {
    const wallet = await sequence.getWallet()
    const connectDetails = await wallet.connect({
      app: 'OpenReef',
      authorize: true,
      networkId: 80001,
      settings: {
        theme: "blue",
        bannerUrl: "https://bafkreiemxvi6sorur3bqjyoro2z2hybtgiffzsaycyd2k3rxe7vcrzb3ia.ipfs.nftstorage.link/",  // 3:1 aspect ratio, 1200x400 works best
      }
    })
    setAddress(connectDetails.session?.accountAddress)
    setIsGameRunning(true)
    setInit(false)
    setFoodPosition(prevPos => {
      const newX = Math.floor(Math.random() * gameBoardRef!.current!.clientWidth);
      const newY = Math.floor(Math.random() * gameBoardRef!.current!.clientHeight);
      return { x: newX, y: newY };
    });
  }

  React.useEffect(() => {
    if(!init){
      setInit(true)
      setBalances()
    }

  }, [address, init])

  const setBalances = async () => {
    if(address){

      const tokenBalances = await indexer.getTokenBalances({
          accountAddress: address,
          includeMetadata: true
      })

      console.log(tokenBalances)

      tokenBalances.balances.map((token: any) => {
        // joy balance
        if(token.contractAddress == "0xa1767a6c3de0c07712bacd48423d5aad74081237") {
          setJoyBalance(Number(BigInt(token.balance)/BigInt(1e18)))
        }
        // goldfish balance
        if(token.contractAddress == "0xc42ae8452f5057212a7c313589df6c9b83660aa3") {
          console.log(token)
          setGoldfishBalance(token.balance)
        }
        // parrotfish balance
        // console.log(token.contractAddress == '0x5d3ff8b04961797407a32d3fbab8a1f53db885e3')
        if(token.contractAddress == "0x5d3ff8b04961797407a32d3fbab8a1f53db885e3"){
          console.log(token)
          setParrotFishBalance(token.balance)
        }
      })
    }
  }

  const claimERC20 = async () => {
    const joyContractAddress = '0xA1767A6C3dE0c07712bAcD48423D5Aad74081237'

    const wallet = await sequence.getWallet()

    // Craft your transaction
    const erc721Interface = new ethers.utils.Interface([
      'function claim() public returns(bool)'
    ])

    const data = erc721Interface.encodeFunctionData(
      'claim', []
    )

    const txn = {
      to: joyContractAddress,
      data: data
    }

    const signer = wallet.getSigner()

    const res = await signer.sendTransaction(txn)

    setTimeout(() => {
      setInit(false)
    },5000)
  }

  const claimERC721 = async () => {
    const aquariumERC721ContractAddress = '0xc42ae8452f5057212a7c313589df6c9b83660aa3'
    const joyContractAddress = '0xA1767A6C3dE0c07712bAcD48423D5Aad74081237'

    const wallet = await sequence.getWallet()

    // Craft your transaction
    const erc20Interface = new ethers.utils.Interface([
      'function approve(address spender, uint256 amount) public returns (bool)'
    ])

    const data20 = erc20Interface.encodeFunctionData(
      'approve', [aquariumERC721ContractAddress, "100000000000000000000"]
    )

    // Craft your transaction
    const erc721Interface = new ethers.utils.Interface([
      'function claimNFT() public returns(bool)'
    ])

    const data = erc721Interface.encodeFunctionData(
      'claimNFT', []
    )

    const txn1 = {
      to: joyContractAddress,
      data: data20
    }

    const txn2 = {
      to: aquariumERC721ContractAddress,
      data: data
    }

    const signer = wallet.getSigner()

    const res = await signer.sendTransactionBatch([txn1, txn2])
    console.log(res)
    // trigger get balance
    setTimeout(() => {
      setInit(false)
    },3000)
  }

  const claimERC1155 = async (claimType: string) => {
    console.log('claiming')
    let id;
    switch(claimType){
      case 'rainbow':
        id = 0;
        break;
      case 'cyan':
        id = 1;
        break;
      case 'pink':
        id = 2;
        break;
      case 'blue':
        id = 3;
        break;
    }

    const aquarium1155ContractAddress = '0x5d3ff8b04961797407a32d3fbab8a1f53db885e3'
    const joyContractAddress = '0xA1767A6C3dE0c07712bAcD48423D5Aad74081237'

    const wallet = await sequence.getWallet()

    // Craft your transaction
    const erc20Interface = new ethers.utils.Interface([
      'function approve(address spender, uint256 amount) public returns (bool)'
    ])

    const data20 = erc20Interface.encodeFunctionData(
      'approve', [aquarium1155ContractAddress, "200000000000000000000"]
    )

    // Craft your transaction
    const erc1155Interface = new ethers.utils.Interface([
      'function claim(address _address, uint _id) public returns (bool)'
    ])

    const data = erc1155Interface.encodeFunctionData(
      'claim', [address, id]
    )

    const txn1 = {
      to: joyContractAddress,
      data: data20
    }

    const txn2 = {
      to: aquarium1155ContractAddress,
      data: data
    }

    const signer = wallet.getSigner()

    const res = await signer.sendTransactionBatch([txn1, txn2])
    console.log(res)
    // trigger get balance
    setTimeout(() => {
      setInit(false)
    },3000)

  }

  return (
    <div>
      <Container>
        <Row>
          <Col>
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

              {goldfishPositions.map((fishPosition: any, index: number) => (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    top: fishPosition.y - 25,
                    left: fishPosition.x - 25,
                    width: '10px',
                    height: '10px',
                    fontSize: '50px',
                  }}
                >
                  <img src={fishPosition.image} width={'60px'}/>
                </div>
              ))}
              {parrotFishPositions.map((fishPosition: any, index: number) => (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    top: fishPosition.y - 25,
                    left: fishPosition.x - 25,
                    fontSize: '50px',
                  }}
                >
                  <img src={fishPosition.image} width={'60px'}/>
                </div>
              ))}
            </div>
          </Col>
          <Col>
          <br/>
          <br/>
          <br/>
          <br/>
          {!address ? null:
          <>
            <Row>
              <Col>Joy Balance: {joyBalance}</Col>
              <Col>Goldfish Balance: {goldfishBalance}</Col>
              <Col>Parrotfish Balance: {parrotFishBalance}</Col>
            </Row>
            <Row>
              <Col>
                <br/>
                <p>ERC20</p>
                <button className='buy-button' onClick={() => claimERC20()}>claim JOY faucet</button>
                <br/>
              </Col>
            <hr/>
            </Row>
            <Row>
            <Row>

              <Col>
                  <br/>
                  <p>ERC721 - 10 JOY</p>
                  <button className='buy-button' onClick={() => claimERC721()}>buy goldfish</button>
                  <br/>
              </Col>
            </Row>
            <hr/>

              <Col>
                <p>ERC1155 - 20 JOY</p>
                <button className='buy-button' onClick={()=> claimERC1155('rainbow')}>buy rainbow parrotfish</button>
                <br/>
                <button className='buy-button' onClick={()=> claimERC1155('cyan')}>buy cyan parrotfish</button>

              </Col>
              <Col>
                <p style={{color: 'white'}}>ERC1155</p>
                <button className='buy-button' onClick={()=> claimERC1155('pink')}>buy pink parrotfish</button>
                <br/>

                <button className='buy-button' onClick={()=> claimERC1155('blue')}>buy blue parrotfish</button>
              </Col>
            </Row>
          </>
          }
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default App;