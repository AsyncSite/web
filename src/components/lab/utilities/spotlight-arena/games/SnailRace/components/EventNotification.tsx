import './EventNotification.css';

interface EventNotificationProps {
  snailName: string;
  eventName: string;
}

const EventNotification: React.FC<EventNotificationProps> = ({ snailName, eventName }) => {
  return (
    <div className="event-notification">
      <div className="event-content">
        <span className="event-snail">{snailName}</span>
        <span className="event-text">{eventName}!</span>
      </div>
    </div>
  );
};

export default EventNotification;
