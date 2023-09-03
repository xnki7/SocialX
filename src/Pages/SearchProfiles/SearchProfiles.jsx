import React from 'react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import "./SearchProfiles.css"

const SearchProfiles = ({ contract }) => {
    const [profiles, setProfiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const getAllProfiles = async () => {
        const tx = await contract.getAllProfiles();
        console.log(tx);
        setProfiles(tx);
    }
    useEffect(() => {
        getAllProfiles();
    }, [contract])

    const fetchProfileMetadata = async (postURI) => {
        try {
            const response = await axios.get(`https://ipfs.io/ipfs/${postURI}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching Profile metadata:", error);
            return null;
        }
    };

    useEffect(() => {
        const fetchProfileDetails = async () => {
            setIsLoading(true);
            const updatedProfiles = await Promise.all(
                profiles.map(async (profile) => {
                    let metadata = null;
                    try {
                        metadata = await fetchProfileMetadata(profile.userProfileCID);
                    } catch (error) {
                        console.error("Error fetching metadata:", error);
                    }
                    console.log("Metadata for profile:", metadata);
                    return { ...profile, metadata };
                })
            );
            console.log("Updated Profile:", updatedProfiles);
            setProfiles(updatedProfiles);
            setIsLoading(false);
        };

        const fetchProfiles = async () => {
            if (profiles.length > 0 && !profiles[0].metadata) {
                await fetchProfileDetails();
            }
        };

        fetchProfiles();
    }, [profiles]);

    return (
        <div className='SearchProfiles'>
            <form>
                <input type="text" />
                <button type="submit">Search</button>
            </form>
            <div className="profiles">
                {profiles.map((profile) => {
                    return profile.metadata && <>
                        <p>{profile.metadata.userName}</p>
                        <p>{profile.userAddress}</p>
                        <img src={`https://ipfs.io/ipfs/${profile.metadata.imageCID}`} alt="" />
                    </>
                })}
            </div>
        </div>
    )
}

export default SearchProfiles