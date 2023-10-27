import { Link } from 'react-router-dom';
import img from "./SocialX.svg"
import save from "./SavedPosts.svg"
import "./Header.css"
import log1 from "./log1.svg"

export default function Header() {
    return (
        <div className='headerContainer'>
            <Link to='/homepage'>
                <img className='logoo' src={log1} alt="" width="34px" height="34px" />
            </Link>
            <img className="logoImg" src={img} alt="" />
            <Link to='/savedposts'>
                <button className='postBtns'><img src={save} alt="" /></button>
            </Link>
        </div>
    )
} 