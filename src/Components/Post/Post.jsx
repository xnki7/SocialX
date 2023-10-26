import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import like from "./Images/Like.svg";
import liked from "./Images/Liked.svg";
import save from "./Images/Save.svg";
import saved from "./Images/Saved.svg";
import comment from "./Images/Comment.svg";
import deleteIcon from "./Images/deleteIcon.svg";
import flag from "./Images/flag.svg"
import flagged from "./Images/flagged.svg"
import "./Post.css";

const Post = ({ postId, contract, postOwner, timestamp, textContent, postPicCIDs, accountAddress }) => {
    const [profileData, setProfileData] = useState(null);
    const [likesNumber, setLikesNumber] = useState(0);
    const [commentsNumber, setCommentsNumber] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isReported, setIsReported] = useState(false);

    const showArrows = postPicCIDs && postPicCIDs.length > 1;

    const nextImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === postPicCIDs.length - 1 ? 0 : prevIndex + 1
        );
    };

    const prevImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? postPicCIDs.length - 1 : prevIndex - 1
        );
    };


    const getProfileData = async () => {
        try {
            const tx = await contract.getUserProfile(postOwner);
            console.log(tx);
            fetchProfileMetadata(tx.userProfileCID);
        } catch (error) {
            console.error("Error getting profile data:", error);
            setIsLoading(false);
        }
    }

    const getLikesNumber = async () => {
        try {
            const tx = await contract.getLikesNumber(postId);
            setLikesNumber(tx);
            getIsPostLiked();
            getIsPostSaved();
        } catch (error) {
            console.error("Error getting likes number:", error);
            setIsLoading(false);
        }
    }

    const getIsPostLiked = async () => {
        try {
            const tx = await contract.UserLikedPost(postId);
            setIsLiked(tx);
        } catch (error) {
            console.error("Error getting post liked status:", error);
        }
    }

    const getIsPostSaved = async () => {
        try {
            const tx = await contract.getIsPostSaved(postId);
            setIsSaved(tx);
        } catch (error) {
            console.error("Error getting post saved status:", error);
        }
    }

    const getIsPostReported = async () => {
        try {
            const tx = await contract.isReported(postId);
            setIsReported(tx);
        } catch (error) {
            console.log("Error in getting post report data", error);
        }
    }

    const getCommentsNumber = async () => {
        try {
            const tx = await contract.getCommentsNumber(postId);
            setCommentsNumber(tx);
        } catch (error) {
            console.error("Error getting comments number:", error);
        }
    }

    const savePost = async () => {
        setIsLoading(true);
        try {
            const tx = await contract.savePost(postId);
            await tx.wait();
            setIsSaved(true);
            setIsLoading(false);
        } catch (error) {
            console.error("Error saving post:", error);
            setIsLoading(false);
        }
    }

    const likePost = async () => {
        setIsLoading(true);
        try {
            const tx = await contract.likePost(postId);
            await tx.wait();
            setLikesNumber((prevLikes) => ++prevLikes);
            setIsLiked(true);
            setIsLoading(false);
        } catch (error) {
            console.error("Error liking post:", error);
            setIsLoading(false);
        }
    }

    const deletePost = async () => {
        setIsLoading(true);
        try {
            const tx = await contract.deletePost(postId);
            await tx.wait();
            setIsLoading(false);
            window.location.reload();
        } catch (error) {
            console.error("Error deleting post:", error);
            setIsLoading(false);
        }
    }

    const reportPost = async () => {
        setIsLoading(true);
        try {
            const tx = await contract.reportPost(postId);
            await tx.wait();
            setIsLoading(false);
            window.location.reload();
        } catch (error) {
            console.error("Error reporting post:", error);
            setIsLoading(false);
        }
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
            getIsPostReported();
        }
    }, [])

    return (
        <div className='Post'>
            {isLoading ? (
                <>
                    <div className="loader">
                        <svg viewBox="25 25 50 50">
                            <circle r={20} cy={50} cx={50} />
                        </svg>
                        <div className="overlay"></div>
                    </div>
                    <div className="Header">
                        <Link to={`/profile/${postOwner}`} style={{ textDecoration: "none", marginLeft: "3%" }}>
                            {profileData && profileData.imageCID ? <img src={`https://ipfs.io/ipfs/${profileData.imageCID}`} alt="" className='profileImage' /> : <></>}
                        </Link>
                        <div className='uNameContainer'>
                            <Link to={`/profile/${postOwner}`} style={{ textDecoration: "none", color: "white" }}>
                                {profileData && profileData.userName ? <p className="username">{profileData.userName}1234</p> : <></>}
                            </Link>
                            <p className="timestamp">{formatDate(timestamp)}</p>
                        </div>
                        {/* <p className="address">{postOwner}</p> */}
                    </div>

                    <div className="content">
                        {showArrows && (
                            <button onClick={prevImage} className="carousel-button prev-button">
                                &lt;
                            </button>
                        )}
                        {postPicCIDs ? (
                            <Link to={`/homepage/${postId}`}>
                                <img
                                    className="postImage"
                                    src={`https://ipfs.io/ipfs/${postPicCIDs[currentImageIndex]}`}
                                    alt=""
                                />
                            </Link>
                        ) : (
                            <></>
                        )}
                        {showArrows && (
                            <button onClick={nextImage} className="carousel-button next-button">
                                &gt;
                            </button>
                        )}
                    </div>
                    <div className="footer">
                        <div className='postContainers'>
                            <div className='likeCommentBtnContainer'>
                                <button className='postBtns' disabled={isLiked} onClick={likePost}>
                                    {isLiked ? <img src={liked} /> : <img src={like} />}
                                </button>

                                <button className="postBtns">
                                    <Link to={`/homepage/${postId}`}>
                                        <img src={comment} alt="" />
                                    </Link>
                                </button>
                            </div>

                            <button className='postBtns' disabled={isSaved} onClick={savePost}> {isSaved ? <img src={saved} /> : <img src={save} />}</button>
                        </div>
                        <div className='likeCmtCountContainer postContainers'>
                            <p className="likecount count">{likesNumber.toString() + " "} <span className='countlabel'>Likes</span> </p>
                            <p>.</p>
                            <p className="commentcount count">{commentsNumber.toString() + " "} <span className='countlabel'><Link to={`/homepage/${postId}`} style={{ textDecoration: "none", color: "#939394" }}>Comments</Link></span> </p>
                        </div>
                    </div>
                    <div className='nameNCaption postContainers'>
                        {profileData && profileData.userName ? <p className="username">{profileData.userName}</p> : <p>loading..</p>}
                        <p className="textContent">{textContent}</p>
                    </div>
                </>
            ) : (
                <>
                    <div className="Header">
                        <div className='profileWrapper'>
                            <Link to={`/profile/${postOwner}`} style={{ textDecoration: "none", marginLeft: "3%" }}>
                                {profileData && profileData.imageCID ? <img src={`https://ipfs.io/ipfs/${profileData.imageCID}`} alt="" className='profileImage' /> : <></>}
                            </Link>
                            <div className='uNameContainer'>
                                <Link to={`/profile/${postOwner}`} style={{ textDecoration: "none", color: "white" }}>
                                    {profileData && profileData.userName ? <p className="username">{profileData.userName}</p> : <></>}
                                </Link>
                                <p className="timestamp">{formatDate(timestamp)}</p>
                            </div>
                        </div>
                        {
                            (accountAddress === postOwner ? <div><img className='delRepIcon' src={deleteIcon} alt="" onClick={deletePost} /></div> : <><img src={flag} className='delRepIcon' onClick={reportPost}/></>)
                            // ****************
                        }

                        {/* <p className="address">{postOwner}</p> */}
                    </div>

                    <div className="content">
                        {showArrows && (
                            <button onClick={prevImage} className="carousel-button prev-button">
                                &lt;
                            </button>
                        )}
                        {postPicCIDs ? (
                            <Link to={`/homepage/${postId}`}>
                                <img
                                    className="postImage"
                                    src={`https://ipfs.io/ipfs/${postPicCIDs[currentImageIndex]}`}
                                    alt=""
                                />
                            </Link>
                        ) : (
                            <></>
                        )}
                        {showArrows && (
                            <button onClick={nextImage} className="carousel-button next-button">
                                &gt;
                            </button>
                        )}
                    </div>
                    <div className="footer">
                        <div className='postContainers'>
                            <div className='likeCommentBtnContainer'>
                                <button className='postBtns' disabled={isLiked} onClick={likePost}>
                                    {isLiked ? <img src={liked} /> : <img src={like} />}
                                </button>

                                <button className="postBtns">
                                    <Link to={`/homepage/${postId}`}>
                                        <img src={comment} alt="" />
                                    </Link>
                                </button>
                            </div>

                            <button className='postBtns' disabled={isSaved} onClick={savePost}> {isSaved ? <img src={saved} /> : <img src={save} />}</button>
                        </div>
                        <div className='likeCmtCountContainer postContainers'>
                            <p className="likecount count">{likesNumber.toString() + " "} <span className='countlabel'>Likes</span> </p>
                            <p>.</p>
                            <p className="commentcount count">{commentsNumber.toString() + " "} <span className='countlabel'><Link to={`/homepage/${postId}`} style={{ textDecoration: "none", color: "#939394" }}>Comments</Link></span> </p>
                        </div>
                    </div>
                    <div className='nameNCaption postContainers'>
                        {profileData && profileData.userName ? <p className="username">{profileData.userName}</p> : <p>loading..</p>}
                        <p className="textContent">{textContent}</p>
                    </div>
                </>
            )}
        </div>
    )
}

export default Post;
