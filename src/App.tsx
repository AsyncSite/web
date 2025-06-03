// src/App.tsx
import React from 'react';
import Footer from './components/layout/Footer';
import Intro from './components/sections/Intro';
import About from './components/sections/About';
import Worldview from './components/sections/Worldview';
import Routine from './components/sections/Routine';
import Extra from './components/sections/Extra';

import './App.css';
import FAQ from "./components/sections/FAQ";

const App: React.FC = () => {
    return (
        <div className="App">

            <Intro/>
            <About/>
            <Routine/>
            <FAQ/>

            <Footer/>
        </div>
    );
};

export default App;
