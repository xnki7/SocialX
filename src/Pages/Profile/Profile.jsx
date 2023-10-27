import React from 'react'
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import "./Profile.css"
import EditBtn from "./EditBtn.svg"
import ProfileCard from "../../Components/ProfileCard/ProfileCard"
import Navbar from '../../Components/Navbar/Navbar';
import Header from '../../Components/Header/Header';

const Profile = ({ contract, myAddress }) => {
    const { accountAddress } = useParams();
    const [profileData, setProfileData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followings, setFollowings] = useState([]);
    const [followers, setFollowers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [display, setDisplay] = useState({ post: true, follower: false, following: false })

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
            setIsLoading(false);
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
            setIsLoading(true);
            const tx = await contract.followUser(accountAddress);
            await tx.wait(); // Wait for the transaction to confirm
            getIsFollowing();
            getFollowers();
            getFollowings();
            setIsLoading(false);
        } catch (error) {
            console.error("Error following user:", error);
            setIsLoading(false);
        }
    }

    const unfollowUser = async () => {
        try {
            setIsLoading(true);
            const tx = await contract.unfollowUser(accountAddress);
            await tx.wait(); // Wait for the transaction to confirm
            getIsFollowing();
            getFollowers();
            getFollowings();
            setIsLoading(false);
        } catch (error) {
            console.error("Error unfollowing user:", error);
            setIsLoading(false);
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
            try {
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
            } catch (err) {
                setIsLoading(false);
            }
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

    const displayPosts = () => {
        setDisplay(() => {
            return { post: true, follower: false, following: false }
        })
    }
    const displayFollowings = () => {
        setDisplay(() => {
            return { post: false, follower: false, following: true }
        })
    }
    const displayFollowers = () => {
        setDisplay(() => {
            return { post: false, follower: true, following: false }
        })
    }

    return (
        <>
            <div className='header'>
                <Header />
            </div>
            <Navbar contract={contract} accountAddress={myAddress} />
            {isLoading ? ( // Render loader when isLoading is true
                <div className="loader">
                    <svg viewBox="25 25 50 50">
                        <circle r={20} cy={50} cx={50} />
                    </svg>
                    <div className="overlay"></div>
                </div>
            ) : (
                <div className='Profile'>
                    <div className='profileBtnContainer'>
                        {
                            (myAddress === accountAddress) ? <Link to="/profile/editprofile"><button className='prBtn editBtn'><img src={EditBtn} alt="edit" /></button></Link> : <></>
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

                    <div className='profileImageContainer'>
                        {profileData && profileData.imageCID ? <img className='navIcons profileIcon' src={`https://ipfs.io/ipfs/${profileData.imageCID}`} alt="" /> : <div className="loader">
                            <svg viewBox="25 25 50 50">
                                <circle r={20} cy={50} cx={50} />
                            </svg>
                            <div className="overlay"></div>
                        </div>}
                    </div>
                    <div className='nameNBio'>
                        {profileData && profileData.userName ? <p className='profileUserName'>{profileData.userName}</p> : <></>}
                        {profileData && profileData.bio ? <p className='profileBio'>{profileData.bio}</p> : <></>}
                    </div>

                    <div className='profileNavigatorContainer'>
                        <p
                            onClick={displayPosts}
                            className='countNLabelContainer'>
                            <span className='prcount'>{posts.length}</span>
                            <span
                                className='prlabel'
                                style={display.post ? { backgroundColor: '#4E4E50' } : {}}
                            >Posts</span>
                        </p>
                        <p
                            onClick={displayFollowers}
                            className='countNLabelContainer'>
                            <span className='prcount'>{followers.length}</span>
                            <span
                                className='prlabel'
                                style={display.follower ? { backgroundColor: '#4E4E50' } : {}}
                            >Followers</span>
                        </p>
                        <p
                            onClick={displayFollowings}
                            className='countNLabelContainer'>
                            <span className='prcount'>{followings.length}</span>
                            <span
                                className='prlabel'
                                style={display.following ? { backgroundColor: '#4E4E50' } : {}}
                            >Following</span>
                        </p>
                    </div>

                    {
                        display.post ? <div className="profilePosts">
                            {posts.length > 0 ? posts.map((post) => {
                                if (post.metadata && post.metadata.imageCIDs) {
                                    return (
                                        // eslint-disable-next-line react/jsx-key
                                        <Link to={`/homepage/${post.postId}`}>
                                            <img className='postImages' key={post.postId} src={`https://ipfs.io/ipfs/${post.metadata.imageCIDs[0]}`} alt="" />
                                        </Link>
                                    );
                                } else {
                                    return <></>
                                }
                            }) : <p className='saver' style={{ color: "white", textAlign: "center", paddingTop: "5rem", opacity: "75%" }}>Nothing To See Here...</p>}
                        </div> : <></>
                    }

                    {
                        display.following ? <div className="followings followContainer">
                            {followings.length > 0 ? followings && followings.map((follows) => {
                                return <>
                                    <Link to={`/profile/${follows.userAddress}`} style={{ textDecoration: "none", color: "white" }}>
                                        <div className="profileBox">
                                            {follows.metadata && <ProfileCard address={follows.userAddress} username={follows.metadata.userName} image={`https://ipfs.io/ipfs/${follows.metadata.imageCID}`} />}
                                        </div>
                                    </Link >
                                </>
                            }) : <p className='saver' style={{ color: "white", textAlign: "center", paddingTop: "5rem", opacity: "75%" }}>Nothing To See Here...</p>}
                        </div> : <></>
                    }

                    {
                        display.follower ? <div className="followers followContainer">
                            {/* <h1>Followers</h1> */}
                            {followers.length > 0 ? followers && followers.map((follower) => {
                                return <>
                                    <Link to={`/profile/${follower.userAddress}`} style={{ textDecoration: "none", color: "white" }}>
                                        <div className="profileBox">
                                            {follower.metadata && <ProfileCard address={follower.userAddress} username={follower.metadata.userName} image={`https://ipfs.io/ipfs/${follower.metadata.imageCID}`} />}
                                        </div>
                                    </Link>
                                </>
                            }) : <p className='saver' style={{ color: "white", textAlign: "center", paddingTop: "5rem", opacity: "75%" }}>Nothing To See Here...</p>}
                        </div> : <></>
                    }
                </div>
            )}
        </>
    )
}

export default Profile