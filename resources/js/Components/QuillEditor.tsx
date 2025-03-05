import React, { forwardRef } from "react";
import ReactQuill, { ReactQuillProps } from "react-quill";

const QuillEditor = forwardRef<ReactQuill, ReactQuillProps>((props, ref) => (
    <ReactQuill ref={ref as React.LegacyRef<ReactQuill>} {...props} />
));

export default QuillEditor;
