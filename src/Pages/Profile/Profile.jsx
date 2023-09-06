import React from 'react'
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import "./Profile.css"
import

const Profile = ({ contract, myAddress }) => {
    const { accountAddress } = useParams();
    const [profileData, setProfileData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followings, setFollowings] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchProfileMetadata1 = async (postURI) => {
        try {
            const response = await axios.get(`https://ipfs.io/ipfs/${postURI}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching Profile metadata:", error);
            return null;
        }
    };

    useEffect(() => {
        const fetchProfileDetails1 = async () => {
            setIsLoading(true);
            const updatedProfiles1 = await Promise.all(
                followings.map(async (follows) => {
                    let metadata = null;
                    try {
                        metadata = await fetchProfileMetadata1(follows.userProfileCID);
                    } catch (error) {
                        console.error("Error fetching metadata:", error);
                    }
                    console.log("Metadata for profile:", metadata);
                    return { ...follows, metadata };
                })
            );
            console.log("Updated Profile:", updatedProfiles1);
            setFollowings(updatedProfiles1);
        };

        const fetchProfileDetails2 = async () => {
            setIsLoading(true);
            const updatedProfiles2 = await Promise.all(
                followers.map(async (follower) => {
                    let metadata = null;
                    try {
                        metadata = await fetchProfileMetadata1(follower.userProfileCID);
                    } catch (error) {
                        console.error("Error fetching metadata:", error);
                    }
                    console.log("Metadata for profile:", metadata);
                    return { ...follower, metadata };
                })
            );
            console.log("Updated Profile:", updatedProfiles2);
            setFollowers(updatedProfiles2);
            setIsLoading(false);
        };

        const fetchProfiles = async () => {
            if (followings.length > 0 && !followings[0].metadata) {
                await fetchProfileDetails1();
            }
            if (followers.length > 0 && !followers[0].metadata) {
                await fetchProfileDetails2();
            }
        };

        fetchProfiles();
    }, [followings, followers]);

    const followUser = async () => {
        try {
            const tx = await contract.followUser(accountAddress);
            await tx.wait(); // Wait for the transaction to confirm
            getIsFollowing();
            getFollowers();
            getFollowings();
        } catch (error) {
            console.error("Error following user:", error);
        }
    }

    const unfollowUser = async () => {
        try {
            const tx = await contract.unfollowUser(accountAddress);
            await tx.wait(); // Wait for the transaction to confirm
            getIsFollowing();
            getFollowers();
            getFollowings();
        } catch (error) {
            console.error("Error unfollowing user:", error);
        }
    }

    const getIsFollowing = async () => {
        const tx = await contract.getIsUserFollowing(accountAddress);
        setIsFollowing(tx);
    }

    const getFollowings = async () => {
        const tx = await contract.getUserFollowings(accountAddress);
        setFollowings(tx);
    }

    const getFollowers = async () => {
        const tx = await contract.getUserFollowers(accountAddress);
        setFollowers(tx);
    }

    const getPosts = async () => {
        try {
            const tx = await contract.getUserPosts(accountAddress);
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
            getIsFollowing();
            getFollowings();
            getFollowers();
            console.log(accountAddress);
        }
    }, [contract, accountAddress])

    return (
        <div className='Profile'>
            <div className='profileBtnContainer'>
                {
                    (myAddress === accountAddress) ? <button className='prBtn'><img src="Images/EditBtn.svg" alt="edit" /></button> : <></>
                }
                {(myAddress !== accountAddress) ? (
                    !isFollowing ? (
                        <button className='prBtn followBtn' onClick={followUser}>Follow</button>
                    ) : (
                        <button className='prBtn unfollowBtn' onClick={unfollowUser}>Unfollow</button>
                    )
                ) : (
                    <></>
                )}
            </div>

            {profileData && profileData.imageCID ? <img className='navIcons profileIcon' src={`https://ipfs.io/ipfs/${profileData.imageCID}`} alt="" /> : <p>loading..</p>}
            {profileData && profileData.userName ? <p>{profileData.userName}</p> : <p>loading</p>}
            {profileData && profileData.bio ? <p>{profileData.bio}</p> : <p>loading</p>}

            <p>{followers.length} Followers</p>
            <p>{followings.length} Following</p>

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

            <div className="followings">
                <h1>Followings</h1>
                {followings && followings.map((follows) => {
                    return <>
                        <Link to={`/profile/${follows.userAddress}`} style={{ textDecoration: "none", color: "white" }}>
                            <div className="profileBox">
                                {follows.metadata && <p>{follows.metadata.userName}</p>}
                                {follows.metadata && <img src={`https://ipfs.io/ipfs/${follows.metadata.imageCID}`} alt="" />}
                                <p>{follows.userAddress}</p>
                            </div>
                        </Link >
                    </>
                })}
            </div>

            <div className="followers">
                <h1>Followers</h1>
                {followers && followers.map((follower) => {
                    return <>
                        <Link to={`/profile/${follower.userAddress}`} style={{ textDecoration: "none", color: "white" }}>
                            <div className="profileBox">
                                {follower.metadata && <p>{follower.metadata.userName}</p>}
                                {follower.metadata && <img src={`https://ipfs.io/ipfs/${follower.metadata.imageCID}`} alt="" />}
                                <p>{follower.userAddress}</p>
                            </div>
                        </Link>
                    </>
                })}
            </div>

        </div>
    )
}

export default Profile