import React from 'react'
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import "./Navbar.css"
import home from "./home.svg"
import plus from "./plus.svg"
import search from "./search.svg"

const Navbar = ({ contract, accountAddress }) => {
    const [profileData, setProfileData] = useState(null);
    const getProfileData = async () => {
        const tx = await contract.getUserProfile(accountAddress);
        console.log(tx);
        fetchProfileMetadata(tx.userProfileCID);
    }
    const fetchProfileMetadata = async (postURI) => {
        try {
            const response = await axios.get(`https://ipfs.io/ipfs/${postURI}`);
            const metadata = response.data;
            setProfileData(metadata);
        } catch (error) {
            console.error("Error fetching Post metadata:", error);
            return null;
        }
    };
    useEffect(() => {
        if (contract && accountAddress) {
            getProfileData();
            console.log(accountAddress);
        }
    }, [contract, accountAddress])
    return (
        <div className='Navbar'>
            <div className="subNavbar">
                <div className="sub2Navbar">
                    <Link to="/homepage">
                        <img className='navIcons' src={home} alt="" />
                    </Link>
                    <Link to="/searchprofiles">
                        <img className='navIcons' src={search} alt="" />
                    </Link>
                    <Link to="/createpost">
                        <img className='navIcons' src={plus} alt="" />
                    </Link>
                    <Link to={`/profile/${accountAddress}`}>
                        {profileData && profileData.imageCID ? <img className='navIcons profileIcon' src={`https://ipfs.io/ipfs/${profileData.imageCID}`} alt="" /> : <img className='navIcons profileIcon' src="Images/Profile.svg" alt="" /> }
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Navbar