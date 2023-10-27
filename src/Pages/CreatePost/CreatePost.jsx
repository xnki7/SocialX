import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../Header/Header';
import Navbar from '../../Components/Navbar/Navbar';
import img from './imgPlus.svg';
import './CreatePost.css';

const CreatePost = ({ contract, accountAddress }) => {
    const navigate = useNavigate();
    const [images, setImages] = useState([]);
    const [textContent, setTextContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handleImageUpload = async (event) => {
        const uploadedFiles = event.target.files;
        const newImages = [...images];
        for (let i = 0; i < uploadedFiles.length; i++) {
            const file = uploadedFiles[i];
            newImages.push(file);
        }
        // If more than 3 images were selected, take the first 3 images
        const selectedImages = newImages.slice(0, 3);
        setImages(selectedImages);
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();

        setLoading(true);
        if (images.length === 0) {
            alert('Please select at least one image.');
        } else {
            setLoading(true);
            try {
                let imageCIDs = [];

                for (const image of images) {
                    const formData = new FormData();
                    formData.append('file', image);

                    const imageUploadResponse = await axios.post(
                        'https://api.pinata.cloud/pinning/pinFileToIPFS',
                        formData,
                        {
                            headers: {
                                pinata_api_key: "582fc7fc6539867bf62c",
                                pinata_secret_api_key:
                                    "57674f066b9ac2b728b99e60ca632ab60628a7ed04dd564600b819c01b4c55bc",
                            },
                        }
                    );

                    imageCIDs.push(imageUploadResponse.data.IpfsHash);
                }

                const postData = {
                    textContent: textContent,
                    imageCIDs: imageCIDs,
                };

                const postUploadResponse = await axios.post(
                    'https://api.pinata.cloud/pinning/pinJSONToIPFS',
                    postData,
                    {
                        headers: {
                            pinata_api_key: "582fc7fc6539867bf62c",
                            pinata_secret_api_key:
                                "57674f066b9ac2b728b99e60ca632ab60628a7ed04dd564600b819c01b4c55bc",
                        },
                    }
                );

                console.log(postUploadResponse.data.IpfsHash);
                const tx = await contract.createPost(postUploadResponse.data.IpfsHash);
                await tx.wait();
                navigate('/homepage');

                setTextContent('');
                setImages([]);
            } catch (error) {
                console.error('Error uploading profile data', error);
                // You can also display the error message to the user
                alert(error.message);
            }
            setLoading(false);
        }
    };

    return (
        <>
            {loading ? (<div className="loader">
                <svg viewBox="25 25 50 50">
                    <circle r={20} cy={50} cx={50} />
                </svg>
                <div className="overlay"></div>
            </div>) : <>
                <div className="header">
                    <Header />
                </div>
                <div className="CreatePost">
                    <form onSubmit={handleFormSubmit}>
                        <h2>Create Post</h2>
                        <input
                            id="file"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            multiple
                        />
                        <label htmlFor="file">
                            <img id="inputImg" src={img} alt="" />
                        </label>
                        <div className="inputBox">
                            <p className="inputHead">Caption</p>
                            <textarea
                                placeholder="Caption..."
                                value={textContent}
                                onChange={(e) => setTextContent(e.target.value)}
                            />
                        </div>
                        <button type="submit">Create Post</button>
                    </form>
                    <Navbar contract={contract} accountAddress={accountAddress} />
                </div></>}

        </>
    );
};

export default CreatePost;
