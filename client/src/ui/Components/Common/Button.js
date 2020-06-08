import React from "react";

export default ({ children, ...props }) => <input type="button" value={children} {...props} />;