import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="bg-indigo-700 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <div className="text-xl font-bold tracking-wide">💰 Finance Tracker</div>
      <div className="flex gap-6 items-center text-sm font-medium">
        <Link to="/dashboard" className="hover:text-indigo-200 transition">Dashboard</Link>
        <Link to="/accounts" className="hover:text-indigo-200 transition">Accounts</Link>
        <Link to="/transactions" className="hover:text-indigo-200 transition">Transactions</Link>
        <button
          onClick={handleLogout}
          className="bg-white text-indigo-700 px-4 py-1.5 rounded-full hover:bg-indigo-100 transition font-semibold"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar
