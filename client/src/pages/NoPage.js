import { useNavigate } from 'react-router-dom';

const NoPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 404 Number */}
        <div className="text-8xl font-bold text-gray-300 mb-4">404</div>
        
        {/* Error Message */}
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Page Not Found
        </h1>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist.
        </p>
        
        {/* Action Button */}
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Home
        </button>
      </div>
    </div>
  );
};

export default NoPage;