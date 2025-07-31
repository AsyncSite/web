import React, { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import './Header.css';
import './SubContentsTemplate.css';

const SubContentsTemplate = () => {
  return (
    <div className="sub-contents-wrapper">
      <Header alwaysFixed={true} />
      <div className="sub-contents-body">
        <Suspense fallback={
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            color: '#C3E88D',
            fontSize: '1.5rem'
          }}>
            Loading...
          </div>
        }>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
};
export default SubContentsTemplate;
