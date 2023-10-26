import React from 'react'
import axios from 'axios';
import { useState, useEffect } from 'react';
import Post from '../../Components/Post/Post';
import Header from '../Header/Header';
import Navbar from '../../Components/Navbar/Navbar';
import "./SavedPosts.css"

const SavedPosts = ({ contract, accountAddress }) => {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const getPosts = async () => {
        try {
            const tx = await contract.getUserSavedPosts();
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
        <div className='SavedPosts'>
            <div className="header">
                <Header />
            </div>
            {isLoading ? (
                <div className="loader">
                    <svg viewBox="25 25 50 50">
                        <circle r={20} cy={50} cx={50} />
                    </svg>
                    <div className="overlay"></div>
                </div>
            ) : (
                <div className="posts">
                    {posts.length !== 0 ? [...posts].reverse().map((post) => (
                        <div key={post.postId}>
                            {post.metadata ? (
                                <Post
                                    postId={post.postId}
                                    contract={contract}
                                    postOwner={post.postOwner}
                                    timestamp={post.postTimestamp}
                                    textContent={post.metadata.textContent}
                                    postPicCIDs={post.metadata.imageCIDs}
                                    accountAddress={accountAddress}
                                />
                            ) : (
                                <></>
                            )}
                        </div>
                    )) : (
                        <p className='saver' style={{ color: "white", textAlign: "center", paddingTop: "5rem", opacity: "75%" }}>Nothing To See Here...</p>
                    )}
                </div>

            )}
            <Navbar contract={contract} accountAddress={accountAddress} />
        </div>
    )
}

export default SavedPosts