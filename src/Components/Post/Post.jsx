// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Link } from 'react-router-dom';
// import "./Post.css";

// const Post = ({ postId, contract, postOwner, timestamp, textContent, postPicCIDs }) => {
//     const [profileData, setProfileData] = useState(null);
//     const [likesNumber, setLikesNumber] = useState(0);
//     const [commentsNumber, setCommentsNumber] = useState(0);
//     const [isLiked, setIsLiked] = useState(false);
//     const [isSaved, setIsSaved] = useState(false);

//     const getProfileData = async () => {
//         const tx = await contract.getUserProfile(postOwner);
//         console.log(tx);
//         fetchProfileMetadata(tx.userProfileCID);
//     }

//     const getLikesNumber = async () => {
//         const tx = await contract.getLikesNumber(postId);
//         setLikesNumber(tx);
//         getIsPostLiked();
//         getIsPostSaved();
//     }

//     const getIsPostLiked = async () => {
//         const tx = await contract.UserLikedPost(postId);
//         setIsLiked(tx);
//     }

//     const getIsPostSaved = async () => {
//         const tx = await contract.getIsPostSaved(postId);
//         setIsSaved(tx);
//     }

//     const getCommentsNumber = async () => {
//         const tx = await contract.getCommentsNumber(postId);
//         setCommentsNumber(tx);
//     }

//     const savePost = async () => {
//         const tx = await contract.savePost(postId);
//         await tx.wait();
//         setIsSaved(true);
//     }

//     const likePost = async () => {
//         const tx = await contract.likePost(postId);
//         await tx.wait();
//         setLikesNumber((prevLikes) => ++prevLikes);
//         setIsLiked(true);
//     }

//     const fetchProfileMetadata = async (postURI) => {
//         try {
//             const response = await axios.get(`https://ipfs.io/ipfs/${postURI}`);
//             const metadata = response.data;
//             setProfileData(metadata);
//         } catch (error) {
//             console.error("Error fetching Post metadata:", error);
//             return null;
//         }
//     };

//     const formatMonth = (timestamp) => {
//         const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//         const dateObject = new Date(timestamp * 1000); // Convert seconds to milliseconds
//         return months[dateObject.getMonth()];
//     }

//     const formatDate = (timestamp) => {
//         const day = new Date(timestamp * 1000).getDate();
//         const monthAbbreviation = formatMonth(timestamp);
//         return `${day} ${monthAbbreviation}`;
//     }


//     useEffect(() => {
//         if (contract) {
//             getProfileData();
//             getLikesNumber();
//             getCommentsNumber();
//         }
//     }, [])

//     return (
//         <div className='Post'>
//             <div className="Header">
//                 {profileData && profileData.imageCID ? <img src={`https://ipfs.io/ipfs/${profileData.imageCID}`} alt="" className='profileImage' /> : <p>loading..</p>}
//                 <div className='uNameContainer'>
//                     {profileData && profileData.userName ? <p className="username">{profileData.userName}</p> : <p>loading..</p>}
//                     <p className="timestamp">{formatDate(timestamp)}</p>
//                 </div>
//                 {/* <p className="address">{postOwner}</p> */}
//             </div>
//             <Link to={`/homepage/${postId}`}>
//                 <div className="content">
//                     {postPicCIDs ? postPicCIDs.map((pic) => { return <img className='postImage' key={pic} src={`https://ipfs.io/ipfs/${pic}`} alt="" /> }) : <></>}

//                 </div>
//             </Link>
//             <div className="footer">
//                 <div className='postContainers'>
//                     <div className='likeCommentBtnContainer'>
//                         <button className='postBtns' disabled={isLiked} onClick={likePost}>
//                             {isLiked ? <img src='Images/Liked.svg' /> : <img src='Images/Like.svg' />}
//                         </button>

//                         <button className="postBtns">
//                             <img src="Images/Comment.svg" alt="" />
//                         </button>
//                     </div>

