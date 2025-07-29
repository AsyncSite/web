import '../styles/common.css';
import { Footer } from '../components/layout';
import {About, Contribution, FAQ, Intro, Roadmap, Stats, Studies, CTA} from '../components/sections';

const MainPage = () => {
  return (
    <div className="App">
      <Intro />
      <About />
      <Stats />
      <Roadmap />
      <Studies />
      <FAQ />
      <CTA />
      <Contribution />
      <Footer />
    </div>
  );
};
export default MainPage;
