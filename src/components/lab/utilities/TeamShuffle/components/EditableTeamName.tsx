import React, { useState, useRef, useEffect } from 'react';
import './EditableTeamName.css';

interface EditableTeamNameProps {
    teamName: string;
    teamId: string;
    onNameChange: (teamId: string, newName: string) => void;
}

export const EditableTeamName: React.FC<EditableTeamNameProps> = ({
    teamName,
    teamId,
    onNameChange
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(teamName);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setEditValue(teamName);
    }, [teamName]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleStartEdit = () => {
        setIsEditing(true);
        setEditValue(teamName);
    };

    const handleSave = () => {
        if (editValue.trim() && editValue !== teamName) {
            onNameChange(teamId, editValue.trim());
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditValue(teamName);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                className="team-name-input"
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                maxLength={30}
            />
        );
    }

    return (
        <h4 
            className="team-name editable"
            onClick={handleStartEdit}
            title="클릭하여 팀 이름 편집"
        >
            {teamName}
            <span className="edit-icon">✏️</span>
        </h4>
    );
};