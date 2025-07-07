import './ItemBox.css';
import { Link } from 'react-router';

interface Props {
  title: string;
  description: string;
  imageUrl?: string;
  link?: string;
}

const ItemBox = ({ title, description, imageUrl, link }: Props) => {
  const content = (
    <>
      {imageUrl && (
        <div className="item-box-image">
          <img src={process.env.PUBLIC_URL + imageUrl} alt={title} />
        </div>
      )}
      <div className="item-box-content">
        <h3 className="item-box-title">{title}</h3>
        <p className="item-box-description">{description}</p>
      </div>
    </>
  );

  if (link) {
    return (
      <Link to={link} className="item-box clickable">
        {content}
      </Link>
    );
  }

  return <div className="item-box">{content}</div>;
};

export default ItemBox;
