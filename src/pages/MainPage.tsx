import '../styles/common.css';
import { Footer } from '../components/layout';
import {About, Contribution, FAQ, Intro, Journey, Stats, Studies, CTA} from '../components/sections';

const MainPage = () => {
  return (
    <div className="App">
      <Intro />
      <About />
      <Stats />
      <Journey />
      <Studies />
      <FAQ />
      <CTA />
      <Contribution />
      <Footer />
    </div>
  );
};
export default MainPage;
