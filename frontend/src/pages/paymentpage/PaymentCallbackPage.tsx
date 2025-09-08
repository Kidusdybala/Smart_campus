import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../api';
import { Loader2 } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';

export const PaymentCallbackPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const processPayment = async () => {
      try {
        // Parse URL parameters
        const params = new URLSearchParams(location.search);
        const txRef = params.get('tx_ref');
        const transactionId = params.get('transaction_id');
        const status = params.get('status');

        if (!txRef) {
          setError('Payment reference not found');
          setProcessing(false);
          return;
        }

        if (status !== 'successful') {
          setError(`Payment was not successful: ${status}`);
          setProcessing(false);
          return;
        }

        // Complete the payment
        const response = await api.completePayment(txRef);
        
        if (response.success) {
          toast({
            title: 'Payment Successful',
            description: 'Your wallet has been topped up successfully.',
          });
          
          // Redirect to wallet page
          navigate('/student/profile/wallet');
        } else {
          setError(response.message || 'Failed to complete payment');
          setProcessing(false);
        }
      } catch (error) {
        console.error('Error processing payment callback:', error);
        setError('An error occurred while processing your payment');
        setProcessing(false);
      }
    };

    processPayment();
  }, [location, navigate, toast]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">Payment Processing</h1>
        
        {processing ? (
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-center text-gray-600">Processing your payment, please wait...</p>
          </div>
        ) : error ? (
          <div className="space-y-4">
            <p className="text-center text-red-500">{error}</p>
            <div className="flex justify-center">
              <button
                onClick={() => navigate('/student/profile/wallet')}
                className="px-4 py-2 text-white bg-primary rounded hover:bg-primary/90"
              >
                Return to Wallet
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};