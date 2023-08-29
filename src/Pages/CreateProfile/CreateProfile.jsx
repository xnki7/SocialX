import React from 'react'
import "./CreateProfile.css"
import img from "./createPic.png"
import logo from "../ConnectWallet/SocialX.png"

const CreateProfile = () => {
    return (
        <div className='CreateProfile'>
            <img src={logo} id='logo' alt="" />
            <form>
                <p className="heading">Create Profile</p>
                <input id='file' type="file" />
                <label htmlFor="file">
                    <img src={img} alt="" />
                </label>
                <div className="inputBox">
                    <p className="inputHead">Username*</p>
                    <input type="text" />
                </div>
                <button type="submit">Create Profile</button>
            </form>
            <p className="footer">Made Just for You, Filled with ❤️</p>
        </div>
    )
}

export default CreateProfile