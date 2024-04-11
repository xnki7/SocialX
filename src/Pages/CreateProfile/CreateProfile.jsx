import React from 'react'
import "./CreateProfile.css"
import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from "react-router-dom";
import img from "./createPic.png"
import logo from "../ConnectWallet/SocialX.png"

const CreateProfile = ({ contract }) => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState("");
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const bio = "Hey I am on SocialX!";

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        setImage(file);
        console.log(file);
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);

        try {
            let imageCID = "QmbWt4Fyggz6dWEvvGFW6TjSSyL4TLo2FfBKmC7MWD1r6n";

            if (image) {
                const formData = new FormData();
                formData.append("file", image);

                const imageUploadResponse = await axios.post(
                    "https://api.pinata.cloud/pinning/pinFileToIPFS",
                    formData,
                    {
                        headers: {
                            pinata_api_key: "7b9d769161e58aace52d",
                            pinata_secret_api_key:
                                "b7de00c97730c7bec4b1504707b024497f46d34cd022f3614a37d65621cfae19",
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
                        pinata_api_key: "7b9d769161e58aace52d",
                        pinata_secret_api_key:
                            "b7de00c97730c7bec4b1504707b024497f46d34cd022f3614a37d65621cfae19",
                    },
                }
            );

            const tx = await contract.createUserProfile(profileUploadResponse.data.IpfsHash);
            await tx.wait();
            navigate('/homepage')

            setUserName(""); // Clear the username input
            setImage(null); // Clear the image
        } catch (error) {
            console.error("Error uploading profile data", error);
        }

        setLoading(false);
    };

    return (<>
        {loading ? (
            <>
                <div className="loader">
                    <svg viewBox="25 25 50 50">
                        <circle r={20} cy={50} cx={50} />
                    </svg>
                    <div className="overlay"></div>
                </div>
                <div className='CreateProfile'>
                    <img src={logo} id='logo' alt="" />
                    <form onSubmit={handleFormSubmit}>
                        <p className="heading">Create Profile</p>
                        <input id="file" type="file" accept="image/*" onChange={handleImageUpload} />
                        <label htmlFor="file">
                            <img id="inputImg" src={img} alt="" />
                        </label>
                        <div className="inputBox">
                            <p className="inputHead">Username*</p>
                            <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} required />
                        </div>
                        <button type="submit">Create Profile</button>
                    </form>
                    <p className="footer">Made Just for You, Filled with ❤️</p>
                </div>
            </>
        ) : (
            <div className='CreateProfile'>
                <img src={logo} id='logo' alt="" />
                <form onSubmit={handleFormSubmit}>
                    <p className="heading">Create Profile</p>
                    <input id="file" type="file" accept="image/*" onChange={handleImageUpload} />
                    <label htmlFor="file">
                        <img id="inputImg" src={img} alt="" />
                    </label>
                    <div className="inputBox">
                        <p className="inputHead">Username*</p>
                        <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} required />
                    </div>
                    <button type="submit">Create Profile</button>
                </form>
                <p className="footer">Made Just for You, Filled with ❤️</p>
            </div>
        )}

    </>
    )
}

export default CreateProfile;