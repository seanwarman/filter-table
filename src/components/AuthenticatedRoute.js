import React from "react";
import { Route, Redirect } from "react-router-dom";

export default ({ component: C, props: cProps, path: cPath }) =>
    <Route
        path={cPath}
        render={props =>
            cProps.isAuthenticated
                ? <C {...props} {...cProps} />
                : <Redirect
                    to={`/console/customers`}
                />}
    />;