import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import ConnectWallet from './Pages/ConnectWallet/ConnectWallet'
import { useState } from 'react'
import { Routes, Route } from "react-router-dom";
import Homepage from "./Pages/Homepage/Homepage"
import Profile from "./Pages/Profile/Profile"
import SavedPosts from "./Pages/SavedPosts/SavedPosts"
import PostDetail from "./Pages/PostDetail/PostDetail"
import CreateProfile from './Pages/CreateProfile/CreateProfile'


const chains = [sepolia]
const projectId = '641b78ab05eb8ddcdc68fc15be6cd561'

const { publicClient } = configureChains(chains, [w3mProvider({ projectId })])
const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient
})
const ethereumClient = new EthereumClient(wagmiConfig, chains)

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [accountAddress, setAccountAddress] = useState(null);
  return (
    <div className='App'>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <WagmiConfig config={wagmiConfig}>
                <ConnectWallet
                  setIsConnected={setIsConnected}
                  setAccountAddress={setAccountAddress}
                />
                <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
              </WagmiConfig>
            </>
          }
        />
        <Route
          path='/createprofile'
          element={<CreateProfile />}
        />
        <Route
          path='/homepage'
          element={<Homepage />}
        />
        <Route
          path='/homepage/:id'
          element={<PostDetail />}
        />
        <Route
          path='/profile'
          element={<Profile />}
        />
        <Route
          path='/savedposts'
          element={<SavedPosts />}
        />
        <Route
          path='/savedposts/:id'
          element={<PostDetail />}
        />
      </Routes>
    </div>
  )
}
export default App
