import { useToast } from '../context/useToast';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import './Toast.css'; // Define styles inline or separate file, but we will use styled component approach with vanilla CSS

const Toast = ({ toast }) => {
  const { removeToast } = useToast();
  const { id, message, type } = toast;

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle2 className="toast-icon success" size={20} />;
      case 'error': return <XCircle className="toast-icon error" size={20} />;
      case 'warning': return <AlertTriangle className="toast-icon warning" size={20} />;
      case 'info':
      default: return <Info className="toast-icon info" size={20} />;
    }
  };

  return (
    <div className={`toast-item glass-panel animate-fade-in toast-${type}`}>
      <div className="toast-content">
        {getIcon()}
        <span className="toast-message">{message}</span>
      </div>
      <button onClick={() => removeToast(id)} className="toast-close">
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
