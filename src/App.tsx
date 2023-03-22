import React from 'react';

import angelFish from './angel_fish.png'
import octopus from './mr_octopus.png'
import seaHorse from './sea_horse.png'

import './App.css';
import {sequence} from '0xsequence'

function App() {

  const [address, setAddress] = React.useState<any>(null)
  React.useEffect(() => {
    let interval = setInterval(() => {
      console.log('swimming...')
      document.getElementById('angel-fish')!.style.webkitTransform = "translate3d("+window.innerWidth/2*(Math.random() < 0.5 ? -1 * Math.random() : 1 * Math.random())+"px,"+ window.innerHeight*(Math.random() < 0.5 ? -1 * Math.random() : 1 * Math.random()) + "px, 0px)"
      document.getElementById('seahorse')!.style.webkitTransform = "translate3d("+window.innerWidth/2*(Math.random() < 0.5 ? -1 * Math.random() : 1 * Math.random())+"px,"+ window.innerHeight*(Math.random() < 0.5 ? -1 * Math.random() : 1 * Math.random()) + "px, 0px)"
      document.getElementById('mr-octopus')!.style.webkitTransform = "translate3d("+window.innerWidth/2*(Math.random() < 0.5 ? -1 * Math.random() : 1 * Math.random())+"px,"+ window.innerHeight*(Math.random() < 0.5 ? -1 * Math.random() : 1 * Math.random()) + "px, 0px)"
    }, 7000)
    return () => clearInterval(interval)
  })

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
    console.log('user accepted connect?', connectDetails.connected)
  }
  return (
    <div className="App">
      <button className="login" onClick={() => login()}>{address ? address.slice(0,6)+'...' : 'login'}</button>
      <img className="fish" id="angel-fish" width="17%" src={angelFish} />
      <img className="fish" id="mr-octopus" width="17%" src={octopus} />
      <img className="fish" id="seahorse" width="17%" src={seaHorse} />
    </div>
  );
}

export default App;
