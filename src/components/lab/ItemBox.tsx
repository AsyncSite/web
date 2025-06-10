import './ItemBox.css';
import { Link } from 'react-router';

interface Props {
    title: string;
    description: string;
    imageUrl?: string;
    link?: string;
}

const ItemBox = ({ title, description, imageUrl, link }: Props) => {
    return (
        <div className="item-box">
            {imageUrl && (
                <div className="item-box-image">
                    <img src={process.env.PUBLIC_URL + imageUrl} alt={title} />
                </div>
            )}
            <div className="item-box-content">
                <h3 className="item-box-title">{title}</h3>
                <p className="item-box-description">{description}</p>
                {link && (
                    <Link to={link} className="item-box-link">
                        자세히 보기 →
                    </Link>
                )}
            </div>
        </div>
    );
};

export default ItemBox; 