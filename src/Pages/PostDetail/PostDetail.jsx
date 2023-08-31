import React from 'react'
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import Post from '../../Components/Post/Post';
import "./PostDetail.css"

const PostDetail = ({ contract }) => {
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
                        pinata_api_key: "4c06043fd7ebff08f27b",
                        pinata_secret_api_key:
                            "ec4cfdc1fce8125c18ffe9f8dbbdb583c0212e7ce88cefc8b47a1620ee44a7b4",
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
        <div className='PostDetail'>
            {post && postData ? <Post postId={postId} contract={contract} postOwner={post.postOwner} timestamp={post.postTimestamp} textContent={postData.textContent} postPicCIDs={postData.imageCIDs} /> : <p>loading...</p>}
            <div className="postComment">
                <form onSubmit={handleFormSubmit}>
                    <input type="text" placeholder='Write your comment here' value={comment} onChange={(e) => { setComment(e.target.value) }} />
                    <button type="submit">Comment</button>
                </form>
            </div>
            <div className="comments">
                {comments.map((comment) => {
                    return comment.profileMetadata && comment.commentMetadata && <div className='commentBox'>
                        <img src={`https://ipfs.io/ipfs/${comment.profileMetadata.imageCID}`} alt="" />
                        <p>{comment.profileMetadata.userName}</p>
                        <p>{comment.commentOwner}</p>
                        <p>{formatDate(comment.commentTimestamp)}</p>
                        <p>{comment.commentMetadata.comment}</p>
                    </div>
                })}
            </div>
        </div>
    )
}

export default PostDetail