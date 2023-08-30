import React from 'react'
import { useState } from 'react'
import axios from 'axios'
import "./CreatePost.css"

const CreatePost = ({ contract }) => {
    const [images, setImages] = useState([]);
    const [textContent, setTextContent] = useState("");
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
        try {
            let imageCIDs = [];

            if (images.length === 0) {
                imageCIDs = null;
            }
            else {
                for (const image of images) {
                    const formData = new FormData();
                    formData.append('file', image);

                    const imageUploadResponse = await axios.post(
                        'https://api.pinata.cloud/pinning/pinFileToIPFS',
                        formData,
                        {
                            headers: {
                                pinata_api_key: "4c06043fd7ebff08f27b",
                                pinata_secret_api_key:
                                    "ec4cfdc1fce8125c18ffe9f8dbbdb583c0212e7ce88cefc8b47a1620ee44a7b4",
                            },
                        }
                    );

                    imageCIDs.push(imageUploadResponse.data.IpfsHash);
                }
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
                        pinata_api_key: "4c06043fd7ebff08f27b",
                        pinata_secret_api_key:
                            "ec4cfdc1fce8125c18ffe9f8dbbdb583c0212e7ce88cefc8b47a1620ee44a7b4",
                    },
                }
            );

            console.log(postUploadResponse.data.IpfsHash);
            const tx = await contract.createPost(postUploadResponse.data.IpfsHash);
            await tx.wait();

            setTextContent('');
            setImages([]);
        } catch (error) {
            console.error('Error uploading profile data', error);
        }

        setLoading(false);
    };

    return (
        <div className='CreatePost'>
            <form onSubmit={handleFormSubmit}>
                <h2>Create Post</h2>
                <input type="text" required value={textContent} onChange={(e) => setTextContent(e.target.value)} />
                <input type="file" name="" id="" accept="image/*" multiple onChange={handleImageUpload} />
                <button type="submit">Create Post</button>
            </form>
        </div>
    )
}

export default CreatePost