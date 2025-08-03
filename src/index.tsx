import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import router from './router/router';
import './App.css';
import { env } from './config/environment';

// Kakao SDK 초기화
if (window.Kakao && !window.Kakao.isInitialized()) {
  try {
    window.Kakao.init(env.kakaoAppKey);
    console.log('Kakao SDK initialized:', window.Kakao.isInitialized());
  } catch (error) {
    console.error('Failed to initialize Kakao SDK:', error);
  }
}

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<RouterProvider router={router} />);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
