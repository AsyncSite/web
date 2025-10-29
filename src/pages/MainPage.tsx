import '../styles/common-landing.css';
import { Footer } from '../components/layout';
import {About, Contribution, FAQ, Intro, Journey, Stats, Studies, CTA} from '../components/sections';
import studyService, {Study} from "../api/studyService";
import {useEffect, useState} from "react";
import {getStudyDisplayInfo} from "../utils/studyStatusUtils";
import {parseDate} from "../utils/studyScheduleUtils";

const MainPage = () => {

    const [allStudies, setAllStudies] = useState<Study[]>([]);
    const [activeStudies, setActiveStudies] = useState<Study[]>([]);

    useEffect(() => {
        init();
    }, []);

    const init = async () => {
        const allStudies = await studyService.getAllStudies();
        // 활성 스터디: 모집 중, 시작 예정, 진행 중인 스터디
        const now = new Date();
        const activeStudies = allStudies.filter(study => {
            const displayInfo = getStudyDisplayInfo(
                study.status,
                study.deadline instanceof Date ? study.deadline.toISOString() : study.deadline,
                study.startDate instanceof Date ? study.startDate.toISOString() : study.startDate,
                study.endDate instanceof Date ? study.endDate.toISOString() : study.endDate,
                study.capacity,
                study.enrolled,
                study.isRecruiting
            );

            // 모집중 또는 진행중
            if (displayInfo.canApply || displayInfo.isActive) return true;

            // 시작예정 (모집 마감됐지만 아직 시작 안함)
            const startDate = parseDate(study.startDate);
            if (study.status === 'APPROVED' && !displayInfo.canApply && startDate && startDate > now) {
                return true;
            }
            return false;
        });
        setAllStudies(allStudies);
        setActiveStudies(activeStudies);
    }

  return (
    <div className="App">
      <Intro />
      <About />
      <Stats studies={activeStudies}/>
      {/*<Journey />*/}
      <Studies studies={allStudies}/>
      <FAQ />
      <CTA />
      {/*<Contribution />*/}
      <Footer />
    </div>
  );
};
export default MainPage;
