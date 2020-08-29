import React from 'react'
import { Route, Switch } from 'react-router-dom'
import NotFound from './containers/NotFound'
import AppliedRoute from './components/AppliedRoute'
import AdminRoute from './components/AdminRoute'
import Customers from './containers/console/customers/Customers'
import ViewCustomer from './containers/console/customers/ViewCustomer'
import Services from './containers/console/services/Services'
import ViewService from './containers/console/services/ViewService'
import Templates from './containers/notify/templates/Templates'
import ViewTemplate from './containers/notify/templates/ViewTemplate'
import Emails from './containers/notify/emails/Emails'
import Sites from './containers/siteping/Sites'
import NewTemplate from './containers/notify/templates/NewTemplate'
import Partners from './containers/console/partners/Partners'
import ViewPartner from './containers/console/partners/ViewPartner'
import SiteSpotTemplates from './containers/sitespot/templates/SiteSpotTemplates'
import SiteSpotViewTemplate from './containers/sitespot/templates/SiteSpotViewTemplate'
import SiteSpotNewTemplate from './containers/sitespot/templates/SiteSpotNewTemplate'
import Chat from './containers/sitespot/Chat'
import BookingDivisions from './containers/booking-hub/divisions/Divisions'
import BookingViewDivision from './containers/booking-hub/divisions/ViewDivision'
import BookingHubTemplate from './containers/booking-hub/templates/Template'
import Calc from './containers/social/Calc'
import Analytics from './containers/traki/Analytics'
import Calls from './containers/traki/Calls'
import TrakiEmails from './containers/traki/Emails'
import TrakiForms from './containers/traki/Forms'
import TrakiWebsites from './containers/traki/Websites'
import Campaigns from './containers/campaign-hub/campaigns/Campaigns'
import ViewCampaign from './containers/campaign-hub/campaigns/ViewCampaign'
import BookingTemplates from './containers/campaign-hub/booking-templates/BookingTemplates'
import EditBookingTemplate from './containers/campaign-hub/booking-templates/Edit'
import TemplateForm from './containers/campaign-hub/booking-templates/Form'
import Products from './containers/campaign-hub/products/Products'
import Packages from './containers/campaign-hub/packages/Packages'
import ViewPackage from './containers/campaign-hub/packages/ViewPackage'
import Stats from './containers/siteping/components/Stats'
import RankOverview from './containers/rankspot/Overview'
import RankWebsites from './containers/rankspot/Websites'
import HomeRoute from './components/HomeRoute'
import SeoDivisions from './containers/campaign-hub/divisions/Divisions'
import SeoViewDivision from './containers/campaign-hub/divisions/ViewDivision'
import SeoViewTabBuilder from './containers/campaign-hub/divisions/tabs/ViewTabBuilder'
import Users from './containers/console/users/Users'
import ViewUser from './containers/console/users/ViewUser'
import Table from './components/Bookings/Views/Table'
import Form from './components/Bookings/Views/Form'
import Booking from './components/Bookings/Views/Booking'
import Archive from './containers/booking-hub/Archive'
import UnitTracker from './containers/reports/UnitTracker'
import ContentCapacityPlanner from './containers/reports/content-capacity-planner/ContentCapacityPlanner'
import Benchmarks from './containers/reports/Benchmarks'
import Benchmark from './containers/reports/benchmark/Benchmark'

import BookingsFilter from './features/bookings-filter/BookingsFilter'

