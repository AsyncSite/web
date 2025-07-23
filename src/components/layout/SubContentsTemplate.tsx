import { Outlet } from 'react-router-dom';
import Header from './Header';
import './Header.css';
import './SubContentsTemplate.css';

const SubContentsTemplate = () => {
  return (
    <div className="sub-contents-wrapper">
      <Header alwaysFixed={true} />
      <div className="sub-contents-body">
        <Outlet />
      </div>
    </div>
  );
};
export default SubContentsTemplate;
