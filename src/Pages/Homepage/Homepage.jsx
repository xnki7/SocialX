import React from 'react'
import { useState, useEffect } from 'react';
import axios from 'axios';
import "./Homepage.css"

const Homepage = ({ contract }) => {
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
            <h2>Homepage</h2>
            {posts && posts.map((post) => (
                <div key={post.postId}>
                    <h1>{post.postOwner}</h1>
                    {post.metadata ? <h2>{post.metadata.textContent}</h2> : <p>No metadata available</p>}
                </div>
            ))}

        </div>
    )
}

export default Homepage