export default ({ childProps }) => {
  return (
    <Switch>
      { /* DEFAULT PATH */}
      <HomeRoute path="/" exact props={childProps} />

      { /* CONSOLE */}
      <AppliedRoute path="/console/services" exact component={Services} props={childProps} />
      <AppliedRoute path="/console/services/:serviceKey" exact component={ViewService} props={childProps} />
      <AppliedRoute path="/console/customers" exact component={Customers} props={childProps} />
      <AppliedRoute path="/console/customers/:customerKey" exact component={ViewCustomer} props={childProps} />
      <AppliedRoute path="/console/partners" exact component={Partners} props={childProps} />
      <AppliedRoute path="/console/partners/:partnerKey" exact component={ViewPartner} props={childProps} />
      <AppliedRoute path="/console/users" exact component={Users} props={childProps} />
      <AppliedRoute path="/console/users/:userKey" exact component={ViewUser} props={childProps} />

      { /* SITEPING */}
      <AppliedRoute path="/siteping/sites" exact component={Sites} props={childProps} />
      <AppliedRoute path="/siteping/stats/:sitepingKey" exact component={Stats} props={childProps} />

      { /* NOTIFY */}
      <AdminRoute path="/notify/templates" exact component={Templates} props={childProps} />
      <AdminRoute path="/notify/templates/new" exact component={NewTemplate} props={childProps} />
      <AdminRoute path="/notify/templates/:templateKey" exact component={ViewTemplate} props={childProps} />
      <AdminRoute path="/notify/emails" exact component={Emails} props={childProps} />

      { /* BOOKING HUB */}
      <AdminRoute path="/bookinghub/divisions" exact component={BookingDivisions} props={childProps} />
      <AdminRoute path="/bookinghub/divisions/:bookingDivKey" exact component={BookingViewDivision} props={childProps} />
      <AdminRoute path="/bookinghub/divisions/template/:tmpKey" exact component={BookingHubTemplate} props={childProps} />

      {/* TODO: I don't think this route is needed anymore, if not delete the BookingHubForm component as well */}
      {/* <AdminRoute path="/bookinghub/bookings/form" exact component={BookingHubForm} props={childProps} /> */}

      <AppliedRoute path="/archive" exact component={Archive} props={childProps} />

      <Route
        exact
        path="/bookings-filter/bookings"
        render={props => {
          return <BookingsFilter changeHeader={childProps.changeHeader}></BookingsFilter>
        }}
      ></Route>


      { 
        childProps.bookingDivisions.map((div, i) => ( 
          <Route
            exact
            key={'bookingTable' + i}
            path={`/${div.bookingDivName.toLowerCase().split(' ').join('')}/bookings`}
            render={props => ( 
              <Table
                {...props}
                {...childProps}
                icon={div.icon}
                bookingDivKey={div.bookingDivKey}
                bookingDivName={div.bookingDivName}
                slugName={div.bookingDivName.toLowerCase().split(' ').join('')}
              /> 
            )}
          /> 
        )) 
      } 
      { 
        childProps.bookingDivisions.map((div, i) => ( 
          <Route
            exact
            key={'bookingForm' + i}
            path={`/${div.bookingDivName.toLowerCase().split(' ').join('')}/bookings/form`}
            render={props => ( 
              <Form
                {...props}
                {...childProps}
                icon={div.icon}
                bookingDivKey={div.bookingDivKey}
                bookingDivName={div.bookingDivName}
                slugName={div.bookingDivName.toLowerCase().split(' ').join('')}
              /> 
            )}
          /> 
        )) 
      } 
      { 
        childProps.bookingDivisions.map((div, i) => ( 
          <Route
            exact
            key={'bookingBooking' + i}
            path={`/${div.bookingDivName.toLowerCase().split(' ').join('')}/bookings/booking/:bookingsKey`}
            render={props => ( 
              <Booking
                {...props}
                {...childProps}
                icon={div.icon}
                bookingDivKey={div.bookingDivKey}
                bookingDivName={div.bookingDivName}
                slugName={div.bookingDivName.toLowerCase().split(' ').join('')}
              /> 
            )}
          /> 
        )) 
      } 

      { /* CAMPAIGNHUB */}
      <AppliedRoute path="/campaign-hub/divisions" exact component={SeoDivisions} props={childProps} />
      <AppliedRoute path="/campaign-hub/divisions/:campaignDivKey" exact component={SeoViewDivision} props={childProps} />
      <AppliedRoute path="/campaign-hub/divisions/:campaignDivKey/tab/:divTabsKey" exact component={SeoViewTabBuilder} props={childProps} />
      <AppliedRoute path="/campaign-hub/products" exact component={Products} props={childProps} />
      <AppliedRoute path="/campaign-hub/packages" exact component={Packages} props={childProps} />
      <AppliedRoute path="/campaign-hub/packages/:packageKey" exact component={ViewPackage} props={childProps} />
      <AppliedRoute path="/campaign-hub/campaigns" exact component={Campaigns} props={childProps} />
      <AppliedRoute path="/campaign-hub/campaigns/:campaignKey" exact component={ViewCampaign} props={childProps} />
      <AppliedRoute path="/campaign-hub/booking-templates" exact component={BookingTemplates} props={childProps} />
      <AppliedRoute path="/campaign-hub/booking-templates/form" exact component={TemplateForm} props={childProps} />
      <AppliedRoute path="/campaign-hub/booking-templates/:bookingTmpKey" exact component={EditBookingTemplate} props={childProps} />

      { /* SOCIAL */}
      <AppliedRoute path="/social/calc" exact component={Calc} props={childProps} />

      { /* TRAKI */}
      <AppliedRoute path="/traki/analytics" exact component={Analytics} props={childProps} />
      <AppliedRoute path="/traki/calls" exact component={Calls} props={childProps} />
      <AppliedRoute path="/traki/emails" exact component={TrakiEmails} props={childProps} />
      <AppliedRoute path="/traki/forms" exact component={TrakiForms} props={childProps} />
      <AppliedRoute path="/traki/websites" exact component={TrakiWebsites} props={childProps} />

      { /* REPORTS */}
      <AppliedRoute path="/reports/UnitTracker" exact component={UnitTracker} props={childProps} />
      <AppliedRoute path="/reports/content-capacity-planner" exact component={ContentCapacityPlanner} props={childProps} />
      <AppliedRoute path="/reports/benchmarks/:page?/:customerSiteKey?/:benchmarksKey?" exact component={Benchmarks} props={childProps} />
      <AppliedRoute path="/reports/benchmark/:benchmarksKey" component={Benchmark} props={childProps} />

      { /* RANKSPOT */}
      <AppliedRoute path="/rankspot/overview" exact component={RankOverview} props={childProps} />
      <AppliedRoute path="/rankspot/websites" exact component={RankWebsites} props={childProps} />

      { /* SITESPOT */}
      <AppliedRoute path="/sitespot/chat" exact component={Chat} props={childProps} />
      <AppliedRoute path="/sitespot/templates" exact component={SiteSpotTemplates} props={childProps} />
      <AppliedRoute path="/sitespot/templates/new" exact component={SiteSpotNewTemplate} props={childProps} />
      <AppliedRoute path="/sitespot/templates/:templateKey" exact component={SiteSpotViewTemplate} props={childProps} />

      <Route path="/notfound" component={NotFound} />
      { /* Finally, catch all unmatched routes */}
      <Route component={NotFound} />
    </Switch>
  )
}
