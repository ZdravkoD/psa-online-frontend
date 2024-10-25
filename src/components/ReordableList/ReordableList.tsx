import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ReorderIcon from '@mui/icons-material/Reorder';
import DeleteIcon from '@mui/icons-material/Delete';
import Divider from '@mui/material/Divider';
import { CssBaseline, IconButton } from '@mui/material';

interface SortableItemProps {
    id: string;
    text: string;
    secondaryAction: any;
}

function SortableItem({ id, text, secondaryAction }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        backgroundColor: isDragging ? '#e0e0e0' : 'white',
        border: isDragging ? '2px solid #3f51b5' : 'none',
        borderRadius: 4,
        cursor: isDragging ? 'grabbing' : 'pointer',
        display: 'flex',
        alignItems: 'center',
    };

    return (
        <>
            <ListItem ref={setNodeRef} style={style} {...attributes} secondaryAction={secondaryAction}>
                <ListItemIcon {...listeners}>
                    <ReorderIcon />
                </ListItemIcon>
                <ListItemText primary={text} />
            </ListItem>
            <Divider />
        </>
    );
}

interface ReorderableListProps {
    initialItems: { id: string; text: string }[];
    onReorder: (newOrder: { id: string; text: string }[]) => Promise<Error | void>;
}

export default function ReorderableList({ initialItems, onReorder }: ReorderableListProps) {
    const [items, setItems] = useState(initialItems);

    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = items.findIndex((item) => item.id === active.id);
            const newIndex = items.findIndex((item) => item.id === over.id);
            const newItems = arrayMove(items, oldIndex, newIndex);
            // setItems(newItems);
            setItems(newItems);
            const error = await onReorder(newItems);
            if (error) {
                setItems(items);
            }
        }
    };

    return (
        <>
            <CssBaseline />
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={items.map(item => item.id)}>
                    <List style={{ padding: 8, borderRadius: 4, backgroundColor: '#f3f4f6' }}>
                        {items.map((item, index) => (
                            <SortableItem key={item.id} id={item.id} text={item.text} secondaryAction={
                                <IconButton edge="end" aria-label="delete" onClick={async (e) => {
                                    e.stopPropagation();
                                    const newItems = items.filter((_, i) => i !== index);
                                    setItems(newItems);
                                    const error = await onReorder(newItems);
                                    if (error) {
                                        setItems(items);
                                    }
                                    }}>
                                    <DeleteIcon />
                                </IconButton>
                            }/>
                        ))}
                    </List>
                </SortableContext>
            </DndContext>
        </>
    );
}
