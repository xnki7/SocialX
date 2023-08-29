import React from 'react'
import "./CreateProfile.css"
import { useState } from 'react'
import axios from 'axios'
import img from "./createPic.png"
import logo from "../ConnectWallet/SocialX.png"

const CreateProfile = ({ contract }) => {
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
                            pinata_api_key: "4c06043fd7ebff08f27b",
                            pinata_secret_api_key:
                                "ec4cfdc1fce8125c18ffe9f8dbbdb583c0212e7ce88cefc8b47a1620ee44a7b4",
                        },
                    }
                );

                imageCID = imageUploadResponse.data.IpfsHash;
            }

            const profileData = {
                bio: bio,
                imageCID: imageCID,
            };

            const profileUploadResponse = await axios.post(
                "https://api.pinata.cloud/pinning/pinJSONToIPFS",
                profileData,
                {
                    headers: {
                        pinata_api_key: "4c06043fd7ebff08f27b",
                        pinata_secret_api_key:
                            "ec4cfdc1fce8125c18ffe9f8dbbdb583c0212e7ce88cefc8b47a1620ee44a7b4",
                    },
                }
            );

            const tx = await contract.createUserProfile(profileUploadResponse.data.IpfsHash);
            await tx.wait();

            setUserName(""); // Clear the username input
            setImage(null); // Clear the image
        } catch (error) {
            console.error("Error uploading profile data", error);
        }

        setLoading(false);
    };

    return (
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
    )
}

export default CreateProfile;