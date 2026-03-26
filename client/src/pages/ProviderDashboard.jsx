import { Outlet } from 'react-router-dom';

const ProviderDashboard = () => {
  return (
    <div className="container" style={{ paddingTop: '24px' }}>
      <div className="animate-fade-in">
        <Outlet />
      </div>
    </div>
  );
};

export default ProviderDashboard;
