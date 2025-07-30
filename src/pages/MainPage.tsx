import '../styles/common.css';
import { Footer } from '../components/layout';
import {About, Calendar, Contribution, FAQ, Intro, Journey, Stats, Studies, CTA} from '../components/sections';

const MainPage = () => {
  return (
    <div className="App">
      <Intro />
      <About />
      <Stats />
      <Journey />
      <Studies />
      <Calendar />
      <FAQ />
      <CTA />
      <Contribution />
      <Footer />
    </div>
  );
};
export default MainPage;
