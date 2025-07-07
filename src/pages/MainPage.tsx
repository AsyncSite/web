import { Footer } from '../components/layout';
import { About, Contribution, FAQ, Intro, Routine } from '../components/sections';

const MainPage = () => {
  return (
    <div className="App">
      <Intro />
      <About />
      <Routine />
      <FAQ />
      <Contribution />
      <Footer />
    </div>
  );
};
export default MainPage;
