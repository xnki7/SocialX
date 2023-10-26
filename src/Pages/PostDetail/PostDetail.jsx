import React from 'react'
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Post from '../../Components/Post/Post';
import "./PostDetail.css"
import commentBtn from "./comment.svg"
import Header from "../../Components/Header/Header"
import Navbar from "../../Components/Navbar/Navbar"

const PostDetail = ({ contract, accountAddress }) => {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [postData, setPostData] = useState(null);
    const [comment, setComment] = useState(null);
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const getPost = async () => {
        const tx = await contract.getPost(postId);
        fetchPostMetadata(tx.postCID);
        getPostComments();
        setPost(tx);
        console.log(tx.postOwner);
        console.log(tx.postTimestamp);
    }

    const getPostComments = async () => {
        const tx = await contract.getPostComments(postId);
        setComments(tx);
    }

    const fetchPostMetadata = async (postURI) => {
        try {
            const response = await axios.get(`https://ipfs.io/ipfs/${postURI}`);
            const metadata = response.data;
            setPostData(metadata);
        } catch (error) {
            console.error("Error fetching Post metadata:", error);
            return null;
        }
    };

    const handleFormSubmit = async (e) => {
        setIsLoading(true);
        e.preventDefault();
        try {
            const commentData = {
                comment: comment,
            };

            const commentUploadResponse = await axios.post(
                'https://api.pinata.cloud/pinning/pinJSONToIPFS',
                commentData,
                {
                    headers: {
                        pinata_api_key: "b3909c367f38816509ea",
                        pinata_secret_api_key:
                            "d7e034abe6d3da97a2267aa7065ab20d513f8dc0e1015cdd7c9ed91c99088231",
                    },
                }
            );

            console.log(commentUploadResponse.data.IpfsHash);
            const tx = await contract.commentOnPost(postId, commentUploadResponse.data.IpfsHash);
            await tx.wait();

            setComment(null);
            window.location.reload();
        } catch (e) {
            console.log(e);
        }
        setIsLoading(false);
    }

    useEffect(() => {
        if (contract) {
            getPost();
        }
    }, [contract])

    const fetchCommentMetadata = async (commentURI) => {
        try {
            const response = await axios.get(`https://ipfs.io/ipfs/${commentURI}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching Comment metadata:", error);
            return null;
        }
    };

    useEffect(() => {
        const fetchCommentDetails = async () => {
            setIsLoading(true);
            const updatedComments = await Promise.all(
                comments.map(async (comment) => {
                    const uri = await contract.getUserProfile(comment.commentOwner);
                    let profileMetadata = null;
                    let commentMetadata = null;
                    try {
                        profileMetadata = await fetchCommentMetadata(uri.userProfileCID);
                        commentMetadata = await fetchCommentMetadata(comment.commentCID);
                    } catch (error) {
                        console.error("Error fetching metadata:", error);
                    }
                    console.log("Metadata for comment: ", profileMetadata, ":", commentMetadata);
                    return { ...comment, profileMetadata, commentMetadata };
                })
            );
            console.log("Updated Comment:", updatedComments);
            setComments(updatedComments);
            setIsLoading(false);
        };

        const fetchComments = async () => {
            if (comments.length > 0 && !comments[0].profileMetadata && !comments[0].commentMetadata) {
                await fetchCommentDetails();
            }
        };

        fetchComments();
    }, [comments]);

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

    return (
        <>
            <div className='PostDetail'>
                <div className="header">
                    <Header />
                </div>
                {isLoading ? (<div className="loader">
                    <svg viewBox="25 25 50 50">
                        <circle r={20} cy={50} cx={50} />
                    </svg>
                    <div className="overlay"></div>
                </div>) : (<div className='mainCommentContent'>
                    {post && postData ? <Post postId={postId} contract={contract} postOwner={post.postOwner} timestamp={post.postTimestamp} textContent={postData.textContent} postPicCIDs={postData.imageCIDs} accountAddress={accountAddress}/> : <></>}
                    <div className="comments">
                        {comments.map((comment) => {
                            return comment.profileMetadata && comment.commentMetadata && <div className='commentBox'>
                                <div className='profileDataContainer'>
                                    <Link to={`/profile/${comment.commentOwner}`} style={{ textDecoration: "none" }}>
                                        <img src={`https://ipfs.io/ipfs/${comment.profileMetadata.imageCID}`} alt="" />
                                    </Link>
                                    <div className='profileDataNTimeContainer'>
                                        <Link to={`/profile/${comment.commentOwner}`} style={{ textDecoration: "none" }}>
                                            <p className='commentUsername'>{comment.profileMetadata.userName}</p>
                                        </Link>
                                        <p className='commentAddress'>{comment.commentOwner.slice(0, 6) + "..." + comment.commentOwner.slice(38, 42)}</p>
                                    </div>
                                    <p className='commentDate'>{formatDate(comment.commentTimestamp)}</p>
                                </div>
                                <p className='commentData'>{comment.commentMetadata.comment}</p>
                            </div>

                        })}
                    </div>
                    {/* Comment Section */}
                    <div className="postComment">
                        <form onSubmit={handleFormSubmit}>
                            <input type="text" placeholder='Send Your Comment...' value={comment} onChange={(e) => { setComment(e.target.value) }} required />
                            <button type="submit"><img src={commentBtn} alt="" /></button>
                        </form>
                    </div>
                </div>)}
            </div>
            <Navbar contract={contract} accountAddress={accountAddress} />
        </>
    )
}

export default PostDetail