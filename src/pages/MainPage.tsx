import '../styles/common.css';
import { BottomNavigation, Footer } from '../components/layout';
import {About, Contribution, FAQ, Intro, Roadmap, Stats, Activities, Studies, Flow, CTA} from '../components/sections';

const MainPage = () => {
  return (
    <div className="App">
      <Intro />
      <About />
      <Stats />
      <Roadmap />
      <Activities />
      <Flow />
      <Studies />
      <CTA />
      <FAQ />
      <Contribution />
      <Footer />
      <BottomNavigation />
    </div>
  );
};
export default MainPage;
