import React from 'react'
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import "./Profile.css"

const Profile = ({ contract, accountAddress }) => {
    const [profileData, setProfileData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const getPosts = async () => {
        try {
            const tx = await contract.getUserPosts();
            console.log(tx);
            setPosts(tx);
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
    }

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
    }, [posts, contract, profileData]);

    const getProfileData = async () => {
        const tx = await contract.getUserProfile(accountAddress);
        console.log(tx);
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
        if (contract && accountAddress) {
            getProfileData();
            getPosts();
            console.log(accountAddress);
        }
    }, [contract, accountAddress])

    return (
        <div className='Profile'>
            {profileData && profileData.imageCID ? <img className='navIcons profileIcon' src={`https://ipfs.io/ipfs/${profileData.imageCID}`} alt="" /> : <p>loading..</p>}
            {profileData && profileData.userName ? <p>{profileData.userName}</p> : <p>loading</p>}
            {profileData && profileData.bio ? <p>{profileData.bio}</p> : <p>loading</p>}

            <div className="posts">
                {posts.map((post) => {
                    if (post.metadata && post.metadata.imageCIDs) {
                        return (
                            <Link to={`/profile/${post.postId}`}>
                                <img key={post.postId} src={`https://ipfs.io/ipfs/${post.metadata.imageCIDs[0]}`} alt="" />
                            </Link>
                        );
                    } else {
                        return null; // Render nothing if metadata or imageCIDs are missing
                    }
                })}
            </div>

        </div>
    )
}

export default Profile