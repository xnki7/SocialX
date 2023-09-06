import React from 'react'
import { Link } from 'react-router-dom'
import "./ProfileCard.css"

const ProfileCard = ({ address, username, image }) => {
    return (
        <div className='ProfileCard'>
            <Link to={`/profile/${address}`} style={{ textDecoration: "none" }}>
                <div className='SubProfileCard'>
                    <img src={image} alt="" />
                    <div className="userDetails">
                        <p className="username">{username}</p>
                        <p className="address">{address.slice(0, 6) + "..." + address.slice(38, 42)}</p>
                    </div>
                </div>
            </Link>
        </div>
    )
}

export default ProfileCard