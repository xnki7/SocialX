import { Link } from 'react-router-dom';
import img from "./SocialX.svg"
import save from "./SavedPosts.svg"
import "./Header.css"
export default function Header() {
    return (
        <div className='headerContainer'>
            <img className="logoImg" src={img} alt="" />
            <Link to='/savedposts'>
                <button className='postBtns'><img src={save} alt="" /></button>
            </Link>
        </div>
    )
}