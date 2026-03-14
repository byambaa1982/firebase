import { Link } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function NavUser() {
  const { user, signOut } = useAuth()

  if (!user) {
    return <Link to="/signin" className="nav-signin">Sign In</Link>
  }

  return (
    <div className="nav-user">
      {user.photoURL && (
        <img src={user.photoURL} alt={user.displayName} className="nav-avatar" referrerPolicy="no-referrer" />
      )}
      <span className="nav-username">{user.displayName?.split(' ')[0]}</span>
      <button className="nav-signout" onClick={signOut}>Sign Out</button>
    </div>
  )
}
