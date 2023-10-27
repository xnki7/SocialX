import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from "react-router-dom";
import img from "../CreateProfile/createPic.png"
import Navbar from '../../Components/Navbar/Navbar'
import Header from '../../Components/Header/Header'
import "./EditProfile.css"

const EditProfile = ({ contract, accountAddress }) => {
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [userName, setUserName] = useState("");
    const [bio, setBio] = useState("Hey I am on SocialX!");
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const getProfileData = async () => {
        try {
            const tx = await contract.getUserProfile(accountAddress);
            console.log(tx);
            fetchProfileMetadata(tx.userProfileCID);
        } catch (err) {
            console.log(err);
        }
    }

    const fetchProfileMetadata = async (postURI) => {
        try {
            setLoading(true);
            const response = await axios.get(`https://ipfs.io/ipfs/${postURI}`);
            const metadata = response.data;
            setProfileData(metadata);
            setUserName(metadata.userName);
            setBio(metadata.bio)
            setLoading(false);
        } catch (error) {
            console.error("Error fetching Post metadata:", error);
            setLoading(false);
            return null;
        }
    };

    useEffect(() => {
        if (contract && accountAddress) {
            getProfileData();
            console.log(accountAddress);
        }
    }, [contract, accountAddress])

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        setImage(file);
        console.log(file);
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);

        try {
            let imageCID;
            if (image === null) {
                alert("Insert a profile picture.")
            }
            else {
                if (image) {
                    const formData = new FormData();
                    formData.append("file", image);

                    const imageUploadResponse = await axios.post(
                        "https://api.pinata.cloud/pinning/pinFileToIPFS",
                        formData,
                        {
                            headers: {
                                pinata_api_key: "582fc7fc6539867bf62c",
                                pinata_secret_api_key:
                                    "57674f066b9ac2b728b99e60ca632ab60628a7ed04dd564600b819c01b4c55bc",
                            },
                        }
                    );

                    imageCID = imageUploadResponse.data.IpfsHash;
                }

                const profileData = {
                    userName: userName,
                    bio: bio,
                    imageCID: imageCID,
                };

                const profileUploadResponse = await axios.post(
                    "https://api.pinata.cloud/pinning/pinJSONToIPFS",
                    profileData,
                    {
                        headers: {
                            pinata_api_key: "582fc7fc6539867bf62c",
                            pinata_secret_api_key:
                                "57674f066b9ac2b728b99e60ca632ab60628a7ed04dd564600b819c01b4c55bc",
                        },
                    }
                );

                const tx = await contract.updateProfile(profileUploadResponse.data.IpfsHash);
                await tx.wait();
                navigate(`/profile/${accountAddress}`)
                setUserName(""); // Clear the username input
                setImage(null); // Clear the image
            }
        } catch (error) {
            console.error("Error uploading profile data", error);
        }

        setLoading(false);
    };
    return (
        <>
            {loading ? (
                <div className="loader">
                    <svg viewBox="25 25 50 50">
                        <circle r={20} cy={50} cx={50} />
                    </svg>
                    <div className="overlay"></div>
                </div>
            ) : (<div className='EditProfile'>
                <Header />
                <form onSubmit={handleFormSubmit}>
                    <p className="heading">Edit Profile</p>
                    <input id="file" type="file" accept="image/*" onChange={handleImageUpload} />
                    <label htmlFor="file">
                        <img id="inputImg" src={img} alt="" />
                    </label>
                    <div className="inputBox">
                        <p className="inputHead">Username*</p>
                        <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} required />
                    </div>
                    <div className="inputBox">
                        <p className="inputHead">Bio</p>
                        <textarea name="" id="" value={bio} onChange={(e) => setBio(e.target.value)}></textarea>
                    </div>
                    <button type="submit">Update Profile</button>
                </form>
                <Navbar contract={contract} accountAddress={accountAddress} />
            </div>)}

        </>
    )
}

export default EditProfile