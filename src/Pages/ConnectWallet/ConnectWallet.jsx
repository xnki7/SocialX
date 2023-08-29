import React from 'react'
import { Web3Button } from '@web3modal/react'
import { useAccount } from 'wagmi'
import { useNavigate } from "react-router-dom";
import "./ConnectWallet.css"
import logo from "./SocialX.png"

const ConnectWallet = ({ contract, setIsConnected, setAccountAddress, setIsProfileCreated }) => {
    const navigate = useNavigate();
    const account = useAccount({
        onConnect({ address }) {
            setIsConnected(true);
            setAccountAddress(address);
            getIsProfileCreated(address);
            console.log('Connected', { address });
        },
    })
    const getIsProfileCreated = async (address) => {
        const tx = await contract.getIsProfileCreated(address);
        setIsProfileCreated(tx);
        if (tx === false) {
            navigate('/createprofile');
        }
        else {
            navigate('/homepage')
        }
    }
    return <div className="ConnectWallet">
        <img src={logo} />
        <Web3Button />
        <p className="footer">Made Just for You, Filled with ❤️</p>
    </div>
}

export default ConnectWallet