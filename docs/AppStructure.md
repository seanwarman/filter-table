# Application Structure

This is the structure I'm currently attempting to enforce in BMS.
If you find anything outside of the following pattern it can be 
generally considered to be deprecated and in need of updating.

The folders in the root should look like:

```
▸ public/                     <-- The Public folder for all client-side files.
▸ src/                        <-- The main folder containing all business code.
▸ node_modules/               <-- npm modules.
▸ package-lock.json
▸ package.json
▸ bitbucket-pipelines.yml     <-- auto builds the frontent to our dev or staging 
                                servers depending on the current git branch 
                                (dev of staging).
```

## src

```
▾ src/
  ▸ actions/                  <-- Endpoint actions, functions for each
                                  API call separated, generally, to 
                                  match the sidebar in the UI.
  ▸ components/               <-- React components, to be used anywhere
                                  in the project.
  ▸ containers/               <-- React components separated in relation
                                  to the sidebar in the UI.
  ▸ helpers/                  <-- Utility functions.    
  ▸ libs/                     <-- Library functions assorted. This also
                                  includes configuration files. 
  ▸ mixins/                   <-- Holds a few UI related objects that are
                                  too trivial to be saved to the db.
    App.js                    <-- Top level component, this includes the
                                  sidebar as well as the global props
                                  definitions.
    Routes.js                 <-- Router for all the container
                                  components and their paths.
    index.js                  <-- Entrypoint.
```

## src/actions

```
▾ actions/
  ▾ booking-hub/              
      Actions.js              <-- Mainly just function definitions.
      Queries.js              <-- Jsequel query objects for each action.
      Handlers.js             <-- More complex functionality associated
  ▾ campaign-hub/                 with an action, if needed.
      Actions.js
      Queries.js
```

## src/containers

```
▾ containers/                 <-- Each item in containers is loosely
  ▸ booking-hub/                  associated with a sidebar option in 
  ▸ campaign-hub/                 the main UI of the app.
  ▸ console/  
  ▸ notify/                       These could also be thought of as
  ▸ partners/                     views.
  ▸ rankspot/  
  ▸ siteping/  
  ▸ sitespot/  
  ▸ social/
  ▸ traki/
```