//                     <button className='postBtns' disabled={isSaved} onClick={savePost}> {isSaved ? <img src='Images/Saved.svg' /> : <img src='Images/Save.svg' />}</button>
//                 </div>
//                 <div className='likeCmtCountContainer postContainers'>
//                     <p className="likecount count">{likesNumber.toString() + " "} <span className='countlabel'>Likes</span> </p>
//                     <p>.</p>
//                     <p className="commentcount count">{commentsNumber.toString() + " "} <span className='countlabel'>Comments</span> </p>
//                 </div>
//             </div>
//             <div className='nameNCaption postContainers'>
//                 {profileData && profileData.userName ? <p className="username">{profileData.userName}</p> : <p>loading..</p>}
//                 <p className="textContent">{textContent}</p>
//             </div>
//         </div>
//     )
// }

// export default Post;


import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import "./Post.css";

const Post = ({ postId, contract, postOwner, timestamp, textContent, postPicCIDs }) => {
    const [profileData, setProfileData] = useState(null);
    const [likesNumber, setLikesNumber] = useState(0);
    const [commentsNumber, setCommentsNumber] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
        const tx = await contract.getUserProfile(postOwner);
        console.log(tx);
        fetchProfileMetadata(tx.userProfileCID);
    }

    const getLikesNumber = async () => {
        const tx = await contract.getLikesNumber(postId);
        setLikesNumber(tx);
        getIsPostLiked();
        getIsPostSaved();
    }

    const getIsPostLiked = async () => {
        const tx = await contract.UserLikedPost(postId);
        setIsLiked(tx);
    }

    const getIsPostSaved = async () => {
        const tx = await contract.getIsPostSaved(postId);
        setIsSaved(tx);
    }

    const getCommentsNumber = async () => {
        const tx = await contract.getCommentsNumber(postId);
        setCommentsNumber(tx);
    }

    const savePost = async () => {
        const tx = await contract.savePost(postId);
        await tx.wait();
        setIsSaved(true);
    }

    const likePost = async () => {
        const tx = await contract.likePost(postId);
        await tx.wait();
        setLikesNumber((prevLikes) => ++prevLikes);
        setIsLiked(true);
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
            <Link to={`/homepage/${postId}`}>
                <div className="Header">
                    {profileData && profileData.imageCID ? <img src={`https://ipfs.io/ipfs/${profileData.imageCID}`} alt="" className='profileImage' /> : <p>loading..</p>}
                    <div className='uNameContainer'>
                        {profileData && profileData.userName ? <p className="username">{profileData.userName}</p> : <p>loading..</p>}
                        <p className="timestamp">{formatDate(timestamp)}</p>
                    </div>
                    {/* <p className="address">{postOwner}</p> */}
                </div>
            </Link>

            <div className="content">
                <button onClick={prevImage} className="carousel-button prev-button">
                    &lt;
                </button>
                {postPicCIDs ? (
                    <img
                        className="postImage"
                        src={`https://ipfs.io/ipfs/${postPicCIDs[currentImageIndex]}`}
                        alt=""
                    />
                ) : (
                    <></>
                )}
                <button onClick={nextImage} className="carousel-button next-button">
                    &gt;
                </button>
            </div>
            <div className="footer">
                <div className='postContainers'>
                    <div className='likeCommentBtnContainer'>
                        <button className='postBtns' disabled={isLiked} onClick={likePost}>
                            {isLiked ? <img src='Images/Liked.svg' /> : <img src='Images/Like.svg' />}
                        </button>

                        <button className="postBtns">
                            <img src="Images/Comment.svg" alt="" />
                        </button>
                    </div>

                    <button className='postBtns' disabled={isSaved} onClick={savePost}> {isSaved ? <img src='Images/Saved.svg' /> : <img src='Images/Save.svg' />}</button>
                </div>
                <div className='likeCmtCountContainer postContainers'>
                    <p className="likecount count">{likesNumber.toString() + " "} <span className='countlabel'>Likes</span> </p>
                    <p>.</p>
                    <p className="commentcount count">{commentsNumber.toString() + " "} <span className='countlabel'>Comments</span> </p>
                </div>
            </div>
            <div className='nameNCaption postContainers'>
                {profileData && profileData.userName ? <p className="username">{profileData.userName}</p> : <p>loading..</p>}
                <p className="textContent">{textContent}</p>
            </div>
        </div>
    )
}

export default Post;
