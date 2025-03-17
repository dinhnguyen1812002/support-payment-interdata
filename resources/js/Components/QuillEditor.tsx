import React, { forwardRef } from "react";
import ReactQuill, { ReactQuillProps } from "react-quill";
import "react-quill/dist/quill.snow.css";

// Define the props interface extending ReactQuillProps
interface QuillEditorProps extends ReactQuillProps {
    value: string;
    onChange: (value: string) => void;
}

// Use forwardRef with proper typing
const QuillEditor = forwardRef<ReactQuill, QuillEditorProps>(
    ({ value, onChange, ...props }, ref) => (
        <ReactQuill ref={ref} value={value} onChange={onChange} {...props} />
    )
);

export default QuillEditor;
