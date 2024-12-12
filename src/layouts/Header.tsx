import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const Header: React.FC = () => {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center px-4 py-3 bg-gray-100 shadow-md">
      <div className="flex flex-row items-center w-full md:w-auto justify-around gap-4">
        <div className="flex flex-row items-center gap-2 mb-2 md:mb-0">
          <img src={logo} alt="Liberdus LP Staking" className="w-8 h-8 md:w-10 md:h-10" />
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 hidden sm:block">Liber LP Staking</h1>
        </div>
        <nav className="flex flex-1 justify-center gap-3">
          <Link to="/" className="text-gray-800 hover:text-gray-900 transition-colors">
            Home
          </Link>
          <Link to="/admin" className="text-gray-800 hover:text-gray-900 transition-colors">
            Admin Panel
          </Link>
        </nav>
      </div>

      <div className="mt-4 md:mt-0">
        <ConnectButton accountStatus="avatar" chainStatus="icon" />
      </div>
    </header>
  );
};

export default Header;
