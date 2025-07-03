import { Outlet } from "react-router-dom";
import EnhancedHeader from "./EnhancedHeader";


const SubContentsTemplate = () => {
    return (
        <div className='bg-[#0B0F19] min-h-screen'>
            <EnhancedHeader />
            <div className="pt-20">
                <Outlet />
            </div>
        </div>
    )
}
export default SubContentsTemplate;