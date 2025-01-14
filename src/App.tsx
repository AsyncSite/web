// src/App.tsx
import React from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Intro from './components/sections/Intro';
import About from './components/sections/About';
import Worldview from './components/sections/Worldview';
import Routine from './components/sections/Routine';
import Extra from './components/sections/Extra';

import './App.css';

const App: React.FC = () => {
    return (
        <div className="App">

            <Intro/>
            <About/>
            {/* 헤더 (처음엔 화면 아래 깔려 있다가, 스크롤 시 상단 고정) */}
            <Header/>
            <Worldview/>
            <Routine/>
            <Extra/>
            <Footer/>
        </div>
    );
};

export default App;
