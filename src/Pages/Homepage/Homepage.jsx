import React from 'react'
import { useState, useEffect } from 'react';
import axios from 'axios';
import Post from '../../Components/Post/Post';
import "./Homepage.css"
import Navbar from "../../Components/Navbar/Navbar"
import Header from '../Header/Header';

const Homepage = ({ contract, accountAddress }) => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const getPosts = async () => {
        try {
            const tx = await contract.getAllPosts();
            console.log(tx);
            setPosts(tx);
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
    }

    useEffect(() => {
        if (contract) {
            getPosts();
        }
    }, [contract]);

    const fetchPostMetadata = async (postURI) => {
        try {
            const response = await axios.get(`https://ipfs.io/ipfs/${postURI}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching Post metadata:", error);
            return null;
        }
    };

    useEffect(() => {
        const fetchPostDetails = async () => {
            setIsLoading(true);
            const updatedPosts = await Promise.all(
                posts.map(async (post) => {
                    const uri = await contract.getPostCID(post.postId);
                    let metadata = null;
                    try {
                        metadata = await fetchPostMetadata(uri);
                    } catch (error) {
                        console.error("Error fetching metadata:", error);
                    }
                    console.log("Metadata for postId", post.postId, ":", metadata);
                    return { ...post, metadata };
                })
            );
            console.log("Updated Posts:", updatedPosts);
            setPosts(updatedPosts);
            setIsLoading(false);
        };

        const fetchPosts = async () => {
            if (posts.length > 0 && !posts[0].metadata) {
                await fetchPostDetails();
            }
        };

        fetchPosts();
    }, [posts]);

    return (
        <div className='Homepage'>
            <div className="header">
                <Header />
            </div>
            <Navbar contract={contract} accountAddress={accountAddress} />
            {isLoading ? (
                <div className="loader">
                    <svg viewBox="25 25 50 50">
                        <circle r={20} cy={50} cx={50} />
                    </svg>
                    <div className="overlay"></div>
                </div>
            ) : (
                <div className="posts">
                    {posts && posts.slice().reverse().map((post) => (
                        <div key={post.postId}>
                            {post.metadata ? <Post postId={post.postId} contract={contract} postOwner={post.postOwner} timestamp={post.postTimestamp} textContent={post.metadata.textContent} postPicCIDs={post.metadata.imageCIDs} accountAddress={accountAddress}/> : <></>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Homepage