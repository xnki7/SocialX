import React from 'react'
import { Web3Button } from '@web3modal/react'
import { useAccount } from 'wagmi'
import { useNavigate } from "react-router-dom";
import "./ConnectWallet.css"
import logo from "./SocialX.png"

const ConnectWallet = ({ setIsConnected, setAccountAddress }) => {
    const navigate = useNavigate();
    const account = useAccount({
        onConnect({ address }) {
            setIsConnected(true);
            setAccountAddress(address);
            console.log('Connected', { address });
            navigate('/createprofile')
        },
    })
    return <div className="ConnectWallet">
        <img src={logo} />
        <Web3Button />
        <p className="footer">Made Just for You, Filled with ❤️</p>
    </div>
}

export default ConnectWallet