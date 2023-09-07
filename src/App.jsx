import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains, createConfig, WagmiConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import ConnectWallet from './Pages/ConnectWallet/ConnectWallet'
import { useState, useEffect } from 'react'
import { Routes, Route } from "react-router-dom";
import Homepage from "./Pages/Homepage/Homepage"
import Profile from "./Pages/Profile/Profile"
import SavedPosts from "./Pages/SavedPosts/SavedPosts"
import PostDetail from "./Pages/PostDetail/PostDetail"
import CreateProfile from './Pages/CreateProfile/CreateProfile'
import CreatePost from './Pages/CreatePost/CreatePost'
import SearchProfiles from './Pages/SearchProfiles/SearchProfiles'
import EditProfile from './Pages/EditProfile/EditProfile'
import { publicProvider } from "wagmi/providers/public";
import { ethers } from "ethers";
import { contractAddress, contractABI } from './constant.js'


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
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileCreated, setIsProfileCreated] = useState(null);

  async function loadBcData() {
    try {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        setSigner(signer);
        const contractInstance = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        console.log(contractInstance);
        setContract(contractInstance);
        setIsLoading(false);
        const address = await signer.getAddress();
        console.log("Metamask Connected to " + address);
        setAccountAddress(address);
      } else {
        const provider = new ethers.providers.Web3Provider(publicProvider);
        const signer = provider.getSigner();
        setSigner(signer);
        const contractInstance = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );
        console.log(contractInstance);
        setContract(contractInstance);
        setIsLoading(false);
        const address = await signer.getAddress();
        console.log("Public Provider Connected to " + address);
        setAccountAddress(address);
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  }

  useEffect(() => {
    loadBcData();
  }, []);

  return (
    <div className='App'>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <WagmiConfig config={wagmiConfig}>
                <ConnectWallet
                  contract={contract}
                  setIsConnected={setIsConnected}
                  setAccountAddress={setAccountAddress}
                  setIsProfileCreated={setIsProfileCreated}
                />
                <Web3Modal projectId={projectId} ethereumClient={ethereumClient} />
              </WagmiConfig>
            </>
          }
        />
        <Route
          path='/createprofile'
          element={<CreateProfile contract={contract} />}
        />
        <Route
          path='/createpost'
          element={<CreatePost contract={contract} accountAddress={accountAddress} />}
        />
        <Route
          path='/homepage'
          element={<Homepage contract={contract} accountAddress={accountAddress} />}
        />
        <Route
          path='/homepage/:postId'
          element={<PostDetail contract={contract} accountAddress={accountAddress}/>}
        />
        {/* <Route
          path='/profile'
          element={<Profile contract={contract} accountAddress={accountAddress} />}
        /> */}
        <Route
          path='/profile/editprofile'
          element={<EditProfile contract={contract} accountAddress={accountAddress} />}
        />
        <Route
          path='/searchprofiles'
          element={<SearchProfiles contract={contract} accountAddress={accountAddress} />}
        />
        <Route
          path='/savedposts'
          element={<SavedPosts contract={contract} accountAddress={accountAddress} />}
        />
        <Route
          path='/savedposts/:postId'
          element={<PostDetail />}
        />
        <Route
          path='/profile/:accountAddress'
          element={<Profile contract={contract} myAddress={accountAddress} />}
        />
      </Routes>
    </div>
  )
}
export default App
