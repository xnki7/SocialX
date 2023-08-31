import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./Post.css";

const Post = ({ postId, contract, postOwner, timestamp, textContent, postPicCIDs }) => {
    const [profileData, setProfileData] = useState(null);
    const [likesNumber, setLikesNumber] = useState(0);
    const [commentsNumber, setCommentsNumber] = useState(0);
    const [isLiked, setIsLiked] = useState(false);

    const getProfileData = async () => {
        const tx = await contract.getUserProfile(postOwner);
        console.log(tx);
        fetchProfileMetadata(tx.userProfileCID);
    }

    const getLikesNumber = async () => {
        const tx = await contract.getLikesNumber(postId);
        setLikesNumber(tx);
        getIsPostLiked();
    }

    const getIsPostLiked = async () => {
        const tx = await contract.UserLikedPost(postId);
        setIsLiked(tx);
    }

    const getCommentsNumber = async () => {
        const tx = await contract.getCommentsNumber(postId);
        setCommentsNumber(tx);
    }

    const likePost = async () => {
        const tx = await contract.likePost(postId);
        tx.wait();
        getLikesNumber();
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

    const formatMonth = (timestamp) => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const dateObject = new Date(timestamp * 1000); // Convert seconds to milliseconds
        return months[dateObject.getMonth()];
    }

    const formatDate = (timestamp) => {
        const day = new Date(timestamp * 1000).getDate();
        const monthAbbreviation = formatMonth(timestamp);
        return `${day} ${monthAbbreviation}`;
    }


    useEffect(() => {
        if (contract) {
            getProfileData();
            getLikesNumber();
            getCommentsNumber();
        }
    }, [])

    return (
        <div className='Post'>
            <div className="header">
                {profileData && profileData.imageCID ? <img src={`https://ipfs.io/ipfs/${profileData.imageCID}`} alt="" /> : <p>loading..</p>}
                {profileData && profileData.userName ? <p className="username">{profileData.userName}</p> : <p>loading..</p>}
                <p className="timestamp">{formatDate(timestamp)}</p>
                <p className="address">{postOwner}</p>
            </div>
            <div className="content">
                <p className="textContent">{textContent}</p>
                {postPicCIDs.map((pic) => { return <img key={pic} src={`https://ipfs.io/ipfs/${pic}`} alt="" /> })}
            </div>
            <div className="footer">
                <p className="likecount">{likesNumber.toString() + " "}Likes</p>
                {isLiked ? <button disabled>Liked</button> : <button onClick={likePost}>Like</button>}
                <p className="commentcount">{commentsNumber.toString() + " "}Comments</p>
            </div>
        </div>
    )
}

export default Post;
