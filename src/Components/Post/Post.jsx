import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import "./Post.css"

const Post = ({ contract, postOwner, timestamp, textContent, postPicCIDs }) => {
    const [profile, setProfile] = useState(null);
    const [profileData, setProfileData] = useState(null);

    const getProfileData = async () => {
        const tx = await contract.getUserProfile(postOwner);
        console.log(tx);
        setProfile(tx);
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
        if (contract) {
            getProfileData();
        }
    }, [])

    return (
        <div className='Post'>
            <div className="header">
                {profileData && profileData.imageCID ? <img src={`https://ipfs.io/ipfs/${profileData.imageCID}`} alt="" /> : <p>loading..</p>}
                {profile && profile.userAddress ? <p className="username">{profile.userAddress}</p> : <p>loading..</p>}
                <p className="timestamp">{timestamp.toString()}</p>
                <p className="address">{postOwner}</p>
            </div>
            <div className="content">
                <p className="textContent">{textContent}</p>
                {postPicCIDs.map((pic) => { return <img key={pic} src={`https://ipfs.io/ipfs/${pic}`} alt="" /> })}
            </div>
            <div className="footer">
                <p className="likecount"></p>
                <button>Like</button>
                <p className="commentcount"></p>
                <button>Comment</button>
            </div>
        </div>
    )
}

export default Post