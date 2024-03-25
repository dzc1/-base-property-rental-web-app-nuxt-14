// File Name: layout.jsx
// File Function: This file serves as layout template for the app.  Its purpose is to provide a consistent structure for each page of the application, including a navigation bar, a footer, and global context providers for authentication and other application-wide data.
// ------------------------------------
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AuthProvider from '@/components/AuthProvider';
import { ToastContainer } from 'react-toastify';
import { GlobalProvider } from '@/context/GlobalContext';
import '@/assets/styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';
import 'photoswipe/dist/photoswipe.css';

// Set up of variable top hold metadata information
// Replicate on each 'page' to add specific SEO
export const metadata = {
  title: 'StoicDev-v1',
  description: 'Change this later',
  keywords: 'keyword1, keyword2, keyword3',
};

const MainLayout = ({ children }) => {
  return (
    // Wrap the content in GlobalProvider to provide application-wide context
    <GlobalProvider>
      {/* Wrap the content in AuthProvider to manage authentication */}
      <AuthProvider>
        <html lang='en'>
          <body>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <ToastContainer />
          </body>
        </html>
      </AuthProvider>
    </GlobalProvider>
  );
};
export default MainLayout;
