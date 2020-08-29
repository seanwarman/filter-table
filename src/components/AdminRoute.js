import React from "react";
import { Route } from "react-router-dom";
import NotFound from "../containers/NotFound";

export default ({ component: C, props: cProps, path: cPath }) => {
  return (
    <Route
      path={cPath}
      render={props => (
        cProps.user.accessLevel === 'Admin' ? 
        <C {...props} {...cProps} />
        : 
        <Route component={NotFound} />
      )}
    />
  )

}