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

    const getPost = async () => {
        const tx = await contract.getPost(postId);
        fetchPostMetadata(tx.postCID);
        setPost(tx);
        console.log(tx.postOwner);
        console.log(tx.postTimestamp);
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

    useEffect(() => {
        if (contract) {
            getPost();
        }
    }, [])

    return (
        <div className='PostDetail'>
            {post && postData ? <Post postId={postId} contract={contract} postOwner={post.postOwner} timestamp={post.postTimestamp} textContent={postData.textContent} postPicCIDs={postData.imageCIDs} /> : <></>}
        </div>
    )
}

export default PostDetail