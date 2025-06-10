import { Outlet } from "react-router-dom";
import TemplateHeader from "./TemplateHeader";


const SubContentsTemplate = () => {
    return (
        <div className=''>
            <TemplateHeader />
            <Outlet />
        </div>
    )
}
export default SubContentsTemplate;