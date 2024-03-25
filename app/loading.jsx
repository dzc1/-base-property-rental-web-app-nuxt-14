// Page Name: Custom Spinner Page
// Page Function: Update Later....
// ------------------------------------
'use client';
import ScaleLoader from 'react-spinners/ScaleLoader';

const override = {
  display: 'flex',
  margin: '100px auto',
  justifyContent: 'center',
};

const LoadingPage = ({ loading }) => {
  return (
    <>
      <ScaleLoader
        color='#3b82f6'
        loading={loading}
        cssOverride={override}
        width={4}
      />
    </>
  );
};

export default LoadingPage;
