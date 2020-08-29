import React from "react";
import { Route } from "react-router-dom";

export default ({props: cProps, component: C, path: cPath}) => {
    return <Route path={cPath} render={props => <C {...props} {...cProps} />} />;
}
