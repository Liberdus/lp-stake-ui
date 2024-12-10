import { Link } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <header className="flex justify-between items-center px-6 py-4 bg-gray-100 shadow-md">
      <h1 className="text-2xl font-bold text-gray-800">Liberdus LP Staking</h1>
      <nav className="space-x-6">
        <Link to="/" className="text-gray-600 hover:text-gray-900 transition-colors">
          Home
        </Link>
        <Link to="/admin" className="text-gray-600 hover:text-gray-900 transition-colors">
          Admin Panel
        </Link>
      </nav>
    </header>
  );
};

export default Header;
