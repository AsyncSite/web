// src/App.tsx
import React from 'react';
import Footer from './components/layout/Footer';
import Intro from './components/sections/Intro/Intro';
import About from './components/sections/About/About';
import Routine from './components/sections/Routine/Routine';

import './App.css';
import FAQ from "./components/sections/FAQ/FAQ";
import Contribution from "./components/sections/Contribution/Contribution";

const App: React.FC = () => {
    return (
        <div className="App">

            <Intro/>
            <About/>
            <Routine/>
            <FAQ/>
            <Contribution/>
            <Footer/>
        </div>
    );
};

export default App;
