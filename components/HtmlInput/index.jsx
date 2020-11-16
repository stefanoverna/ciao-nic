import React, { useCallback } from "react";
import RichTextEditor from "react-rte";

const HtmlInput = ({ value, onChange }) => {
  if (typeof window === 'undefined') {
    return <span />;
  }

  const handleChange = useCallback((newValue) => {
    onChange(newValue.toString("html"));
  });

  return (
    <RichTextEditor
      value={RichTextEditor.createValueFromString(value, "html")}
      onChange={handleChange}
    />
  );
};

export default HtmlInput;
