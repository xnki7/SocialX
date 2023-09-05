import { Link } from 'react-router-dom';
import "./Header.css"
export default function Header() {
    return (
        <div className='headerContainer'>
            <img className="logoImg" src="Images/SocialX.svg" alt="" />
            <Link to='/savedposts'>
                <button className='postBtns'><img src="Images/SavedPosts.svg" alt="" /></button>
            </Link>
        </div>
    )
}